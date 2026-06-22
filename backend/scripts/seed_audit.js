import mongoose from "mongoose";
import dotenv from "dotenv";
import Audit from "../models/Audit.js";
import User from "../models/User.js";

dotenv.config();

async function seed() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fypdb");
    console.log("Connected to seed Audit logs...");

    await Audit.deleteMany({}); // Start clean for the final demo

    const users = await User.find({ role: "user" }).limit(5);
    if (users.length === 0) {
        console.log("No users found to link audit logs.");
        process.exit(0);
    }

    const mockLogs = [
        { verseRef: "Al-Baqarah 2:286", similarity: "99.9%", isVerified: true, mood: "Sadness" },
        { verseRef: "Al-Imran 3:139", similarity: "98.5%", isVerified: true, mood: "Anxiety" },
        { verseRef: "Ar-Ra'd 13:28", similarity: "100%", isVerified: true, mood: "Anxiety" },
        { verseRef: "Ad-Duha 93:3", similarity: "97.1%", isVerified: true, mood: "Loneliness" },
        { verseRef: "Az-Zumar 39:53", similarity: "99.2%", isVerified: true, mood: "Hopeless" },
        { verseRef: "Ash-Sharh 94:5", similarity: "98.9%", isVerified: true, mood: "Deep Distress" },
        { verseRef: "Al-A'raf 7:156", similarity: "100%", isVerified: true, mood: "Grief" },
        { verseRef: "Yunus 10:57", similarity: "99.5%", isVerified: true, mood: "Healing Request" }
    ];

    for (const log of mockLogs) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        await Audit.create({
            userId: randomUser._id,
            verseRef: log.verseRef,
            similarity: log.similarity,
            isVerified: log.isVerified,
            mood: log.mood,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Within last 24h
        });
    }

    console.log("Audit logs seeded successfully!");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
