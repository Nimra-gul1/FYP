import mongoose from "mongoose";

const interventionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ["P1", "P2", "P3"], default: "P1" },
  status: { type: String, enum: ["queued", "delivered", "read"], default: "queued" },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Intervention", interventionSchema);
