import express from "express";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import Audit from "../models/Audit.js";
import Chat from "../models/Chat.js";
import Quran from "../models/Quran.js";
import User from "../models/User.js";

// ╔══════════════════════════════════════════════════════════════════╗
// ║  All chatbot logic is imported from the PROTECTED core module.  ║
// ║  DO NOT inline or duplicate any logic from chatbotCore.js here. ║
// ║  If you need to change chatbot behavior, edit chatbotCore.js    ║
// ║  only — changes propagate to both web and mobile automatically. ║
// ╚══════════════════════════════════════════════════════════════════╝
import {
    buildVerseReflectionPrompt,
    CHATBOT_CORE_VERSION,
    detectDominantEmotion,
    EMOTION_TO_DB,
    formatVerseMessage,
    generateSystemPrompt,
    isAbusiveMessage,
    sanitizeBotReply,
    shouldOfferVerse,
    STRICT_REPLY_RULES_PROMPT,
    VERSE_OFFER_INJECTION_PROMPT,
    VERSE_TRIGGER,
} from "../chatbotCore.js";
import ActivityLog from "../models/ActivityLog.js";
import AiPerformance from "../models/AiPerformance.js";
import Intervention from "../models/Intervention.js";
import Emotion from "../models/Emotion.js";

const router = express.Router();

const OPENAI_ENDPOINT = process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-3.5-turbo';

function buildOpenAIRequestBody(messages) {
  const body = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.8,
  };

  if (/^gpt-3\.5|^gpt-4(?!\.1|o)|turbo/i.test(OPENAI_MODEL)) {
    body.max_tokens = 400;
  } else {
    body.max_completion_tokens = 400;
  }

  return body;
}

console.log(`[Qalbify] ChatBot Core v${CHATBOT_CORE_VERSION} loaded.`);

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

// --- History Endpoints ---

router.post("/save", verifyToken, async (req, res) => {
  try {
    const { text, audioUrl, isUser, ts, localDate } = req.body;
    const chat = new Chat({ userId: req.userId, text, audioUrl, isUser, ts, localDate: localDate || new Date().toDateString() });
    await Promise.all([
      chat.save(),
      User.findByIdAndUpdate(req.userId, { lastActive: new Date() }),
    ]);
    res.status(201).json({ message: "Chat saved" });
  } catch (err) {
    console.error("Save Chat Error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/get", verifyToken, async (req, res) => {
  try {
    const [chats] = await Promise.all([
      Chat.find({ userId: req.userId }).sort({ createdAt: 1 }),
      User.findByIdAndUpdate(req.userId, { lastActive: new Date() }),
    ]);
    res.json(chats);
  } catch (err) {
    console.error("Get Chat Error:", err);
    res.status(500).json({ message: err.message });
  }
});

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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(buildOpenAIRequestBody(messages)),
    });
    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API Error Detail:", data.error);
      return sanitizeBotReply("Hmm, my thoughts are loading a little slowly right now. Stay with me for a second?");
    }

    return sanitizeBotReply(data?.choices?.[0]?.message?.content || "Hmm, I'm with you. What feels closest to the surface right now?");
  } catch (error) {
    console.error("OpenAI API Fetch Error:", error);
    return sanitizeBotReply("Hmm, the connection is being awkward right now. What was the main thing you wanted to say?");
  }
}

// ─── VERSE FETCHER (Emotion-aware, de-duplicated) ─────────────────────────────
// Uses EMOTION_TO_DB from chatbotCore — do not redefine mapping here.
async function fetchVerseForEmotion(emotion, seenVerseRefs = []) {
  const dbEmotion = EMOTION_TO_DB[emotion] || 'Depression';
  const query = { Emotion: new RegExp(dbEmotion, 'i') };

  // Exclude already-seen verses this session
  if (seenVerseRefs.length > 0) {
    query['$nor'] = seenVerseRefs.map(ref => {
      const parts = ref.split(' ');
      const ayahNo = parseInt(parts[parts.length - 1]);
      const surahName = parts.slice(0, -1).join(' ');
      return { Surah: new RegExp(surahName, 'i'), 'Ayat no': ayahNo };
    });
  }

  const count = await Quran.countDocuments(query);
  if (count === 0) {
    // Fallback: ignore dedup if no new verses found
    const fallbackQuery = { Emotion: new RegExp(dbEmotion, 'i') };
    const fallbackCount = await Quran.countDocuments(fallbackQuery);
    const fallbackSkip = Math.floor(Math.random() * fallbackCount);
    return await Quran.findOne(fallbackQuery).skip(fallbackSkip);
  }

  const skip = Math.floor(Math.random() * count);
  return await Quran.findOne(query).skip(skip);
}

