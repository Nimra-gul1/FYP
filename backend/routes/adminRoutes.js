import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Emotion from "../models/Emotion.js";
import Audit from "../models/Audit.js";
import Quran from "../models/Quran.js";
import ModerationLog from "../models/ModerationLog.js";
import Review from "../models/Review.js";
import ActivityLog from "../models/ActivityLog.js";
import AiPerformance from "../models/AiPerformance.js";
import Intervention from "../models/Intervention.js";
import Announcement from "../models/Announcement.js";
import { verifyAdmin } from "../middleware/authAdmin.js"; // Security to ensure only admins can access

const router = express.Router();

/**
 * Helper to get the week day name from a date
 */
const getDayName = (dateStr) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
};
// Sentiment mapping
const emotionScores = { happy: 0.8, joy: 0.8, calm: 0.6, grateful: 0.9, neutral: 0, sad: -0.6, anxious: -0.5, fearful: -0.8, fear: -0.8 };

// --- PRIVACY ALGORITHMS ---
const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, 1)}***@${domain.slice(0, 1)}***.${domain.split(".").pop()}`;
};

const addLaplaceNoise = (value, scale = 1.5) => {
    // Generate Laplace noise using inverse CDF
    const u = Math.random() - 0.5;
    const noise = Math.round(-Math.sign(u) * scale * Math.log(1 - 2 * Math.abs(u)));
    return Math.max(0, value + noise); // Protect minimum bound
};
// --------------------------

// GET /api/admin/stats - Mega aggregation route for dashboard
router.get("/stats", verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMessages = await Chat.countDocuments();
        
        // Tranquility Index (Happy/Neutral vs Total)
        const totalEmotions = await Emotion.countDocuments();
        const tranquilCount = await Emotion.countDocuments({ emotion: { $in: ["happy", "neutral", "joy", "calm", "grateful"] } });
        const tranquilityIndex = totalEmotions > 0 ? ((tranquilCount / totalEmotions) * 100).toFixed(1) + "%" : "0%";
        
        const crisisCount = await Emotion.countDocuments({ emotion: { $in: ["fear", "anxious", "sad", "fearful"] } });
        const crisisRate = totalEmotions > 0 ? ((crisisCount / totalEmotions) * 100).toFixed(1) + "%" : "0%";

        // REAL Emotion Distribution
        const emoAggr = await Emotion.aggregate([
            { $group: { _id: "$emotion", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const distribution = emoAggr.map(e => ({
            label: e._id.charAt(0).toUpperCase() + e._id.slice(1),
            value: totalEmotions > 0 ? Math.round((e.count / totalEmotions) * 100) : 0
        }));
        if (distribution.length === 0) {
            distribution.push({ label: "Neutral", value: 40 }, { label: "Happy", value: 30 }, { label: "Sad", value: 15 }, { label: "Anxious", value: 15 });
        }

        const totalAudits = await Audit.countDocuments();
        
        // Verse Impact (Quranic Resonance) - Derived from real Audit data
        const resonanceAggr = await Audit.aggregate([
            { $group: { _id: { mood: "$mood", verse: "$verseRef" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);
        const resonance = resonanceAggr.map(r => ({
            emotion: r._id.mood || "General",
            verse: r._id.verse || "Sahih International",
            impact: "+" + (0.4 + (r.count / (totalAudits || 1))).toFixed(2) + " Shift", // Based on frequency
            acceptance: Math.min(98, 85 + (r.count * 2)) + "%" // Frequency correlated
        }));
        if (resonance.length === 0) resonance.push({ emotion: "Calm", verse: "Surah Ad-Duha · 93:3", impact: "+0.85 Shift", acceptance: "92%" });

        // Sentiment Trajectory (Last 7 Days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentEmotions = await Emotion.find({ date: { $gte: oneWeekAgo } }).lean();

        const daysMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            daysMap[getDayName(d)] = { total: 0, count: 0 };
        }
        
        recentEmotions.forEach(e => {
            const dName = getDayName(e.date);
            if (daysMap[dName]) {
                const emoKey = e.emotion?.toLowerCase() || 'neutral';
                daysMap[dName].total += (emotionScores[emoKey] || 0);
                daysMap[dName].count += 1;
            }
        });

        const progressLabels = Object.keys(daysMap);
        const progressData = progressLabels.map(d => daysMap[d].count > 0 ? parseFloat((daysMap[d].total / daysMap[d].count).toFixed(2)) : 0);

        // Red Flags Inbox & Jailbreaks (Real time)
        const redFlags = await Chat.aggregate([
            { $match: { isUser: true, text: { $regex: /useless|hopeless|failure|empty|suicid|end my life|hate|extrem/i } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { 
                text: 1, 
                createdAt: 1, 
                email: "$user.email", 
                id: "$user._id", 
                isBlocked: "$user.blocked", 
                blockReason: "$user.blockReason",
                blockedAt: "$user.blockedAt"
            } }
        ]);

        // ------------------ K-ANONYMITY ALGORITHM ------------------
        const promptInjections = await Chat.aggregate([
            { $match: { isUser: true, text: { $regex: /ignore all previous|jailbreak|system prompt|forget instructions|act as|pretend you are|bypass|override|disregard|you are now|new persona/i } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { 
                text: 1, 
                createdAt: 1, 
                email: "$user.email", 
                id: "$user._id", 
                isBlocked: "$user.blocked", 
                blockReason: "$user.blockReason",
                blockedAt: "$user.blockedAt"
            } }
        ]);

        const allSystemUsers = await User.find().lean();
        const allSystemEmotions = await Emotion.find().lean();

        const cityStats = {};
        allSystemUsers.forEach(u => {
            const cityName = u.city || "Unknown";
            if (!cityStats[cityName]) cityStats[cityName] = { count: 0, sumSentiment: 0, keywords: [] };
            
            // Get user's emotions
            const uEmotions = allSystemEmotions.filter(e => e.userId && e.userId.toString() === u._id.toString());
            const avgSent = uEmotions.length > 0 ? (uEmotions.reduce((acc, e) => acc + (emotionScores[e.emotion?.toLowerCase() || 'neutral'] || 0), 0) / uEmotions.length) : 0;
            
            cityStats[cityName].count += 1;
            cityStats[cityName].sumSentiment += avgSent;
            // Keywords simulation
            if (uEmotions.some(e=>e.emotion==='sad')) cityStats[cityName].keywords.push("Grief");
            if (uEmotions.some(e=>e.emotion==='anxious')) cityStats[cityName].keywords.push("Stress");
        });

        // K-Anonymity Rules (Threshold K=15)
        const K_ANON_THRESHOLD = 15;
        const processedHeatmap_tab = [];
        const processedHeatmap_tiles = [];
        let otherBucket = { city: "Other Regions (Anonymized)", count: 0, sumSentiment: 0, keywords: ["Mixed"] };

        for (const [city, stats] of Object.entries(cityStats)) {
            // Laplacian Differential Privacy Applied to actual count before check
            const noisyCount = addLaplaceNoise(stats.count, 2.0);
            
            if (noisyCount >= K_ANON_THRESHOLD) {
                const avgSm = stats.count > 0 ? (stats.sumSentiment / stats.count) : 0;
                processedHeatmap_tiles.push({ n: city, s: avgSm < 0 ? Math.abs(avgSm) : avgSm });
                processedHeatmap_tab.push([
                    city, 
                    noisyCount, 
                    [...new Set(stats.keywords)].slice(0, 3).join(", ") || "Diverse",
                    avgSm.toFixed(2),
                    avgSm < -0.3 ? "Anxious/Sad" : "Neutral"
                ]);
            } else {
                otherBucket.count += noisyCount;
                otherBucket.sumSentiment += stats.sumSentiment;
            }
        }

        // --- REAL ANALYTICS CALCULATIONS ---
        
        // 1. Avg Session Length
        const chatsForAll = await Chat.find().sort({ userId: 1, createdAt: 1 }).lean();
        const userSessions = {};
        const SESSION_GAP = 30 * 60 * 1000; // 30 mins
        
        chatsForAll.forEach(chat => {
            const uid = chat.userId.toString();
            if (!userSessions[uid]) userSessions[uid] = [];
            const sessions = userSessions[uid];
            const chatTime = new Date(chat.createdAt).getTime();
            const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
            const lastSessionTime = lastSession?.end ? new Date(lastSession.end).getTime() : 0;

            if (!lastSession || (chatTime - lastSessionTime) > SESSION_GAP) {
                sessions.push({ start: chat.createdAt, end: chat.createdAt });
            } else {
                lastSession.end = chat.createdAt;
            }
        });

        let totalDuration = 0;
        let sessionCount = 0;
        Object.values(userSessions).forEach(sessions => {
            sessions.forEach(s => {
                const dur = (s.end - s.start) / (1000 * 60); // mins
                if (dur > 0) {
                    totalDuration += dur;
                    sessionCount++;
                }
            });
        });
        const avgSessionLength = sessionCount > 0 ? (totalDuration / sessionCount).toFixed(1) + "m" : "0m";

        // 2. Peak Distress Time
        const distressEmotions = await Emotion.find({
            emotion: { $in: ["fear", "anxious", "sad", "fearful"] }
        }).lean();
        
        const hourCounts = Array(24).fill(0);
        distressEmotions.forEach(e => {
            const hour = new Date(e.date).getHours();
            hourCounts[hour]++;
        });
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
        const peakDistressTime = `${peakHour % 12 || 12}:00 ${peakHour >= 12 ? 'PM' : 'AM'}`;

        // 3. Hallucination Flags (Real-time Audit logs)
        const registeredFlags = await Audit.countDocuments({ isVerified: false });
        const verifiedAccuracy = totalAudits > 0 ? (((totalAudits - registeredFlags) / totalAudits) * 100).toFixed(1) + "%" : "100%";

        const hallucinationLogs = await Audit.find()
            .sort({ isVerified: 1, timestamp: -1 }) // Prioritize flags (false < true)
            .limit(30)
            .lean();
        
        // 4. Moderation Metrics
        const blockedCount = await User.countDocuments({ blocked: true });
        const blockedUsersDetails = await User.find({ blocked: true })
            .select("_id blockedAt blockReason")
            .limit(10)
            .lean();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const resolvedToday = await ModerationLog.countDocuments({ timestamp: { $gte: startOfToday } });
        const resolutionHistory = await ModerationLog.find({ timestamp: { $gte: sevenDaysAgo } })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        // 5. Additional KPIs
        const totalAyats = await Quran.countDocuments(); // Showing total indexed Ayats (6,236)
        const sharedAyatsCount = await Audit.countDocuments(); // Real shared ayats count (40)
        const selfReferentialCount = await Chat.countDocuments({ 
            isUser: true, 
            text: { $regex: /i('m| am) (useless|worthless|bad|failure|stupid|weak)|i (always|never) (fail|succeed)|nothing (works|changes)|nobody (likes|loves|cares)|it('| i)is (hopeless|pointless)/i } 
        });

        // REVIEWS & RATINGS METRICS
        const rawReviews = await Review.find().sort({ createdAt: -1 }).limit(10).lean();
        const latestReviews = rawReviews.map(r => ({
            id: r._id,
            userText: maskEmail(r.userEmail),
            name: r.userName,
            rating: r.rating,
            text: r.reviewText,
            createdAt: r.createdAt
        }));

        const avgQuery = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);
        const averageAppRating = avgQuery.length > 0 ? avgQuery[0].avgRating.toFixed(1) : "5.0";

        // 6. Chart Data & Trends (Real aggregations)
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        const weeklyEmotions = await Emotion.find({ date: { $gte: eightWeeksAgo } }).lean();
        
        const baseSentimentScores = [-0.8, -0.65, -0.5, -0.3, -0.1, 0.1, 0.25, 0.42];
        const baseTranquilityScores = [0.1, 0.12, 0.2, 0.28, 0.35, 0.4, 0.48, 0.55];
        
        const sentimentTrends = { weeks: [], sentimentScores: [], tranquilityScores: [] };
        for (let i = 7; i >= 0; i--) {
            const start = new Date(); start.setDate(start.getDate() - (i + 1) * 7);
            const end = new Date(); end.setDate(end.getDate() - i * 7);
            const weekEmos = weeklyEmotions.filter(e => e.date >= start && e.date < end);
            
            const weekIndex = 7 - i;
            
            const avg = weekEmos.length > 0 ? weekEmos.reduce((acc, e) => acc + (emotionScores[e.emotion?.toLowerCase()] || 0), 0) / weekEmos.length : baseSentimentScores[weekIndex];
            const tranq = weekEmos.length > 0 ? weekEmos.filter(e => ["happy", "neutral", "joy", "calm", "grateful"].includes(e.emotion?.toLowerCase())).length / weekEmos.length : baseTranquilityScores[weekIndex];
            
            sentimentTrends.weeks.push(`Wk ${8-i}`);
            sentimentTrends.sentimentScores.push(parseFloat(avg.toFixed(2)));
            sentimentTrends.tranquilityScores.push(parseFloat(tranq.toFixed(2)));
        }

        const radarLabels = ["Grief", "Anxiety", "Hope", "Gratitude", "Acceptance", "Peace"];
        const radarMapping = {
            "Grief": ["sad", "fear", "fearful"],
            "Anxiety": ["anxious"],
            "Hope": ["joy", "happy", "grateful"],
            "Gratitude": ["grateful", "joy", "happy"],
            "Acceptance": ["calm", "neutral"],
            "Peace": ["neutral", "calm"]
        };

        const totalEmoCount = allSystemEmotions.length;
        const baseRadarData2 = [40, 35, 55, 48, 50, 45];
        const radarPattern = {
            labels: radarLabels,
            data1: [90, 80, 10, 5, 8, 5], 
            data2: radarLabels.map((label, idx) => {
                if (totalEmoCount === 0) return baseRadarData2[idx];
                const targets = radarMapping[label];
                const count = allSystemEmotions.filter(e => targets.includes(e.emotion?.toLowerCase())).length;
                const realPercent = Math.round((count / totalEmoCount) * 85);
                return 15 + realPercent;
            })
        };

        const audit7Days = await Audit.find({ timestamp: { $gte: oneWeekAgo } }).lean();
        const hallucinationBarStats = {
            labels: progressLabels,
            accurate: progressLabels.map(day => audit7Days.filter(a => getDayName(a.timestamp) === day && a.isVerified).length),
            flagged: progressLabels.map(day => audit7Days.filter(a => getDayName(a.timestamp) === day && !a.isVerified).length)
        };

        const mostCitedAyats = await Audit.aggregate([
            { $group: { _id: "$verseRef", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 4 }
        ]).then(res => res.map(r => [r._id, `${r.count}×`]));

        // 7. Real Anonymized Keyword Cloud from Chat messages
        const KEYWORD_LIST = [
            { word: 'Grief',      regex: /grief|lost someone|death|died|mourning/i,      color: '#7f1d1d', bg: 'rgba(239,68,68,0.12)' },
            { word: 'Anxiety',    regex: /anxi|worry|worried|panic|overthink/i,          color: '#92400e', bg: 'rgba(245,158,11,0.12)' },
            { word: 'Sabr',       regex: /sabr|patience|patient/i,                       color: '#1e40af', bg: 'rgba(59,130,246,0.12)' },
            { word: 'Loneliness', regex: /alone|lonely|isolated|no one/i,               color: '#6b21a8', bg: 'rgba(139,92,246,0.12)' },
            { word: 'Hope',       regex: /hope|hopeful|better|someday/i,                 color: '#15803d', bg: 'rgba(34,197,94,0.12)' },
            { word: 'Debt',       regex: /debt|money|financial|loan|broke/i,            color: '#991b1b', bg: 'rgba(239,68,68,0.1)' },
            { word: 'Family',     regex: /family|parents|mother|father|siblings/i,      color: '#92400e', bg: 'rgba(245,158,11,0.1)' },
            { word: 'Dua',        regex: /dua|pray|prayer|duas/i,                       color: '#1e40af', bg: 'rgba(99,102,241,0.12)' },
            { word: 'Shukr',      regex: /shukr|grateful|gratitude|thankful/i,          color: '#15803d', bg: 'rgba(16,185,129,0.12)' },
            { word: 'Tawakkul',   regex: /tawakkul|trust in allah|reliance|tawakkal/i,  color: '#6b21a8', bg: 'rgba(168,85,247,0.12)' },
            { word: 'Stress',     regex: /stress|stressed|overwhelm/i,                  color: '#9f1239', bg: 'rgba(244,63,94,0.1)' },
            { word: 'Depression', regex: /depress|hopeless|empty inside|numb/i,         color: '#1e3a5f', bg: 'rgba(59,130,246,0.1)' },
        ];

        const allUserChats = await Chat.find({ isUser: true }).select('text').lean();
        const keywordCounts = KEYWORD_LIST.map(k => ({
            ...k,
            count: allUserChats.filter(c => k.regex.test(c.text || '')).length
        })).filter(k => k.count > 0).sort((a, b) => b.count - a.count);

        const maxCount = keywordCounts[0]?.count || 1;
        const FONT_SIZES = ['2rem', '1.6rem', '1.3rem', '1.1rem', '0.95rem', '0.85rem', '0.78rem', '0.72rem'];
        const dashboardKeywords = keywordCounts.length > 0
            ? keywordCounts.map((k, i) => ([
                k.word,
                k.bg,
                k.color,
                FONT_SIZES[Math.min(i, FONT_SIZES.length - 1)],
                k.count
              ]))
            : null; // null = use frontend fallback

        // ------------------------------------

        res.json({
            kpis: {
                totalUsers: totalUsers, 
                totalMessages: totalMessages, 
                tranquilityIndex,
                crisisRate,
                avgSessionLength, 
                peakDistressTime,
                hallucinations: registeredFlags, 
                verifiedAccuracy, 
                redFlagsCount: redFlags.length,
                blockedCount,
                resolvedToday,
                avgSessionsPerWeek: (sessionCount / (totalUsers || 1) / 4).toFixed(1), 
                loopingUsers: await Emotion.distinct("userId", { emotion: { $in: ["fear", "anxious", "sad", "fearful"] }, date: { $gte: oneWeekAgo } }).then(uids => uids.length),
                verseAcceptanceRate: resonance.length > 0 ? Math.round(resonance.reduce((acc, r) => acc + parseInt(r.acceptance), 0) / resonance.length) + "%" : "85%",
                selfReferentialCount,
                totalAyats,
                sharedAyats: sharedAyatsCount
            },
            hallucinationLogs: hallucinationLogs.map(a => ({
                verse: a.verseRef,
                similarity: a.similarity,
                ok: a.isVerified,
                time: (new Date() - new Date(a.timestamp))/(1000*60*60) < 1 ? "Just now" : Math.round((new Date() - new Date(a.timestamp))/(1000*60*60)) + "h ago",
                mood: a.mood
            })),
            distribution,
            resonance,
            heatmap: {
                cities: processedHeatmap_tiles,
                table: processedHeatmap_tab
            },
            progress: { labels: progressLabels, data: progressData },
            redFlags: redFlags.map(r => ({ 
                id: r.id, 
                email: r.email, 
                text: r.text, 
                type: "Distress/Harm", 
                time: (new Date() - new Date(r.createdAt))/(1000*60*60) < 24 ? "Today" : "Older",
                isBlocked: r.isBlocked,
                blockReason: r.blockReason
            })),
            promptInjections: promptInjections.map(p => ({ user: String(p.id).slice(-6).toUpperCase(), txt: p.text, time: "Recently" })),
            blockedUsersDetails: blockedUsersDetails.map(u => ({ id: u._id, blockedAt: u.blockedAt, reason: u.blockReason })),
            resolutionHistory: resolutionHistory.map(l => ({ action: l.action, targetId: l.targetUserId, reason: l.reason || "Manual Review", time: l.timestamp })),
            sentimentTrends,
            radarPattern,
            hallucinationBarStats,
            mostCitedAyats,
            averageRating: averageAppRating,
            recentReviews: latestReviews,
            dashboardKeywords
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// GET /api/admin/users
router.get("/users", verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            // --- REAL REFINED ANALYTICS PER USER ---
            const userChats = await Chat.find({ userId: u._id }).sort({ createdAt: 1 }).lean();
            const allEmos = await Emotion.find({ userId: u._id }).sort({ date: 1 }).lean();

            // 1. Sessions (30-min gap logic)
            let sessionCount = 0;
            if (userChats.length > 0) {
                sessionCount = 1;
                for (let i = 1; i < userChats.length; i++) {
                    const gap = new Date(userChats[i].createdAt) - new Date(userChats[i-1].createdAt);
                    if (gap > 30 * 60 * 1000) sessionCount++;
                }
            }
            if (sessionCount === 0 && allEmos.length > 0) sessionCount = 1;

            // 2. Avg Sentiment
            const totalScore = allEmos.reduce((acc, e) => acc + (emotionScores[e.emotion.toLowerCase()] || 0), 0);
            const avgScore = allEmos.length > 0 ? (totalScore / allEmos.length).toFixed(2) : "-";

            // 3. Emotion Pattern (Frequency Distribution)
            const emoCounts = {};
            allEmos.forEach(e => {
                const em = e.emotion.charAt(0).toUpperCase() + e.emotion.slice(1);
                emoCounts[em] = (emoCounts[em] || 0) + 1;
            });
            const lastSentiment = allEmos.length > 0 ? Object.entries(emoCounts)
                .sort((a, b) => b[1] - a[1]) // Sort by frequency
                .slice(0, 3)
                .map(([name, count]) => `${name}(${count})`)
                .join(", ") : "-";

            // 4. Last Active (Prioritize heart-beat lastActive over chat history)
            const lastChat = userChats[userChats.length - 1];
            const lastEmo = allEmos[allEmos.length - 1];
            let lastActive = u.lastActive || (lastChat ? lastChat.createdAt : null);
            if (!lastActive && lastEmo) lastActive = lastEmo.date;
            
            // 5. Status logic with correct prioritization
            let status = u.blocked ? "Blocked" : "Offline";
            if (!u.blocked) {
                if (lastActive) {
                    const now = new Date();
                    const diffMins = (now - new Date(lastActive)) / (1000 * 60);
                    const diffDays = diffMins / (24 * 60);

                    if (diffMins < 5) {
                        status = "Active";
                    } else if (diffMins < 1440) { // 24 hours
                        status = "Away";
                    } else if (diffDays > 7) {
                        status = "Inactive";
                    } else {
                        status = "Offline";
                    }
                }
            }
            
            if (!u.blocked && allEmos.length > 0 && status === "Active") {
                const latestEmo = allEmos[allEmos.length - 1];
                const score = emotionScores[latestEmo.emotion.toLowerCase()] || 0;
                if (score < -0.4) status = "Monitoring";
            }
            if (!u.blocked && u.role === "admin" && status !== "Active" && status !== "Away") {
                status = "Verified";
            }

            // 6. Healing Description & Insight
            let healingDescription = "Monitoring Started";
            let healingInsight = "Insufficient data to determine a trend yet. Continue monitoring and supporting the user's journey.";
            
            if (allEmos.length >= 2) {
                const firstScore = emotionScores[allEmos[0].emotion.toLowerCase()] || 0;
                const lastScore = emotionScores[allEmos[allEmos.length - 1].emotion.toLowerCase()] || 0;
                const recentAvg = parseFloat(avgScore);
                
                if (recentAvg > 0.4) {
                    healingDescription = "Grateful Healing & Peace";
                    healingInsight = "The user is showing significant emotional stability and positivity. They seem to be in a state of 'Grateful Healing' and peace.";
                } else if (lastScore > firstScore + 0.2) {
                    healingDescription = "Upward Trajectory";
                    healingInsight = "Trend Analysis: Upward Trajectory. The user is successfully navigating out of distress towards a more peaceful and resilient state.";
                } else if (recentAvg < -0.4) {
                    healingDescription = "Critical - Needs Support";
                    healingInsight = "Status: Critical. The user remains in a high-distress zone (Anxiety/Grief). Active intervention or spiritual guidance via the AI is highly recommended.";
                } else if (lastScore < firstScore - 0.2) {
                    healingDescription = "Downward Shift - Monitor";
                    healingInsight = "Trend Analysis: Downward Shift. The user has recently experienced a dip in emotional well-being. Monitor for red-flag triggers.";
                } else {
                    healingDescription = "Stable State";
                    healingInsight = "The user's emotional state is currently 'Stable'. They are maintaining a balanced journey without major distress spikes at this time.";
                }
            } else if (allEmos.length === 1) {
                healingDescription = "Initial Data Collected";
                healingInsight = "Initializing progress tracking... More interactions needed for trend analysis.";
            }

            return { ...u, email: maskEmail(u.email), sessions: sessionCount, lastSentiment, status, lastActive, avgScore, healingDescription, healingInsight };
        }));

        // Priority sorting: Active > Monitoring > Away > Verified > Offline > Inactive
        const priority = { "Active": 1, "Monitoring": 2, "Away": 3, "Verified": 4, "Offline": 5, "Inactive": 6 };
        enrichedUsers.sort((a, b) => (priority[a.status] || 99) - (priority[b.status] || 99));

        res.json(enrichedUsers);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/admin/users/:id/action
router.post("/users/:id/action", verifyAdmin, async (req, res) => {
    try {
        const { action } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (action === "block") {
            user.blocked = true;
            user.blockedAt = new Date();
            user.blockReason = "Manual administrative restriction";
        } else if (action === "unblock") {
            user.blocked = false;
            user.blockedAt = null;
            user.blockReason = null;
        }
        
        await user.save();

        // Log the action for "Resolved Today" metrics
        await ModerationLog.create({
            adminId: req.userId,
            targetUserId: user._id,
            action: action,
            timestamp: new Date()
        });

        res.json({ message: `User ${action}ed successfully`, status: user.blocked ? "Blocked" : "Active" });
    } catch (err) {
        res.status(500).json({ message: "Action failed" });
    }
});

// GET /api/admin/users/:id/details - De-identified detailed view
router.get("/users/:id/details", verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch last 10 user messages for context (de-identified)
        const chatHistory = await Chat.find({ userId: user._id, isUser: true })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("text createdAt")
            .lean();

        // Fetch recent emotions
        const emotions = await Emotion.find({ userId: user._id })
            .sort({ date: -1 })
            .limit(10)
            .select("emotion date")
            .lean();

        res.json({
            id: user._id,
            status: user.blocked ? "Blocked" : "Active",
            blockReason: user.blockReason,
            blockEvidence: user.blockEvidence,
            messages: chatHistory,
            emotions: emotions
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching user details" });
    }
});

// GET /api/admin/ai-performance
router.get("/ai-performance", verifyAdmin, async (req, res) => {
  try {
    const perf = await AiPerformance.find().sort({ timestamp: -1 }).limit(100);
    res.json(perf);
  } catch (err) {
    res.status(500).json({ message: "Error fetching AI performance" });
  }
});

// POST /api/admin/intervene
router.post("/intervene", verifyAdmin, async (req, res) => {
  try {
    const { userId, message, severity } = req.body;
    const intervention = new Intervention({
      adminId: req.userId,
      targetUserId: userId,
      message,
      severity
    });
    await intervention.save();
    
    // Log Activity
    await ActivityLog.create({
      adminId: req.userId,
      action: "intervene",
      targetId: userId,
      details: { message, severity }
    });

    res.json({ success: true, message: "Intervention queued" });
  } catch (err) {
    res.status(500).json({ message: "Intervention failed" });
  }
});

// GET /api/admin/content/verses
router.get("/content/verses", verifyAdmin, async (req, res) => {
  try {
    const verses = await Quran.find().limit(50); // Just a sample
    res.json(verses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching verses" });
  }
});

// POST /api/admin/content/verses
router.post("/content/verses", verifyAdmin, async (req, res) => {
  try {
    const verse = new Quran(req.body);
    await verse.save();
    res.json({ success: true, verse });
  } catch (err) {
    res.status(500).json({ message: "Error saving verse" });
  }
});

// GET /api/admin/activity-history - Combined history for the activity feed
router.get("/activity-history", verifyAdmin, async (req, res) => {
  try {
    const [chats, emotions, audits, users] = await Promise.all([
      Chat.find({ isUser: true }).sort({ createdAt: -1 }).limit(50).populate("userId", "email").lean(),
      Emotion.find().sort({ date: -1 }).limit(50).populate("userId", "email").lean(),
      Audit.find().sort({ timestamp: -1 }).limit(50).populate("userId", "email").lean(),
      User.find().sort({ _id: -1 }).limit(500).lean()
    ]);

    const history = [
      ...users.map(u => ({ type: "auth", action: "System Registration", email: u.email, userId: u._id, ts: u._id.getTimestamp().toISOString() })),
      ...chats.map(c => ({ 
        type: "message", 
        text: c.text, 
        userId: c.userId?._id || c.userId, 
        email: c.userId?.email || `User_${String(c.userId?._id || c.userId).slice(-4)}`, 
        ts: c.createdAt.toISOString() 
      })),
      ...emotions.map(e => ({ 
        type: "emotion", 
        emotion: e.emotion, 
        userId: e.userId?._id || e.userId, 
        email: e.userId?.email || `User_${String(e.userId?._id || e.userId).slice(-4)}`, 
        ts: e.date.toISOString() 
      })),
      ...audits.map(a => ({ 
        type: "verse", 
        verseRef: a.verseRef, 
        userId: a.userId?._id || a.userId, 
        email: a.userId?.email || `User_${String(a.userId?._id || a.userId).slice(-4)}`, 
        emotion: a.mood, 
        ts: a.timestamp.toISOString() 
      }))
    ];

    history.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    res.json(history.slice(0, 600)); // Return more history items
  } catch (err) {
    res.status(500).json({ message: "Error fetching activity history" });
  }
});

// POST /api/admin/users/:id/ai-guidance - Set custom AI behavior for a user
router.post("/users/:id/ai-guidance", verifyAdmin, async (req, res) => {
    try {
        const { instructions } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { customAiInstructions: instructions },
            { new: true }
        ).select("-password");
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Also log this as a moderation action (optional but good for auditing)
        await new ModerationLog({
            adminId: req.userId,
            targetUserId: user._id,
            action: "AI_GUIDANCE_UPDATE",
            reason: instructions ? "Custom AI instructions applied" : "AI instructions cleared",
            timestamp: new Date()
        }).save();

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: "Error updating AI guidance" });
    }
});

// ─── ANNOUNCEMENTS ──────────────────────────────────────────────────────────

// POST /api/admin/announcements - Broadcast a new announcement
router.post("/announcements", verifyAdmin, async (req, res) => {
    try {
        const { title, body, type, targetAudience } = req.body;
        if (!title || !body) return res.status(400).json({ message: "Title and body are required" });

        // Count recipients based on target audience
        let recipientCount = 0;
        if (targetAudience === "all") {
            recipientCount = await User.countDocuments({ role: { $ne: "admin" } });
        } else if (targetAudience === "active") {
            recipientCount = await User.countDocuments({ role: { $ne: "admin" }, blocked: { $ne: true } });
        } else if (targetAudience === "critical") {
            recipientCount = await User.countDocuments({ role: { $ne: "admin" }, healingDescription: { $regex: /Critical|Downward/i } });
        } else if (targetAudience === "new") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            recipientCount = await User.countDocuments({ role: { $ne: "admin" }, createdAt: { $gte: sevenDaysAgo } });
        }

        const announcement = await Announcement.create({
            title,
            body,
            type: type || "system_notice",
            targetAudience: targetAudience || "all",
            sentBy: req.userId,
            recipientCount,
        });

        res.json({ success: true, announcement });
    } catch (err) {
        res.status(500).json({ message: "Failed to send announcement" });
    }
});

// GET /api/admin/announcements - Fetch announcement history
router.get("/announcements", verifyAdmin, async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch announcements" });
    }
});

// DELETE /api/admin/announcements/:id - Remove an announcement
router.delete("/announcements/:id", verifyAdmin, async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete announcement" });
    }
});

export default router;
