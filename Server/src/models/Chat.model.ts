import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // List of users in the chat
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Group chat, if applicable
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" }, // Community chat, if applicable
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Sender of the message
        text: { type: String, required: true }, // Text of the message
        media: { type: String, default: "" }, // Optional media attached to the message (image/video/audio)
        timestamp: { type: Date, default: Date.now }, // Timestamp when the message was sent
        status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" }, // Message delivery status
      },
    ],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Reference to the last message sent in the chat
    unreadCount: { type: Number, default: 0 }, // Number of unread messages
    createdAt: { type: Date, default: Date.now }, // When the chat was created
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
