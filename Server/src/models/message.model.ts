import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true }, // Chat reference
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Sender reference
    
    // 📝 Text Message
    text: { type: String, default: "" }, 
    
    // 📹🎵📂 Media/Files
    media: { type: String, default: "" }, // URL for media (image/video/audio/file)
    mediaType: { type: String, enum: ["image", "video", "audio", "file"], default: "image" }, // Type of media
    
    // 📍 Live Location Sharing
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
      isLive: { type: Boolean, default: false }, // If true, location updates in real-time
    },

    // ⏳ Timed Messages & One-Time View
    viewed: { type: Boolean, default: false }, // If the message has been viewed
    oneTimeView: { type: Boolean, default: false }, // Self-destruct after viewing
    expiryTime: { type: Date }, // Auto-delete after this time

    // 📊 Polls
    poll: {
      question: { type: String },
      options: [{ option: String, votes: { type: Number, default: 0 } }], // Poll options
      isMultiSelect: { type: Boolean, default: false }, // Allow multiple votes
      votedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who voted
    },

    // ⏰ Timestamps & Status
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  },
  { timestamps: true }
);

// Ensure location is a GeoJSON point for live tracking
messageSchema.index({ location: "2dsphere" });

export const Message = mongoose.model("Message", messageSchema);
