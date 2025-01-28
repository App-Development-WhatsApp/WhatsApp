"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const Env_1 = require("./Env");
// Cloudinary configuration
cloudinary_1.v2.config({
    cloud_name: Env_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: Env_1.env.CLOUDINARY_CLOUD_KEY,
    api_secret: Env_1.env.CLOUDINARY_CLOUD_SECRET,
});
// Type definition for the local file path parameter
const uploadOnCloudinary = (localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!localFilePath)
            return null;
        // Upload the file to Cloudinary
        const response = yield cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: "auto", // auto means for every type of file
        });
        // File has been uploaded successfully
        console.log("File is uploaded successfully on Cloudinary", response.url);
        // Remove the locally saved temporary file after successful upload
        fs_1.default.unlinkSync(localFilePath);
        return response;
    }
    catch (error) {
        // Remove the locally saved temporary file in case of failure
        if (localFilePath) {
            fs_1.default.unlinkSync(localFilePath);
        }
        // Handle or log the error as necessary
        console.error("Error uploading file to Cloudinary", error);
        return null;
    }
});
exports.uploadOnCloudinary = uploadOnCloudinary;
