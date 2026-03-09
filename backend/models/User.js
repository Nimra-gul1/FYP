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
  }
});

const User = mongoose.model("User", userSchema);

export default User;
