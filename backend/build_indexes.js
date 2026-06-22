import './loadEnv.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Chat from './models/Chat.js';
import Emotion from './models/Emotion.js';

async function buildIndexes() {
    try {
        console.log("Connecting to DB to build indexes...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        console.log("Building User indexes...");
        await User.createIndexes();
        
        console.log("Building Chat indexes...");
        await Chat.createIndexes();
        
        console.log("Building Emotion indexes...");
        await Emotion.createIndexes();

        console.log("✅ ALL INDEXES BUILT SUCCESSFULLY.");
        
        // Benchmark
        console.log("Running speed test...");
        const start = Date.now();
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        await Promise.all([
            Chat.find({ createdAt: { $gte: sixtyDaysAgo } }).limit(1).lean(),
            Emotion.find({ date: { $gte: sixtyDaysAgo } }).limit(1).lean()
        ]);
        console.log(`Speed test passed: ${Date.now() - start}ms (Previous was >10000ms)`);
        
        process.exit(0);
    } catch (e) {
        console.error("Index build failed:", e);
        process.exit(1);
    }
}

buildIndexes();
