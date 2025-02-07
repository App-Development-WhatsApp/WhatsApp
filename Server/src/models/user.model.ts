import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    profilePic: { type: String, default: "" },
    about: { type: String, default: "Hey there! I am using WhatsApp." },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
    followedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }], // Field to store channels the user follows
    lastSeen: { type: Date, default: Date.now },
    online: { type: Boolean, default: false },
    status: [{ media: String, text: String, timestamp: Date }],
    callLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Call" }],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
