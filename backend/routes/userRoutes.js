import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { trackActivity } from "../middleware/activityTracker.js";

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

// GET /api/user/preferences - Get user preferences
router.get("/preferences", verifyToken, trackActivity, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("preferences");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Return defaults if preferences not set
        const prefs = user.preferences || { comfortStyle: 'Gentle', religiousGuidance: true };
        res.json(prefs);
    } catch (err) {
        console.error("Error fetching preferences:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/user/preferences - Update user preferences
router.put("/preferences", verifyToken, trackActivity, async (req, res) => {
    try {
        const { comfortStyle, religiousGuidance } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (comfortStyle) user.preferences.comfortStyle = comfortStyle;
        if (religiousGuidance !== undefined) user.preferences.religiousGuidance = religiousGuidance;

        await user.save();
        res.json({ message: "Preferences updated", preferences: user.preferences });
    } catch (err) {
        console.error("Error updating preferences:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/user/reset-personality - Reset preferences to defaults
router.post("/reset-personality", verifyToken, trackActivity, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.preferences = {
            comfortStyle: 'Gentle',
            religiousGuidance: true
        };

        await user.save();
        res.json({ message: "Personality reset to default", preferences: user.preferences });
    } catch (err) {
        console.error("Error resetting personality:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/user/review - Submit user rating and review
router.post("/review", verifyToken, trackActivity, async (req, res) => {
    try {
        const { rating, reviewText, userName, userEmail } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Valid rating between 1 and 5 is required" });
        }

        const newReview = new Review({
            userId: req.user.id,
            userEmail: userEmail || req.user.email || "Unknown",
            userName: userName || "Anonymous",
            rating,
            reviewText
        });

        await newReview.save();
        res.status(201).json({ message: "Review submitted successfully" });
    } catch (err) {
        console.error("Error saving review:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
