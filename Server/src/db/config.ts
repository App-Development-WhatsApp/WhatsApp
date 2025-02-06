import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

console.log(process.env.MONGODB_URI)
// Get the MongoDB URI from environment variables
const dbURI = process.env.MONGODB_URI || "";

// Function to connect to MongoDB
const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(dbURI).then(() => {
            console.log("Connected to MongoDB");
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if database connection fails
    }
};

export {connectDB}
