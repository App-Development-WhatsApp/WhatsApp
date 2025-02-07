import mongoose from "mongoose";

// Channel Schema
const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Admins for managing the channel
    media: [{ type: String }], // Array to store media links or file paths related to the channel
    channelType: { 
      type: String, 
      enum: ["public", "private"], 
      default: "public" 
    }, // Public or private channel
    privacySettings: {
      allowJoin: { type: Boolean, default: true }, // Whether users can join freely or need an invitation
      visibleTo: { type: String, enum: ["everyone", "members"], default: "everyone" }, // Control visibility of channel content
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    notifications: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Notification" 
    }], // Track notifications for the channel members
  },
  { timestamps: true }
);

// Channel Model
export const Channel = mongoose.model("Channel", channelSchema);
