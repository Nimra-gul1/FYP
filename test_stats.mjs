
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    console.log('Connecting to', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    const User = (await import('./backend/models/User.js')).default;
    const Chat = (await import('./backend/models/Chat.js')).default;
    const Emotion = (await import('./backend/models/Emotion.js')).default;
    const Audit = (await import('./backend/models/Audit.js')).default;
    const Quran = (await import('./backend/models/Quran.js')).default;

    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        let oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const emotionScores = { happy: 0.8, joy: 0.8, calm: 0.6, grateful: 0.9, neutral: 0, sad: -0.6, anxious: -0.5, fearful: -0.8, fear: -0.8 };
        // a. Sentiment Trajectory (8 Weeks)
        const sentimentTrends = { weeks: [], sentimentScores: [], tranquilityScores: [] };
        console.log('A ok');
        const radarPattern = {};
        const allEmotions = await Emotion.find().sort({ date: 1 }).lean();
        console.log('B ok');
        const redFlags = await Chat.aggregate([
            { $match: { isUser: true, text: { $regex: /useless|worthless|hopeless|pointless|failure|empty|suicid|kill myself|die|end my life|hate|extrem/i } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: '' },
            { $project: { text: 1, createdAt: 1, email: '.email', id: '._id', isBlocked: '.blocked', blockReason: '.blockReason', blockedAt: '.blockedAt' } }
        ]);
        console.log('C ok');
        
        console.log('DONE NO ERROR');
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
};
run();

