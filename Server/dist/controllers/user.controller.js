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
exports.getWatchHistory = exports.getuserChannelProfile = exports.updateUserCoverImage = exports.updateUserAvatar = exports.updateAccountdetails = exports.getCurrentUser = exports.changeCurrentPassword = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const APIError_1 = require("../utils/APIError");
const APIResponse_1 = require("../utils/APIResponse");
//  this user can interact with mongodb because it has made a connection
const user_model_1 = require("../models/user.model");
const cloudinary_1 = require("../utils/cloudinary");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const generateAccessAndRefereshTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        // we are using validateBeforeSave kyki hum password (for example ) nahi bhej rahe ,taki wo validation check na kare
        yield user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new APIError_1.ApiError(500, "Something went wrong while generating referesh and access token");
    }
});
// --------------------------Register---------------------------
const registerUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   res.status(200).json({
    //     message: "First project in backend"
    //   });
    var _a, _b;
    // getuser detail from front end
    // validation -not empty etc
    // check if user already exist
    // check forimage and avatar
    // upload them to cloudinary avatar
    // create user object-create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { username, fullName, email, password } = req.body;
    //  You can apply if else for all validation checking
    // if(fullName==="")
    if (
    // matlab ek bhi field khali hui to show this error
    [fullName, email, username, password].some((field) => (field === null || field === void 0 ? void 0 : field.trim()) === "")) {
        throw new APIError_1.ApiError(400, "All fields are required");
    }
    const existedUser = yield user_model_1.User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new APIError_1.ApiError(409, "username already Exists");
    }
    // multur hume req.files ka access de deta hai
    const avatarLocalPath = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.avatar[0]) === null || _b === void 0 ? void 0 : _b.path;
    // let coverImageLocalPath=req.files?.coverImage?.[0]?.path;
    // multer ki madat se wo hame file ka access bhi de deta hai
    let coverImageLocalPath;
    if (req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
        throw new APIError_1.ApiError(400, "Avatar file is required");
    }
    const avatar = yield (0, cloudinary_1.uploadOnCloudinary)(avatarLocalPath);
    const coverImage = yield (0, cloudinary_1.uploadOnCloudinary)(coverImageLocalPath);
    if (!avatar) {
        throw new APIError_1.ApiError(400, "failed to upload on cloudinary avatar file");
    }
    const user = yield user_model_1.User.create({
        fullName,
        avatar: avatar.url,
        // coverimage validation
        coverImage: (coverImage === null || coverImage === void 0 ? void 0 : coverImage.url) || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    const createdUser = yield user_model_1.User.findById(user._id).select(
    //  to escape password and refreshToken because
    "-password -refreshToken");
    if (!createdUser) {
        throw new APIError_1.ApiError(500, "Something went Wrong while registering the user");
    }
    return res
        .status(201)
        .json(new APIResponse_1.ApiResponse(200, createdUser, "User registered Successfully"));
}));
exports.registerUser = registerUser;
// ------------------------------Login------------------------
const loginUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // data from req->body
    // Username email
    //  find the user
    // password check
    // get access and refresh token
    // send cookie
    const { username, email, password } = req.body;
    if (!(username || email)) {
        throw new APIError_1.ApiError(400, "Username and Password are required");
    }
    // or operator find the user by email or username any one of it if found then give response
    const user = yield user_model_1.User.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new APIError_1.ApiError(404, "User does not exist");
    }
    // we use (User ) when we are talking about mongodb inbuild functions and use(user ) when we are using our made user
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new APIError_1.ApiError(401, "INvalid User Credential");
    }
    const { accessToken, refreshToken } = yield generateAccessAndRefereshTokens(user._id);
    const loggedInUser = yield user_model_1.User.findById(user._id).select("-password -refreshToken");
    // Makiing cookies
    // By default cookies is changable from frontend
    const options = {
        // by true this cookkies is only accessable and modifiable   from server side
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new APIResponse_1.ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
    }, "User Logged in successfully"));
}));
exports.loginUser = loginUser;
// ----------------------------LOgOut-------------------------
const logoutUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Here we are using middleware to get access id at the time of logout and accessing cookie by req
    user_model_1.User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
    }, {
        new: true,
    });
    const options = {
        // by true this cookkies is only accessable from server side
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new APIResponse_1.ApiResponse(200, {}, "user Logged Out Successfully"));
}));
exports.logoutUser = logoutUser;
// ----------------------------Refresh Token---------------------------------
const refreshAccessToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingrefreshToken) {
        throw new APIError_1.ApiError(401, "unauthorized request");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.User.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id);
        if (!user) {
            throw new APIError_1.ApiError(401, "Invalid refresh Token");
        }
        if (incomingrefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken)) {
            throw new APIError_1.ApiError(401, " refresh Token expired or used");
        }
        const options = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, newrefreshToken } = yield generateAccessAndRefereshTokens(user._id);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(new APIError_1.ApiError(200, {
            accessToken,
            refreshToken: newrefreshToken,
        }, "Acccess Token refreshed token succesfully"));
    }
    catch (error) {
        throw new APIError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Invalid refresh Token ");
    }
}));
exports.refreshAccessToken = refreshAccessToken;
// ----------------------------changeCurrentPassword ---------------------------------
const changeCurrentPassword = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { oldPassword, newPassword } = req.body;
    // password change kar pa raha hai to wo login to hai malab middleware se wo req.body le sakta hai
    const user = yield user_model_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    const isPasswordCorrect = yield user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect)
        throw new APIError_1.ApiError(400, "Invalid Old Password");
    user.password = newPassword;
    user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIResponse_1.ApiResponse(200, {}, "Password Changed Successfully"));
}));
exports.changeCurrentPassword = changeCurrentPassword;
// ----------------------------getCurrentUser ---------------------------------
const getCurrentUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res
        .status(200)
        .json(new APIResponse_1.ApiResponse(200, req.user, "Current user fetched Successfully"));
}));
exports.getCurrentUser = getCurrentUser;
// ----------------------------updateAccountdetails ---------------------------------
const updateAccountdetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new APIError_1.ApiError(400, "alll field are required");
    }
    const user = user_model_1.User.findByIdAndUpdate((_a = req.user) === null || _a === void 0 ? void 0 : _a._id, {
        $set: {
            fullName,
            email: email,
        },
    }, { new: true }).select("-password");
    return res
        .status(200)
        .json(new APIResponse_1.ApiResponse(200, user, "Account details updated successfully"));
}));
exports.updateAccountdetails = updateAccountdetails;
// ----------------------------updateUserAvatar ---------------------------------
const updateUserAvatar = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // HEre we are using sigle file not as route and register we were taking files instead os file
    const avatarLocalPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!avatarLocalPath)
        throw new APIError_1.ApiError(400, "Avatr file is missing");
    // delete old Image-assignment
    const avatar = yield (0, cloudinary_1.uploadOnCloudinary)(avatarLocalPath);
    if (!avatar.url)
        throw new APIError_1.ApiError(400, "Error while  uploading on Avatar");
    const user = yield user_model_1.User.findByIdAndUpdate((_b = req.user) === null || _b === void 0 ? void 0 : _b._id, {
        $set: {
            avatar: avatar.url,
        },
    }, { new: true }).select("-password");
    return res
        .status(200)
        .json(new APIResponse_1.ApiResponse(200, user, "avatar Updated Successfully"));
}));
exports.updateUserAvatar = updateUserAvatar;
// ----------------------------updateUserCoverImage ---------------------------------
const updateUserCoverImage = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // HEre we are using sigle file not as route and register we were taking files instead os file
    const coverLocalPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!coverLocalPath)
        throw new APIError_1.ApiError(400, "coverImage file is missing");
    const coverImage = yield (0, cloudinary_1.uploadOnCloudinary)(coverLocalPath);
    if (!coverImage.url)
        throw new APIError_1.ApiError(400, "Error while  uploading on coverImage");
    const user = yield user_model_1.User.findByIdAndUpdate((_b = req.user) === null || _b === void 0 ? void 0 : _b._id, {
        $set: {
            coverImage: coverImage.url,
        },
    }, { new: true }).select("-password");
    return res
        .status(200)
        .json(new APIResponse_1.ApiResponse(200, user, "coverImage Updated Successfully"));
}));
exports.updateUserCoverImage = updateUserCoverImage;
// ----------------------------getuserChannelProfile ---------------------------------
const getuserChannelProfile = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username } = req.params;
    if (!(username === null || username === void 0 ? void 0 : username.trim())) {
        throw new APIError_1.ApiError(400, "username is missing");
    }
    //  Using aggregation pipeline and agggregate pipeline always return Array
    const channel = yield user_model_1.User.aggregate([
        // User ko match karte hue
        {
            $match: {
                username: username === null || username === void 0 ? void 0 : username.toLowerCase(),
            },
        },
        // Count the numbner of subscriber
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        // Kitno ko aapne subscribe kar rakha hai
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        // original user object me kuch aur add kar diye like like subcriber subcribercount
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelssubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [(_a = req.user) === null || _a === void 0 ? void 0 : _a._id, "$Subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        // Kya kya hume project karna hai user ko
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelssubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);
    if (!(channel === null || channel === void 0 ? void 0 : channel.length)) {
        throw new APIError_1.ApiError(404, "Channel Doesnt exist");
    }
    return res
        .status(200)
        .json(new APIResponse_1.ApiResponse(200, channel[0], "Userr Channel fetched successfully"));
}));
exports.getuserChannelProfile = getuserChannelProfile;
// ----------------------------getWatchHistory ---------------------------------
const getWatchHistory = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "Video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);
    return res
        .status(200)
        .json(new APIResponse_1.ApiResponse(200, user[0].watchHistory, "Watch History fetched successfully"));
}));
exports.getWatchHistory = getWatchHistory;
