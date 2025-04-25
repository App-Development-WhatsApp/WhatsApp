import { Response } from "express";
import { Message } from "../model/user.model";
import { ApiError } from "../utils/APIError";
import { ApiResponse } from "../utils/APIResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const saveMessages = asyncHandler(async (req: any, res: Response) => {
    const { sender_jid, receiver_jid, message, fileUrls, fileTypes, oneTime } = req.body;

    if (!sender_jid || !receiver_jid || (!message && (!fileUrls || fileUrls.length === 0))) {
        throw new ApiError(400, "Missing required fields: sender_jid, receiver_jid, or message/fileUrls");
    }

    const newMessage = new Message({
        sender_jid,
        receiver_jid,
        message,
        fileUrls,
        fileTypes,
        timestamp: new Date().toISOString(),
        isCurrentUserSender: true,
        oneTime,
    });

    const savedMessage = await newMessage.save();

    return res.status(201).json(
        new ApiResponse(201, "Message saved successfully", {
            messageId: savedMessage._id,
        })
    );
});
