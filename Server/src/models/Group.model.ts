const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Group name
    description: { type: String, default: "" }, // Group description
    profilePic: { type: String, default: "" }, // Group profile picture URL
    coverPic: { type: String, default: "" }, // Group cover photo URL
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Admins of the group
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Members of the group
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Message sender
        text: { type: String, required: true }, // Message text
        media: { type: String, default: "" }, // Optional media URL (image/video/audio)
        timestamp: { type: Date, default: Date.now }, // Message timestamp
      },
    ],
    createdAt: { type: Date, default: Date.now }, // Group creation timestamp
    updatedAt: { type: Date, default: Date.now }, // Last group update timestamp
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
