import multer, { StorageEngine } from "multer";
import { Request, Response } from "express";

// Define a custom storage engine using multer's diskStorage
const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) {
    // The folder where uploaded files will be stored
    cb(null, './public/temp');
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) {
    // Using the original file name (for development or Cloudinary usage, modify for production)
    cb(null, file.originalname);
  }
});

// Export the upload middleware with the specified storage configuration
export const upload = multer({ storage });
