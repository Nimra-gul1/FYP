import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import ModerationLog from "./models/ModerationLog.js";

dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fypdb");
    
    // Simulate a moderation action to test "Resolved Today"
    const testUser = await User.findOne({ role: "user" });
    if (testUser) {
        await ModerationLog.create({
            adminId: new mongoose.Types.ObjectId(), // Fake admin ID
            targetUserId: testUser._id,
            action: 'block',
            timestamp: new Date()
        });
        console.log("Check: Test moderation action logged.");
    }

    const blockedCount = await User.countDocuments({ blocked: true });
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const resolvedToday = await ModerationLog.countDocuments({ timestamp: { $gte: startOfToday } });

    console.log("Verification Metrics:");
    console.log("- Blocked (Shadow-Banned):", blockedCount);
    console.log("- Resolved Today:", resolvedToday);

    process.exit(0);
}
check();
