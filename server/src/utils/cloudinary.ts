import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { env } from "./Env";

// Cloudinary configuration
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_CLOUD_KEY,
  api_secret: env.CLOUDINARY_CLOUD_SECRET,
});

// Type definition for the local file path parameter
const uploadOnCloudinary = async (localFilePath: string, public_id?: string): Promise<any | null> => {
  try {
    if (!localFilePath ) {
      console.error("Either localFilePath or fileUrl must be provided.");
      return null;
    }
    console.log("Uploading file to Cloudinary...",localFilePath,env.CLOUDINARY_CLOUD_NAME);

    // Upload the file to Cloudinary
    const uploadSource = localFilePath;

    const response = await cloudinary.uploader.upload(uploadSource, {
      resource_type: "auto",
      public_id,
    }).catch((error: any) => {
      console.log(error);
    });

    // File has been uploaded successfully
    console.log("File is uploaded successfully on Cloudinary", response!.secure_url);

    // Remove the locally saved temporary file after successful upload
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error: any) {
    // Remove the locally saved temporary file in case of failure
    if (localFilePath) {
      fs.unlinkSync(localFilePath);
    }

    // Handle or log the error as necessary
    console.error("Error uploading file to Cloudinary", error);

    return null;
  }
};

const deleteFileFromCloudinary = async (fileUrl: string) => {
  try {
    console.log("Deleting file from Cloudinary...", fileUrl);

    if (!fileUrl) {
      console.error("No file URL provided.");
      return;
    }

    // Step 1: Remove domain till /upload/
    const urlParts = fileUrl.split('/upload/')[1];

    if (!urlParts) {
      console.error("Invalid Cloudinary URL");
      return;
    }

    // Step 2: Remove version
    const urlWithoutVersion = urlParts.split('/').slice(1).join('/');

    // Step 3: Remove file extension
    const publicId = urlWithoutVersion.replace(/\.[^/.]+$/, "");

    console.log("Extracted public_id:", publicId);

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log("File deleted from Cloudinary:", response);
    return response;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFileFromCloudinary };
