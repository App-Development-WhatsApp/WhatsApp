import mongoose from "mongoose";

// Define the message schema
const messageSchema = new mongoose.Schema({
  sender_jid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_jid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  fileUrls: { type: [String], default: [] },
  fileTypes: { type: [String], default: [] },
  timestamp: { type: String, required: true },
  isCurrentUserSender: { type: Boolean, default: true },
  oneTime: { type: Boolean, default: false },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
