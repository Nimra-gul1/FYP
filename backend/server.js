import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import "./loadEnv.js"; // MUST BE FIRST
import authRoutes from "./routes/authRoutes.js";
import chatLogicRoutes from "./routes/chatLogic.js";
import chatRoutes from "./routes/chatRoutes.js";
import emotionRoutes from "./routes/emotionRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import transcribeRoutes from "./routes/transcribeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve audio files

// Debug Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Root route - Return JSON!
app.get("/", (req, res) => {
  res.json({ status: "success", message: "🚀 Qalbify Backend Running Successfully!" });
});

// ✅ Auth Routes
app.use("/api/auth", authRoutes);

// ✅ Other Routes
app.use("/api/chats", chatRoutes);
app.use("/api/emotion", emotionRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/transcribe", transcribeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatLogicRoutes); // Mount new chat logic

// ✅ 404 Handler - Return JSON!
app.use((req, res) => {
  console.log("404 Hit:", req.url);
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Global Error Handler - CRITICAL for preventing HTML responses
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Qalbify Backend STARTED on port ${PORT}`);
});
