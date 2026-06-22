import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  preferences: {
    comfortStyle: { type: String, enum: ['Gentle', 'Motivational', 'Spiritual', 'Silent'], default: 'Gentle' },
    religiousGuidance: { type: Boolean, default: true } // Islamic vs Neutral
  },
  city: { type: String, default: null }, // Geographic tracking for K-Anonymity
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  blocked: { type: Boolean, default: false },
  blockReason: { type: String, default: null },
  blockedAt: { type: Date, default: null },
  blockEvidence: { type: String, default: null }, // Specifically stores the chat message that caused the block
  customAiInstructions: { type: String, default: null },
  lastActive: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

export default User;