// POST /api/chat/ask
router.post("/ask", verifyToken, async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      message,
      style,
      religious,
      mood,
      history: frontendHistory,
      seenVerseRefs = [],
      sessionMessageCount,
      sessionId = "guest-session-" + Date.now(),
      systemPrompt,
    } = req.body;

    const io = req.app.get("io");

    const userCheck = await User.findById(req.userId);
    const userEmail = userCheck?.email || `User_${String(req.userId).slice(-4)}`;

    // ── Real-time Activity Feed Emission ──────────────────────────────────
    if (io) {
      io.emit("activity_feed", {
        type: "message",
        text: message.length > 50 ? message.substring(0, 47) + "..." : message,
        userId: req.userId,
        email: userEmail,
        sessionId,
        ts: new Date().toISOString()
      });
    }

    // ── Block check ──────────────────────────────────────────────────────────
    if (userCheck?.blocked) {
      return res.json({
        reply: "Your account is temporarily restricted. Please contact support.",
        blocked: true,
      });
    }

    // ── Crisis detection (Real-time alert) ──────────────────────────────────
    const isCrisis = /suicid|end my life|kill myself|hopeless|pointless|no way out/i.test(message);
    if (isCrisis && io) {
      io.emit("activity_feed", {
        type: "crisis",
        text: message,
        userId: req.userId,
        email: userEmail,
        sessionId,
        severity: "P1",
        ts: new Date().toISOString()
      });
    }

    // ── Abusive language check (uses LOCKED keyword list from core) ──────────
    if (isAbusiveMessage(message)) {
      await User.findByIdAndUpdate(req.userId, {
        blocked: true,
        blockReason: "Violation of community guidelines (abusive language)",
        blockedAt: new Date(),
        blockEvidence: message, // Save the actual text that caused the block
      });
      if (io) io.emit("activity_feed", { type: "alert", text: "User blocked for abuse", severity: "P2", userId: req.userId, email: userEmail, ts: new Date().toISOString() });
      return res.json({
        reply: "Your account has been restricted due to violation of community guidelines (abusive language).",
        blocked: true,
      });
    }

    // ── Update lastActive ────────────────────────────────────────────────────
    await User.findByIdAndUpdate(req.userId, { lastActive: new Date() });

    // ── 1. Fetch persistent history from DB (last 15) ───────────────────────
    const dbHistoryRaw = await Chat.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(15);

    const dbHistory = dbHistoryRaw.map(m => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.text,
    }));

    // ── 2. Merge with frontend history & de-duplicate ────────────────────────
    let history = [...dbHistory].reverse();

    if (Array.isArray(frontendHistory)) {
      frontendHistory.forEach(fMsg => {
        const exists = history.some(
          hMsg => hMsg.content === fMsg.content && hMsg.role === fMsg.role
        );
        if (!exists) history.push(fMsg);
      });
    }

    history = history.slice(-15);

    // ── 3. Count total user messages (Ground Truth for verse trigger) ─────────
    const totalUserMessages = sessionMessageCount ||
      ((await Chat.countDocuments({ userId: req.userId, isUser: true })) + 1);

    // ── 4. Detect dominant emotion ───────────────────────────────────────────
    const fullHistoryForEmotion = [
      ...history,
      { role: 'user', content: message },
    ];
    const detectedEmotion = detectDominantEmotion(
      fullHistoryForEmotion,
      VERSE_TRIGGER.EMOTION_WINDOW
    );

    // Save Emotion to DB with SessionID
    await new Emotion({ userId: req.userId, sessionId, emotion: detectedEmotion }).save();
    if (io) io.emit("activity_feed", { type: "emotion", emotion: detectedEmotion, userId: req.userId, email: userEmail, sessionId, ts: new Date().toISOString() });

    // ── 5. Verse offer trigger ───────────────────────────────────────────────
    let verseOfferPayload = null;
    const isCustomPromptRequest = Boolean(systemPrompt);
    const offerVerse = !isCustomPromptRequest &&
      shouldOfferVerse(totalUserMessages, religious !== false);

    if (offerVerse) {
      const verse = await fetchVerseForEmotion(detectedEmotion, seenVerseRefs);

      if (verse) {
        verseOfferPayload = {
          arabic: verse.Ayat,
          translation: verse.Translation,
          context: verse.Surah,
          tafsir: verse.Tafseer,
          verseRef: `${verse.Surah} ${verse["Ayat no"]}`,
          emotion: detectedEmotion,
          formattedVerse: formatVerseMessage(verse),
          reflectionPrompt: buildVerseReflectionPrompt(
            detectedEmotion,
            verse.Tafseer,
            message
          ),
        };

        // Audit log with SessionID
        new Audit({
          userId: req.userId,
          sessionId,
          verseRef: `${verse.Surah} ${verse["Ayat no"]}`,
          mood: detectedEmotion,
          similarity: "100%",
          isVerified: true,
        })
          .save()
          .catch(err => console.error("Audit log error:", err));
        
        if (io) io.emit("activity_feed", { 
          type: "verse", 
          verseRef: `${verse.Surah} ${verse["Ayat no"]}`, 
          userId: req.userId, 
          email: userEmail, 
          emotion: detectedEmotion,
          sessionId, 
          ts: new Date().toISOString() 
        });
      }
    }

    // ── 7. Build messages for OpenAI ─────────────────────────────────────────
    const sysMsg = systemPrompt
      ? typeof systemPrompt === 'string'
        ? { role: 'system', content: systemPrompt }
        : systemPrompt
      : generateSystemPrompt(
          style || 'Gentle',
          religious !== false,
          detectedEmotion
        );

    // ── Admin Guidance Override ──────────────────────────────────────────────
    if (userCheck.customAiInstructions) {
      sysMsg.content += `\n\n[ADMIN GUIDANCE]: ${userCheck.customAiInstructions}`;
    }

    const messages = [sysMsg, STRICT_REPLY_RULES_PROMPT];
    if (!isCustomPromptRequest && history.length > 0) messages.push(...history);
    if (verseOfferPayload) messages.push(VERSE_OFFER_INJECTION_PROMPT);
    messages.push({ role: 'user', content: message });

    // ── 8. Call OpenAI & Track Performance ──────────────────────────────────
    const aiResponse = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(buildOpenAIRequestBody(messages)),
    });
    const aiData = await aiResponse.json();
    if (aiData.error) {
      console.error("OpenAI API Error Detail:", aiData.error);
    }
    const botReply = sanitizeBotReply(
      aiData?.choices?.[0]?.message?.content ||
      "Hmm, I'm with you. What feels closest to the surface right now?"
    );
    
    // Performance Log
    const latency = Date.now() - startTime;
    const tokens = aiData?.usage?.total_tokens || 0;
    const cost = (tokens / 1000) * 0.002;
    await new AiPerformance({
      sessionId,
      userId: req.userId,
      latency,
      tokens,
      cost,
      status: aiData.error ? "failure" : "success",
      error: aiData.error ? aiData.error.message : null
    }).save();

    // Check for pending Admin Interventions
    const pendingIntervention = await Intervention.findOne({ targetUserId: req.userId, status: "queued" }).sort({ timestamp: -1 });
    let interventionMsg = null;
    if (pendingIntervention) {
      interventionMsg = pendingIntervention.message;
      pendingIntervention.status = "delivered";
      await pendingIntervention.save();
    }

    res.json({
      reply: botReply,
      intervention: interventionMsg,
      detectedEmotion,
      totalUserMessages,
      verseOffer: verseOfferPayload || null,
    });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/chat/verse
