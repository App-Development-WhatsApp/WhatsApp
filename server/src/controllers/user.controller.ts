import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from 'express';
import { ApiError } from "../utils/APIError";
import { ApiResponse } from "../utils/APIResponse";
//  this user can interact with mongodb because it has made a connection
import { User } from "../model/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";



export const registerUser = asyncHandler(async (req: any, res: Response) => {
    const { username, phoneNumber } = req.body;

    if ([username, phoneNumber].some((field) => field?.trim() === "")) {
        return new ApiError(400, "All fields are required");
    }

    const userId = await User.findOne({ phoneNumber }).select("_id");

    if (userId) {
        return res.json(new ApiResponse(
            400,
            "User Already Exist"
        ))
    }
    let avatarUrl = "";
    if (req.files && req.files.file) {
        const localFilePath = req.files.file.tempFilePath;
        const avatar = await uploadOnCloudinary(localFilePath, `users/${username}/file`);

        if (!avatar) {
            return res.json(new ApiResponse(400, "Error from Server, Try After Some Time"));
        }

        avatarUrl = avatar.secure_url;
    }

    const newUser = await User.create({
        username,
        phoneNumber,
        image: avatarUrl || "", // You can also add a fallback URL
    });
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.json(new ApiResponse(
        200,
        "User Logged in successfully",
        {
            user: newUser,
        },
    ))
});


export const UploadFiles = asyncHandler(async (req: any, res: Response) => {
    try {
        console.log('Request Files:');
        if (!req.files || !req.files.files) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const uploadedFiles = Array.isArray(req.files.files)
            ? req.files.files
            : [req.files.files];
        console.log('Uploaded Files:', uploadedFiles);
        const uploadedUrls: any = [];

        // Upload each file to Cloudinary
        for (const file of uploadedFiles) {
            console.log('File:', file);
            const cloudinaryResponse = await uploadOnCloudinary(file.tempFilePath, file.name);
            if (cloudinaryResponse) {
                uploadedUrls.push(cloudinaryResponse.secure_url);
            }
        }
        console.log('Uploaded URLs:', uploadedUrls);
        return res.json(new ApiResponse(
            200,
            'Files uploaded successfully',
            {
                data: uploadedUrls,
            }
        ))

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

export const GetAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}, "username image phoneNumber _id");
    console.log("users", users)
    return res
        .status(200)
        .json(new ApiResponse(200, "All users fetched successfully", users));
});

export const getUserWithId = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate('_id username image phoneNumber');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(new ApiResponse(
            200,
            "User Found Scuccessfully",
            {
                user: user,
            },
        ))
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

