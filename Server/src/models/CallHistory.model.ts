import mongoose from "mongoose";

// Call Schema
const callSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Caller (initiator of the call)
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Receiver of the call
    callType: { 
      type: String, 
      enum: ["audio", "video"], 
      required: true 
    }, // Call type (audio or video)
    callStatus: { 
      type: String, 
      enum: ["incoming", "answered", "missed", "rejected"], 
      required: true 
    }, // Call status
    callStart: { type: Date, default: Date.now }, // Call start time
    callEnd: { type: Date, default: null }, // Call end time
    duration: { type: Number, default: 0 }, // Call duration in seconds
  },
  { timestamps: true }
);

export const Call = mongoose.model("Call", callSchema);
