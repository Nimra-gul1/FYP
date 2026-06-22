import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // null if system
  action: { type: String, required: true }, // e.g., 'block_user', 'view_kpi', 'update_verse'
  targetId: { type: String, required: false },
  details: { type: Object, required: false },
  ip: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("ActivityLog", activityLogSchema);
