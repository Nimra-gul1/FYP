import express from "express";
import jwt from "jsonwebtoken";
import Chat from "../models/Chat.js";
import { trackActivity } from "../middleware/activityTracker.js";

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// Save message (user or Qalbify)
router.post("/save", verifyToken, trackActivity, async (req, res) => {
  try {
    const { text, audioUrl, isUser, ts, localDate } = req.body;
    const chat = new Chat({ userId: req.userId, text, audioUrl, isUser, ts, localDate: localDate || new Date().toDateString() });
    await chat.save();
    res.status(201).json({ message: "Chat saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user’s previous chat history
router.get("/get", verifyToken, trackActivity, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear all chats for current user
router.delete("/clear", verifyToken, trackActivity, async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.userId });
    res.json({ message: "Chat history cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

