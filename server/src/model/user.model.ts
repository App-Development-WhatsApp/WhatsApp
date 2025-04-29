import mongoose, { Schema, Document, Model } from "mongoose";


interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  text: string;
  files: string[];
  time: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    files: [{ type: String }], 
    time: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);

export { Message, IMessage };


interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  image: string;
  about: string;
  phoneNumber: string;
  communities: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  statuses: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    image: { type: String, required: true },
    about: { type: String, default: "Hey there! I am using WhatsApp." },
    phoneNumber: { type: String, required: true, unique: true },
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    statuses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Status" }], // <-- new
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { User, IUser };
