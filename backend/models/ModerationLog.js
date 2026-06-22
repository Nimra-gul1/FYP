import mongoose from "mongoose";

const moderationLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['block', 'unblock', 'clear', 'AI_GUIDANCE_UPDATE'], required: true },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const ModerationLog = mongoose.model("ModerationLog", moderationLogSchema);
export default ModerationLog;