router.post("/verse", async (req, res) => {
  try {
    const { mood, usedVerseKeys = [], shortOnly = false } = req.body;

    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, { lastActive: new Date() });
    }

    // Map mood to DB emotion using LOCKED map from core
    const dbEmotion = EMOTION_TO_DB[mood] || 'Happiness';
    const query = { Emotion: new RegExp(dbEmotion, 'i') };

    // Only return short translations (under 120 chars) for Daily Glimmer
    if (shortOnly) {
      query['$expr'] = { $lte: [{ $strLenCP: '$Translation' }, 120] };
    }

    // Exclude already-seen verses this session
    if (usedVerseKeys && usedVerseKeys.length > 0) {
      query['$nor'] = usedVerseKeys.map(ref => {
        const parts = ref.split(' ');
        const ayahNo = parseInt(parts[parts.length - 1]);
        if (isNaN(ayahNo)) return null;
        const surahName = parts.slice(0, -1).join(' ');
        return { Surah: new RegExp(surahName, 'i'), 'Ayat no': ayahNo };
      }).filter(Boolean);
    }

    const count = await Quran.countDocuments(query);
    let verse;
    if (count === 0) {
      const fallbackQuery = { Emotion: new RegExp(dbEmotion, 'i') };
      // Keep shortOnly filter on fallback too
      if (shortOnly) {
        fallbackQuery['$expr'] = { $lte: [{ $strLenCP: '$Translation' }, 120] };
      }
      const fallbackCount = await Quran.countDocuments(fallbackQuery);
      const random = Math.floor(Math.random() * fallbackCount);
      verse = await Quran.findOne(fallbackQuery).skip(random);
    } else {
      const random = Math.floor(Math.random() * count);
      verse = await Quran.findOne(query).skip(random);
    }

    if (verse) {
      new Audit({
        userId: req.userId,
        verseRef: `${verse.Surah} ${verse["Ayat no"]}`,
        mood: mood,
        similarity: "100%",
        isVerified: true,
      })
        .save()
        .catch(err => console.error("Verse Audit log error:", err));

      res.json({
        arabic: verse.Ayat,
        translation: verse.Translation,
        context: verse.Surah,
        tafsir: verse.Tafseer,
        verseRef: `${verse.Surah} ${verse["Ayat no"]}`,
        // LOCKED format, pre-built server-side
        formattedVerse: formatVerseMessage(verse),
      });
    } else {
      res.status(404).json({ message: "No verse found" });
    }
  } catch (error) {
    console.error("Verse Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/chat/guest-ask
router.post("/guest-ask", async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    const sysMsg = systemPrompt
      ? typeof systemPrompt === 'string'
        ? { role: 'system', content: systemPrompt }
        : systemPrompt
      : generateSystemPrompt('Gentle', true, null);

    const messages = [
      sysMsg,
      STRICT_REPLY_RULES_PROMPT,
      { role: 'user', content: message },
    ];

    const botReply = await callAI(messages);
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Guest Chat Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
