import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

/**
 * Splits a video into chunks of given duration (default 30s) and uploads them.
 * @param filePath Path to the uploaded video
 * @param fileName Name of the uploaded video
 * @param uploadFunction Function to upload a chunk (e.g., to Cloudinary)
 * @param chunkDuration Duration of each chunk in seconds (default 30)
 * @returns Array of URLs of uploaded chunks
 */
export const splitAndUploadVideo = async (
    filePath: string,
    fileName: string,
    uploadFunction: (filePath: string, fileName: string) => Promise<any>,
    chunkDuration: number = 30
): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const fileExt = path.extname(fileName).toLowerCase();
    const baseFileName = path.basename(fileName, fileExt);
    const outputDir = path.join(__dirname, '../../uploads/chunks');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Splitting video into chunks...');

    await new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .format('segment')
            .outputOptions([
                `-segment_time ${chunkDuration}`,
                '-c copy'
            ])
            .output(path.join(outputDir, `${baseFileName}_chunk_%03d${fileExt}`))
            .on('end', () => {
                console.log('Splitting done.');
                resolve(null);
            })
            .on('error', (err) => {
                console.error('Error while splitting video:', err);
                reject(err);
            })
            .run();
    });

    const chunkFiles = fs.readdirSync(outputDir)
        .filter(f => f.startsWith(baseFileName) && f.endsWith(fileExt));

    for (const chunkFile of chunkFiles) {
        const chunkPath = path.join(outputDir, chunkFile);
        const uploadResponse = await uploadFunction(chunkPath, chunkFile);
        if (uploadResponse) {
            uploadedUrls.push(uploadResponse.secure_url);
        }
    }

    return uploadedUrls;
};
