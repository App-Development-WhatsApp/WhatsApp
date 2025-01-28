"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Define a custom storage engine using multer's diskStorage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // The folder where uploaded files will be stored
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        // Using the original file name (for development or Cloudinary usage, modify for production)
        cb(null, file.originalname);
    }
});
// Export the upload middleware with the specified storage configuration
exports.upload = (0, multer_1.default)({ storage });
