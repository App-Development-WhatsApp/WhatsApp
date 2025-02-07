import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User to receive the notification
    message: { type: String, required: true }, // The notification message
    type: { type: String, enum: ["message", "call", "status", "other"], required: true }, // Type of notification
    priority: { type: Number, default: 1 }, // Priority of the notification (1 = low, 10 = high)
    status: { type: String, enum: ["pending", "delivered", "failed"], default: "pending" }, // Notification status
    timestamp: { type: Date, default: Date.now }, // When the notification was created
    retryCount: { type: Number, default: 0 }, // Retry count for failed notifications
    retryDelay: { type: Number, default: 5 }, // Delay between retries in seconds
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
