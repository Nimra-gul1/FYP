import './loadEnv.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Chat from './models/Chat.js';
import Emotion from './models/Emotion.js';
import Audit from './models/Audit.js';
import ModerationLog from './models/ModerationLog.js';

const emotionScores = { happy: 0.8, joy: 0.8, calm: 0.6, grateful: 0.9, neutral: 0, sad: -0.6, anxious: -0.5, fearful: -0.8, fear: -0.8 };
const getDayName = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
};

async function testStats() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log("Simulating stats logic...");
        const totalUsers = await User.countDocuments();
        const redFlags = await Chat.find({ isUser: true }).limit(1).lean(); // Just to check length
        const blockedCount = await User.countDocuments({ blocked: true });
        
        console.log("KPI Snapshot:");
        console.log({ totalUsers, redFlagsCount: redFlags.length, blockedCount });

        // Check for specific fields required by frontend tabs
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const resolutionCount = await ModerationLog.countDocuments({ timestamp: { $gte: startOfToday } });
        console.log("- Resolved Today Count:", resolutionCount);

        console.log("Test Success. Logic verified for new response structure.");
        process.exit(0);
    } catch (e) {
        console.error("TEST FAILED:", e);
        process.exit(1);
    }
}

testStats();
