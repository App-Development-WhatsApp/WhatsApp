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
exports.verifyJWT = void 0;
const APIError_1 = require("../utils/APIError");
const asyncHandler_1 = require("../utils/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
exports.verifyJWT = (0, asyncHandler_1.asyncHandler)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) || ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        if (!token) {
            throw new APIError_1.ApiError(401, "Unauthorized Token");
        }
        // Decode the token
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET); // Type assertion for the decoded token
        const user = yield user_model_1.User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) {
            throw new APIError_1.ApiError(401, "Invalid Access Token");
        }
        req.user = user; // Attach user to the request object
        next(); // Proceed to the next middleware
    }
    catch (error) {
        throw new APIError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Invalid Access Token");
    }
}));
