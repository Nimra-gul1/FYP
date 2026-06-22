import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, required: false }, // Unique ID per user session
    verseRef: { type: String, required: true }, // e.g. "Al-Baqarah 2:286"
    similarity: { type: String, default: "100%" }, // Since it's from our DB, it's ground truth
    isVerified: { type: Boolean, default: true },
    mood: { type: String },
    impactScore: { type: Number, default: 0 }, // Sentiment improvement score
    timestamp: { type: Date, default: Date.now }
});

const Audit = mongoose.model("Audit", auditSchema);
export default Audit;
