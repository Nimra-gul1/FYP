import express from "express";
import jwt from "jsonwebtoken";
import Journal from "../models/Journal.js";

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

// Save journal entry
router.post("/save", verifyToken, async (req, res) => {
    try {
        const { text, date, emoji } = req.body;
        const entry = new Journal({ userId: req.userId, text, date, emoji });
        await entry.save();
        res.status(201).json({ message: "Journal entry saved", entry });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's journal entries
router.get("/get", verifyToken, async (req, res) => {
    try {
        const entries = await Journal.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clear all journal entries for current user
// Delete a single journal entry by ID
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Journal.findOne({ _id: id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    await entry.deleteOne();

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, emoji, date } = req.body;

    const entry = await Journal.findOne({ _id: id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    entry.text = text;
    entry.emoji = emoji;
    entry.date = date;

    await entry.save();
    res.json({ message: "Entry updated successfully", entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
