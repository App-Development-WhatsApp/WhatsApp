import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export const getVideoDuration = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error, metadata: any) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
};

// Function to split video into chunks of 20s after trimming based on start and end time
export const splitVideo = async(filePath: string, startTime: number, endTime: number, segmentLength = 20): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join("temp_chunks", path.basename(filePath, path.extname(filePath)));
    fs.mkdirSync(outputDir, { recursive: true });

    const duration = endTime - startTime;
    const trimmedVideoPath = path.join(outputDir, 'trimmed.mp4');

    // Trim the video
    ffmpeg(filePath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(trimmedVideoPath)
      .on('end', async () => {
        // Check if duration after trimming is greater than 20 seconds
        if (duration > segmentLength) {
          // Split into 20-second chunks if video length is more than 20 seconds
          ffmpeg(trimmedVideoPath)
            .output(path.join(outputDir, 'chunk_%03d.mp4'))
            .outputOptions([
              `-c copy`,
              `-map 0`,
              `-segment_time ${segmentLength}`,
              `-f segment`
            ])
            .on('end', async () => {
              const chunkFiles = fs.readdirSync(outputDir).map(file => path.join(outputDir, file));
              resolve(chunkFiles);
            })
            .on('error', reject)
            .run();
        } else {
          // If the video is less than 20 seconds, return the trimmed video as a single chunk
          resolve([trimmedVideoPath]);
        }
      })
      .on('error', reject)
      .run();
  });
};
