import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import "./loadEnv.js"; // MUST BE FIRST
import adminRoutes from "./routes/adminRoutes.js"; // New Admin Routes
import authRoutes from "./routes/authRoutes.js";
import chatLogicRoutes from "./routes/chatLogic.js";
import chatRoutes from "./routes/chatRoutes.js";
import emotionRoutes from "./routes/emotionRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import transcribeRoutes from "./routes/transcribeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins (for local and Vercel deployments)
    callback(null, true);
  },
  credentials: true,
}));
app.use("/uploads", express.static("uploads")); // Serve audio files

// WebSocket Connection
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected");
  });
});

// Make io accessible to routes
app.set("io", io);

// Debug Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ MongoDB Connection — Cached for Vercel Serverless
// On serverless, each request may spin up a new function instance.
// This caches the connection in the module scope so it is reused across warm invocations.
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) {
    console.error("❌ CRITICAL: MONGO_URI is missing from environment variables.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    isConnected = false;
    console.log(process.env.MONGO_URI, err, "mongo error");
    console.error("❌ MongoDB connection error:", err.message);
  }
}

// Connect immediately on module load (works for both local and serverless warm starts)
connectDB();

// Reconnect middleware — ensures DB is live before any route runs
app.use(async (req, res, next) => {
  await connectDB();
  next();
});


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
app.use("/api/admin", adminRoutes); // Mount admin telemetry route

// ✅ 404 Handler - Return JSON!
app.use((req, res) => {
  console.log("404 Hit:", req.url);
  res.status(404).json({ success: false, message: "Route not found" });
});

//  Global Error Handler - CRITICAL for preventing HTML responses
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

//  Start Server (Local Only)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Qalbify Backend STARTED on port ${PORT} with WebSockets`);
  });
}

export { io };
export default app;
