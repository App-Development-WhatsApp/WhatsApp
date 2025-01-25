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
const uploadOnCloudinary = async (localFilePath: string): Promise<any | null> => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // auto means for every type of file
    });

    // File has been uploaded successfully
    console.log("File is uploaded successfully on Cloudinary", response.url);

    // Remove the locally saved temporary file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error:any) {
    // Remove the locally saved temporary file in case of failure
    if (localFilePath) {
      fs.unlinkSync(localFilePath);
    }

    // Handle or log the error as necessary
    console.error("Error uploading file to Cloudinary", error);

    return null;
  }
};

export { uploadOnCloudinary };
