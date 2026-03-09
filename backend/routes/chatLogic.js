import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import Chat from "../models/Chat.js";
import Quran from "../models/Quran.js";

const router = express.Router();

const OPENAI_ENDPOINT = process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-3.5-turbo';

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.userId = decoded.id; // Correctly set userId from token
        next();
    });
};

// --- History Endpoints (Consolidated from chatRoutes) ---

// Save message
router.post("/save", verifyToken, async (req, res) => {
    try {
        const { text, audioUrl, isUser, ts } = req.body;
        const chat = new Chat({ userId: req.userId, text, audioUrl, isUser, ts });
        await chat.save();
        res.status(201).json({ message: "Chat saved" });
    } catch (err) {
        console.error("Save Chat Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Get history
router.get("/get", verifyToken, async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.userId }).sort({ createdAt: 1 });
        res.json(chats);
    } catch (err) {
        console.error("Get Chat Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Clear history
router.delete("/clear", verifyToken, async (req, res) => {
    try {
        await Chat.deleteMany({ userId: req.userId });
        res.json({ message: "Chat history cleared" });
    } catch (err) {
        console.error("Clear Chat Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Helper to query OpenAI
async function callAI(messages) {
    try {
        const response = await fetch(OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: messages,
                temperature: 0.8,
                max_completion_tokens: 400
            })
        });
        const data = await response.json();

        if (data.error) {
            console.error("OpenAI API Error Detail:", data.error);
            return "I'm having a little trouble thinking right now, but I'm here for you.";
        }

        return data?.choices?.[0]?.message?.content || "I am here with you.";
    } catch (error) {
        console.error("OpenAI API Fetch Error:", error);
        return "I am having trouble connecting right now, but I am here for you.";
    }
}

// POST /api/chat/ask
router.post("/ask", verifyToken, async (req, res) => {
    try {
        const { message, systemPrompt, mood, history: frontendHistory } = req.body;
        let context = "";

        // 1. Fetch persistent history from DB (Silent Memory) - reduced to 15 messages
        const dbHistoryRaw = await Chat.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(15);

        const dbHistory = dbHistoryRaw.map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.text
        }));

        // 2. Merge with Frontend History (Immediate Memory) & De-duplicate
        // We use DB as the chronological base [Oldest -> Newest]
        let history = [...dbHistory].reverse();

        if (Array.isArray(frontendHistory)) {
            frontendHistory.forEach(fMsg => {
                // Check if this frontend message is already in our DB history (by content + role)
                const exists = history.some(hMsg => hMsg.content === fMsg.content && hMsg.role === fMsg.role);
                if (!exists) {
                    // It's a new unsaved message from this session, append it to the end
                    history.push(fMsg);
                }
            });
        }

        // Final slice to 15 for the context window
        history = history.slice(-15);

        // 3. Keyword/Reference Search in Quran
        const surahMatch = message.match(/(?:surah|chapter)\s+([a-zA-Z\-\s]+)/i);
        const ayahMatch = message.match(/(?:ayah|verse)\s+(\d+)/i);

        let query = {};

        if (surahMatch) {
            const surahNameRegex = new RegExp(surahMatch[1].trim(), 'i');
            query.Surah = surahNameRegex;
        }

        if (ayahMatch) {
            query["Ayat no"] = parseInt(ayahMatch[1]);
        }

        // ONLY execute Quran query if an explicit reference (Surah or Ayah) was found
        const isExplicitRequest = surahMatch || ayahMatch;
        let quranResults = [];

        if (isExplicitRequest) {
            // Limit to 3 to avoid overwhelming context
            quranResults = await Quran.find(query).limit(3);
        }

        if (quranResults.length > 0) {
            context = "\n\nRelevant Quranic Verses:\n";
            quranResults.forEach(doc => {
                context += `[Surah ${doc.Surah}, Ayah ${doc["Ayat no"]}]: ${doc.Ayat}\nTranslation: ${doc.Translation}\nTafsir: ${doc.Tafseer}\n\n`;
            });
            context += "Instructions: Use the above Quranic verses to answer the user's question or provide comfort. Cite them accurately (Surah Name: Ayah Number).\n";
        }

        // 2. Construct Messages for OpenAI
        const messages = [
            systemPrompt || { role: "system", content: "You are a helpful assistant." }
        ];

        // Append Hybrid History (Last 15 messages)
        if (history.length > 0) {
            messages.push(...history);
        }

        // Append Current Message
        messages.push({ role: "user", content: message + context });

        // 3. FINAL REINFORCEMENT (crucial placement)
        messages.push({
            role: "system",
            content: "STRICT RULES: Keep your response to 1-3 short sentences max. NO paragraphs. Only mention past chat topics if they are directly relevant to the current query. STAY CASUAL."
        });

        // 4. Call OpenAI
        const botReply = await callAI(messages);

        res.json({ reply: botReply, contextUsed: quranResults.length > 0 });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST /api/chat/verse
// Dedicated endpoint to get a verse for a mood
router.post("/verse", async (req, res) => {
    try {
        const { mood } = req.body;
        // Map mood to dataset Emotion if possible
        // Expected moods: 'sad', 'anxious', 'fearful', 'happy'
        // Dataset Emotions likely: 'Depression' (for sad), 'Anxiety', 'Fear', 'Happiness'

        let dbEmotion = "";
        if (mood === 'sad') dbEmotion = "Depression";
        else if (mood === 'anxious') dbEmotion = "Anxiety";
        else if (mood === 'fearful') dbEmotion = "Fear";
        else if (mood === 'happy') dbEmotion = "Happiness";

        let query = {};
        if (dbEmotion) {
            // Use regex for flexible matching (handles 'Depression ' vs 'Depression', and multi-tags)
            query.Emotion = new RegExp(dbEmotion, 'i');
        } else {
            // Fallback
            query.Emotion = new RegExp("Happiness", 'i');
        }

        // Get count to random pick
        const count = await Quran.countDocuments(query);
        const random = Math.floor(Math.random() * count);
        const verse = await Quran.findOne(query).skip(random);

        if (verse) {
            res.json({
                arabic: verse.Ayat,
                translation: verse.Translation,
                context: verse.Surah,
                tafsir: verse.Tafseer
            });
        } else {
            res.status(404).json({ message: "No verse found" });
        }

    } catch (error) {
        console.error("Verse Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
