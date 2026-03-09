import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: String, required: true }, // Keeping string format to match frontend logic
    emoji: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Journal", journalSchema);
