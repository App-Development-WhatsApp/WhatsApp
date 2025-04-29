import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from 'express';
import { ApiError } from "../utils/APIError";
import { ApiResponse } from "../utils/APIResponse";
import { User } from "../model/user.model";
import { deleteFileFromCloudinary, uploadOnCloudinary, } from "../utils/cloudinary";
import path from 'path';
import { splitAndUploadVideo } from "../utils/Ffmpeg";
import { Status } from "../model/status.model"; // adjust path as needed
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

export const DeleteFiles = asyncHandler(async (req: any, res: Response) => {
    try {
      const { uris } = req.body;
  
      if (!uris || !Array.isArray(uris) || uris.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No URIs provided for deletion',
        });
      }
  
      const deleteResults = [];
  
      for (const uri of uris) {
        const result = await deleteFileFromCloudinary(uri);
        if (result?.success) {
          deleteResults.push({ uri, success: true });
        } else {
          deleteResults.push({ uri, success: false });
        }
      }
  
      return res.json(new ApiResponse(
        200,
        'Files deletion process completed',
        {
          results: deleteResults,
        }
      ));
  
    } catch (error: any) {
      console.error('Deletion error:', error);
      res.status(500).json({ message: 'Server error during deletion' });
    }
  });
  
export const GetAllUsers = asyncHandler(async (req, res) => {
    const {id}=req.body
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

export const demoroute = asyncHandler(async (req: any, res: Response) => {
    try {
        console.log('Request Files:', req.body);

        if (!req.files || (!req.files.files && !req.files.file)) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const filesArray = req.files.files || req.files.file;
        const uploadedFiles = Array.isArray(filesArray) ? filesArray : [filesArray];

        console.log('Uploaded Files:', uploadedFiles);
        const uploadedUrls: string[] = [];

        for (const file of uploadedFiles) {
            console.log('Processing File:', file.name);

            const filePath = file.tempFilePath;
            const fileExt = path.extname(file.name).toLowerCase();

            const isVideo = ['.mp4', '.mov', '.avi', '.mkv'].includes(fileExt);

            if (isVideo) {
                const videoUrls = await splitAndUploadVideo(filePath, file.name, uploadOnCloudinary);
                uploadedUrls.push(...videoUrls);
            } else {
                const cloudinaryResponse = await uploadOnCloudinary(filePath, file.name);
                if (cloudinaryResponse) {
                    uploadedUrls.push(cloudinaryResponse.secure_url);
                }
            }
        }

        console.log('Uploaded URLs:', uploadedUrls);

        return res.json(new ApiResponse(
            200,
            'Files uploaded successfully',
            { data: uploadedUrls }
        ));

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


export const uploadStatus = asyncHandler(async (req: any, res: Response) => {
    try {
      const { id } = req.body;
      const files = req.files?.media;
  
      if (!id || !files) {
        return res.status(400).json({
          success: false,
          message: 'ID and media files are required.',
        });
      }
  
      // Build metaData array from flattened keys like meta[0][type]
      const metaData: any[] = [];
      const body = req.body;
  
      Object.keys(body).forEach((key) => {
        const match = key.match(/^meta\[(\d+)]\[(\w+)]$/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          if (!metaData[index]) metaData[index] = {};
          metaData[index][field] = body[key];
        }
      });
  
      const uploadedFiles: any[] = [];
      const createdStatusIds: any[] = [];
  
      const uploadFile = async (file: any, metaInfo: any) => {
        const localPath = file.tempFilePath || file.path;
        if (!localPath) throw new Error('Temporary file path not found.');
  
        const fileExt = file.name?.toLowerCase().slice(file.name.lastIndexOf('.')) || '';
        const isVideo = ['.mp4', '.mov', '.avi', '.mkv'].includes(fileExt);
  
        if (isVideo) {
          const chunks = await splitAndUploadVideo(localPath, file.name, uploadOnCloudinary);
  
          for (const url of chunks) {
            const newStatus = await Status.create({
              user: id,
              type: metaInfo.type || 'video',
              caption: metaInfo.caption || '',
              url,
              timestamp: Date.now(),
              start: Number(metaInfo.start || 0),
              end: Number(metaInfo.end || 1000),
              duration: Number(metaInfo.duration || 1000),
            });
  
            createdStatusIds.push(newStatus._id);
            uploadedFiles.push(newStatus);
          }
        } else {
          const cloudinaryResult = await uploadOnCloudinary(localPath);
          if (!cloudinaryResult?.secure_url) throw new Error('Cloudinary upload failed');
          const newStatus = await Status.create({
              user: id,
              type: metaInfo.type || 'image',
              caption: metaInfo.caption || '',
              url: cloudinaryResult.secure_url,
              timestamp: Date.now(),
            });
            console.log(metaInfo,"-------",newStatus)
  
          createdStatusIds.push(newStatus._id);
          uploadedFiles.push(newStatus);
        }
      };
  
      if (Array.isArray(files)) {
        for (let i = 0; i < files.length; i++) {
          await uploadFile(files[i], metaData[i] || {});
        }
      } else {
        await uploadFile(files, metaData[0] || {});
      }
  
      // Push all created status IDs to the user document
      await User.findByIdAndUpdate(id, {
        $push: { statuses: { $each: createdStatusIds } },
      });
  
      return res.status(200).json({
        success: true,
        message: 'Files uploaded and statuses saved successfully!',
        files: uploadedFiles,
      });
  
    } catch (error: any) {
      console.error('Upload Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  });
  
  
  export const getStatuses = asyncHandler(async (req: Request, res: Response) => {
    const { userIds } = req.body;
  
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array.",
      });
    }
  
    const statuses = await Status.find({
      user: { $in: userIds },
      timestamp: { $gte: Date.now() - 24 * 60 * 60 * 1000 }, // last 24 hours
    })
      .sort({ timestamp: -1 })
      .populate("user", "username image");
  
    res.status(200).json({
      success: true,
      statuses,
    });
  });
  