import express from "express";
import jwt from "jsonwebtoken";
import Journal from "../models/Journal.js";
import Chat from "../models/Chat.js";

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
router.get("/streak", verifyToken, async (req, res) => {
  try {
    const { clientDate } = req.query;
    
    // Fetch both Journal entries and Chatbot interactions (only user messages count for streaks)
    const [entries, chats] = await Promise.all([
      Journal.find({ userId: req.userId }).lean(),
      Chat.find({ userId: req.userId, isUser: true }).lean()
    ]);
    
    // Combine standard Journal dates and Chatbot local dates
    const allValidDates = [
        ...entries.map(e => e.date),
        ...chats.map(c => c.localDate).filter(Boolean)
    ];

    if (allValidDates.length === 0) {
      return res.json({ currentStreak: 0, activeDates: [] });
    }

    // Use the user's local date field strings (e.g. "Mon Apr 20 2026")
    const entryDatesSet = new Set(allValidDates);
    const uniqueDatesArray = Array.from(entryDatesSet).map(d => ({
       str: d,
       val: new Date(d).getTime()
    })).sort((a, b) => b.val - a.val);

    let userStreakCounter = 0;
    
    // Determine the reference "Today"
    // Use the client's local date if provided, otherwise fallback to server time
    const today = clientDate ? new Date(clientDate) : new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    // Check if streak is still alive (entry today or yesterday)
    if (!entryDatesSet.has(todayStr) && !entryDatesSet.has(yesterdayStr)) {
      return res.json({ 
        currentStreak: 0, 
        activeDates: uniqueDatesArray.slice(0, 7).map(d => d.str) 
      });
    }

    // Iterate backwards and count consecutive days
    const streakDates = [];
    let checkDate = entryDatesSet.has(todayStr) ? new Date(today) : new Date(yesterday);
    
    while (true) {
      const dateStr = checkDate.toDateString();
      if (entryDatesSet.has(dateStr)) {
        userStreakCounter++;
        streakDates.push(dateStr);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      currentStreak: userStreakCounter,
      activeDates: uniqueDatesArray.slice(0, 10).map(d => d.str), // Return properly sorted strings for frontend display
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
