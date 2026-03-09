import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Emotion from "../models/Emotion.js";

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

// POST /api/emotion/save - Save a detected emotion
router.post("/save", verifyToken, async (req, res) => {
    try {
        const { emotion, score } = req.body;
        if (!emotion) return res.status(400).json({ message: "Emotion required" });

        const newEmotion = new Emotion({
            userId: req.user.id,
            emotion,
            score: score || 0,
        });

        await newEmotion.save();
        res.status(201).json({ message: "Emotion saved" });
    } catch (err) {
        console.error("Error saving emotion:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET /api/emotion/stats - Get emotion stats for the graph (last 7 days + weekly summaries)
router.get("/stats", verifyToken, async (req, res) => {
    try {
        console.log("Stats route hit by user:", req.user.id);
        const userId = req.user.id;

        // 1. Get raw data for the graph (e.g., last 30 entries or last 7 days)
        // For simplicity, we'll fetch the last 20 emotion entries to show a "Wave"
        const recentEmotions = await Emotion.find({ userId })
            .sort({ date: -1 })
            .limit(20);

        // Map emotions to numeric values for the graph? 
        // Or just return the raw list and let frontend handle it.
        // Let's return raw list.

        // 2. Weekly Aggregation for "Reflection Cards"
        // We want to group by week and find the dominant emotion text.
        // This is complex to do purely in Mongo if we want "Week 1", "Week 2" logic precisely aligning with UI.
        // Let's fetch the last 30 days of data and aggregate in JS for simplicity, 
        // or use a robust aggregation pipeline.

        // Aggregation: Group by Week.
        const weeklyStats = await Emotion.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: { $week: "$date" }, // Group by week number
                    emotions: { $push: "$emotion" },
                    date: { $first: "$date" } // Keep a representative date
                }
            },
            { $sort: { "_id": -1 } }, // Latest weeks first
            { $limit: 4 }
        ]);

        const responseData = {
            recent: recentEmotions.reverse(), // Send in chronological order for graph
            weekly: weeklyStats,
            // 3. Distribution for Pie Chart
            distribution: await Emotion.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: "$emotion", count: { $sum: 1 } } }
            ]),
            // 4. Daily Counts for Bar Chart (Last 7 days)
            daily: await Emotion.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId),
                        date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } // Last 7 days
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ])
        };

        console.log(`[Stats] Sending ${responseData.recent.length} recent points and ${responseData.weekly.length} weekly summary.`);
        res.json(responseData);

    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/emotion/clear - Clear all emotion history
router.delete("/clear", verifyToken, async (req, res) => {
    try {
        await Emotion.deleteMany({ userId: req.user.id });
        res.json({ message: "Emotion history cleared" });
    } catch (err) {
        console.error("Error clearing emotions:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
