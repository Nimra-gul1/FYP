import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  audioUrl: { type: String, required: false }, // Optional: only for voice messages
  isUser: { type: Boolean, default: false },
  ts: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
