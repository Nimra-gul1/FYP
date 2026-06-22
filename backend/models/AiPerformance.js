import mongoose from "mongoose";

const aiPerformanceSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  latency: { type: Number, required: true }, // in ms
  tokens: { type: Number, required: true },
  cost: { type: Number, required: true }, // estimated in USD
  provider: { type: String, default: "OpenAI" },
  status: { type: String, enum: ["success", "failure"], default: "success" },
  error: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("AiPerformance", aiPerformanceSchema);
