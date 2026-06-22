import mongoose from "mongoose";

const emotionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: false }, // Unique ID per user session
    emotion: { type: String, required: true }, // e.g., 'happy', 'sad', 'anxious', 'fearful'
    score: { type: Number, default: 0 }, // Confidence score if available, or just placeholder
    date: { type: Date, default: Date.now },
});

export default mongoose.model("Emotion", emotionSchema);
