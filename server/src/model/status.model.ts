// models/Status.ts
import mongoose, { Schema, Document, Model } from "mongoose";

interface IStatus extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  caption: string;
  url: string;
  timestamp: Date;
}

const statusSchema = new Schema<IStatus>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: String,
    caption: String,
    url: String,
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Status: Model<IStatus> = mongoose.model<IStatus>("Status", statusSchema);

export { Status, IStatus };
