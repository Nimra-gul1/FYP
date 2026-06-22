import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio as ExpoAudio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "./components/ThemedToast";
import { apiFetch } from "./utils/api";
import { hp, rf, scale } from "./utils/responsive";
import { MOOD_THEMES, MoodTheme } from "../constants/MoodThemes";

import {
  buildVerseReflectionPrompt,
  CHATBOT_CORE_VERSION,
  detectNegativeSelfTalk,
  formatVerseMessage,
  isAffirmative,
  isExplicitVerseRequest,
  isNegative,
  // VERSE_CONTINUATIONS,
  VERSE_LEAD_INS,
} from "../backend/chatbotCore.js";

// ── Dev assertion: ensure core is loaded (strips in production) ───────────────
if (__DEV__) {
  console.log(
    `[Qalbify] ChatBot Core v${CHATBOT_CORE_VERSION} loaded on mobile.`,
  );
}

// ─── NOTE: generateSystemPrompt is imported from chatbotCore — do NOT define
//     it locally here. The import above is the single source of truth. ─────────

// ===== Helpers =====
const timeNow = () =>
  new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
const VARIATION_SNIPPETS = [
  "— keep going.",
  "💜",
  "I've got you.",
  "That matters.",
  "I'm with you in this.",
];

// ===== Greeting & Farewell Messages =====
const GREETING_MESSAGES = [
  "Hey! So glad you're here. How's everything today? ✨",
  "Hello! I was just thinking about our last chat. How've you been? 🙌",
  "Hey there! I'm all ears. What's the latest? 👂",
  "Welcome back! Hope your internal weather is calm today. How are you really? 🌊",
  "Hi! It's always so good to see you. How's your heart feeling? 💜",
  "Hey friend! Ready to just vent or chill? We can go with whichever feels easy. 🦄",
  "You're back! I've been looking forward to this. How was your day? 🚀",
  "Hey! I'm just happy to be in your space. How's life treating you? 🌈",
  "Hi! If you need a safe spot to talk, we can start small. What's on your mind? 🍃",
  "Yo! Hope your day is going great. What's been the highlight so far? 🌟",
  "Hey! Just checking in on my favorite person. How's the mood? 🎈",
];

const FAREWELL_MESSAGES = [
  "Take care, friend. Talk soon — come back whenever it feels right. 💜",
  "Have a peaceful day ahead. I'll be glad to pick this up again.",
  "See you later! Sending you good vibes and calm thoughts.",
  "Bye for now! May your heart stay light and your day be kind.",
  "Okay, I'm going too! Rest well, and come back whenever you want to chat.",
  "Take it easy! I'll miss our talk, but I'll be waiting with a smile.",
  "Stay safe and happy! See you next time.",
];

// ===== Emotion Detection (HF API + keyword fallback) =========================
// This is the CLIENT-SIDE emotion detection used for the HF model (real-time UX).
// The AUTHORITATIVE emotion for verse selection is always computed server-side
// in chatbotCore.detectDominantEmotion — this local version is supplementary.
const detectEmotion = async (recentUserTexts: string[]): Promise<string> => {
  if (recentUserTexts.length === 0) return "neutral";

  const context = recentUserTexts.slice(-10).join(" ").slice(0, 600);
  // ===== Hugging Face API Config =====

  const HF_API_URL = process.env.EXPO_PUBLIC_HF_API_URL;
  const HF_API_KEY = process.env.EXPO_PUBLIC_HF_API_KEY;
  try {
    if (!HF_API_URL || !HF_API_KEY)
      throw new Error("Missing Hugging Face API configuration");
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: context }),
    });
    const data = await res.json();

    if (Array.isArray(data) && data[0]?.label && data[0].score >= 0.3) {
      const label = data[0].label.toLowerCase();
      let emotion = "neutral";
      if (label === "joy") emotion = "happy";
      else if (label === "sadness") emotion = "sad";
      else if (label === "fear") emotion = "fearful";
      else if (label === "anger") emotion = "anxious";
      return emotion;
    }
  } catch {
    // HF failed → keyword fallback
  }

  const lower = context.toLowerCase();
  if (
    /(sad|down|heavy|depress|low|upset|hurt|cry|empty|lost|broken|pain|ache|tough|demotivate|confused|exhausted|burden|drained|yaar|uff|dil|gham|pareshaan)/i.test(
      lower,
    )
  )
    return "sad";
  if (
    /(anxious|worry|stress|nervous|panic|overthink|tense|restless|pressure|dar|ghabrahat|fikr)/i.test(
      lower,
    )
  )
    return "anxious";
  if (
    /(afraid|scared|fear|terrified|dread|panic|threat|unsafe|dar|khauf|darr)/i.test(
      lower,
    )
  )
    return "fearful";
  if (
    /(happy|glad|joy|great|awesome|excited|blessed|grateful|peace|alhamdulillah|mashallah|sukoon)/i.test(
      lower,
    )
  )
    return "happy";

  return "neutral";
};

// === Save Emotion to Backend ===
const saveEmotionToBackend = async (emotion: string) => {
  if (emotion === "neutral") return;
  try {
    await apiFetch("/api/emotion/save", {
      method: "POST",
      body: JSON.stringify({ mood: emotion }),
    });
  } catch (err) {
    console.error("Failed to save emotion:", err);
  }
};

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState<ExpoAudio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<
    "idle" | "recording" | "stopped"
  >("idle");
  const [tempAudioUri, setTempAudioUri] = useState<string | null>(null);
  const [currentSound, setCurrentSound] = useState<ExpoAudio.Sound | null>(
    null,
  );
  const [isTyping, setIsTyping] = useState(false);
  const [transcribedAudioUrl, setTranscribedAudioUrl] = useState<string | null>(
    null,
  );
  const [lastOfferedMood, setLastOfferedMood] = useState<string | null>(null);
  const [recentAssistantReplies, setRecentAssistantReplies] = useState<
    string[]
  >([]);
  const [theme, setTheme] = useState("lavenderDream");
  const [appTheme, setAppTheme] = useState<MoodTheme>(MOOD_THEMES[0]);
  const [fontStyle, setFontStyle] = useState("Poppins");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Conversation tracking
  const [recentUserMoods, setRecentUserMoods] = useState<string[]>([]);
  const sessionMsgCountRef = useRef(0);
  const recentUserTextsRef = useRef<string[]>([]);
  const messageIdCounterRef = useRef(0);

  // ── pendingVerseOffer: set by SERVER response (data.verseOffer), never locally
  //    This is the ONLY place verse state lives on the frontend.
  //    The decision of WHEN to offer a verse is made exclusively by the server
  //    (chatbotCore.shouldOfferVerse). Frontend only renders what server says.
  const [pendingVerseOffer, setPendingVerseOffer] = useState<{
    mood: string;
    arabic?: string;
    translation?: string;
    tafsir?: string;
    context?: string;
    verseRef?: string;
    formattedVerse?: string;
    reflectionPrompt?: string;
  } | null>(null);

  // === Verse deduplication: track used verse refs ===
  const [usedVerseKeys, setUsedVerseKeys] = useState<string[]>([]);

  const hasLoadedHistoryRef = useRef(false);

  // === Personalization State ===
  const [comfortStyle, setComfortStyle] = useState("Gentle");
  const [religiousGuidance, setReligiousGuidance] = useState(true);

  const fetchPreferences = async () => {
    try {
      const res = await apiFetch("/api/user/preferences");
      const data = await res.json();
      if (data) {
        if (data.comfortStyle) setComfortStyle(data.comfortStyle);
        if (data.religiousGuidance !== undefined)
          setReligiousGuidance(data.religiousGuidance);
      }
    } catch (e) {
      console.error("Failed to load preferences", e);
    }
  };

  const savePreferences = async (newStyle: string, newReligious: boolean) => {
    try {
      await apiFetch("/api/user/preferences", {
        method: "PUT",
        body: JSON.stringify({
          comfortStyle: newStyle,
          religiousGuidance: newReligious,
        }),
      });
      setComfortStyle(newStyle);
      setReligiousGuidance(newReligious);
    } catch (e) {
      console.error("Failed to save preferences", e);
    }
  };

  // === Menu Actions ===
  const handleClearChat = () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure? This will remove the current conversation but keep your preferences.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setMessages([]);
            setUsedVerseKeys([]); // Reset verse dedup on clear
            setPendingVerseOffer(null);
            sessionMsgCountRef.current = 0;
            recentUserTextsRef.current = [];
            try {
              await apiFetch("/api/chat/clear", { method: "DELETE" });
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchPreferences();
      loadAppTheme();
    }, []),
  );

  const loadAppTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem("appTheme");
      const selectedTheme =
        MOOD_THEMES.find((item) => item.id === saved) || MOOD_THEMES[0];
      setAppTheme(selectedTheme);
    } catch (e) {
      setAppTheme(MOOD_THEMES[0]);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const wallpaperList = [
    require("../assets/wallpapers/bg1.jpeg"),
    require("../assets/wallpapers/bg2.jpeg"),
    require("../assets/wallpapers/bg3.jpeg"),
    require("../assets/wallpapers/bg4.jpeg"),
    require("../assets/wallpapers/bg5.jpeg"),
    require("../assets/wallpapers/bg6.jpeg"),
    require("../assets/wallpapers/bg7.jpeg"),
  ];

  const themes: Record<string, [string, string, string]> = {
    lavenderDream: ["#a48aff", "#c5b3ff", "#e2d9ff"],
    oceanBreeze: ["#6be9e4", "#b0f4ff", "#d5fbff"],
    rosePetal: ["#FCE4EC", "#F8BBD0", "#F48FB1"],
    mintWhisper: ["#88f7a0", "#b4ffd1", "#e3ffe5"],
    roseCloud: ["#ffa7c4", "#ffc1e3", "#ffe2f4"],
    cosmicMist: ["#9c8cff", "#c3a8ff", "#e0d4ff"],
    pastelSunrise: ["#ffd6ba", "#ffe2d2", "#fff1e0"],
    pastelOcean: ["#b6f0f4", "#d0f7ff", "#e6fdff"],
    pastelLavender: ["#e0c3ff", "#f0dfff", "#f7e9ff"],
  };

  const fonts: Record<string, string> = {
    Poppins: "Poppins",
    Cursive: "cursive",
    Monospace: "monospace",
    Times: "Times New Roman",
    Roboto: "Roboto",
    Comic: "Comic Sans MS",
  };

  const recordingWaveHeights = [22, 30, 38, 28, 34];

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadChats = async () => {
        // If we already have messages in this session, don't re-fetch unless it's empty
        // This prevents the "disappearing" effect when you briefly leave and come back
        if (messages.length > 0 && hasLoadedHistoryRef.current) {
          return;
        }

        try {
          const res = await apiFetch("/api/chat/get");
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            const latestFirst = [...data].reverse();
            setMessages(latestFirst);
            hasLoadedHistoryRef.current = true;
          } else {
            // Only set to empty if we are sure it's a new user or history was cleared
            if (hasLoadedHistoryRef.current === false) {
              setMessages([]);
              hasLoadedHistoryRef.current = true;
            }
          }

          // Always add a friendly greeting when the screen is opened
          const randomGreeting =
            GREETING_MESSAGES[
              Math.floor(Math.random() * GREETING_MESSAGES.length)
            ];

          const msg = {
            id: "g-" + Date.now(),
            text: randomGreeting,
            isUser: false,
            ts: timeNow(),
          };

          setMessages((prev) => {
            // Check if we already have this exact greeting as the most recent message to avoid duplicates
            if (prev.length > 0 && prev[0].text === randomGreeting) return prev;
            return [msg, ...prev];
          });

          await AsyncStorage.removeItem("needsGreeting");

          sessionMsgCountRef.current = 0;
          recentUserTextsRef.current = [];
          setPendingVerseOffer(null);
          setUsedVerseKeys([]);
        } catch (err) {
          console.error("Error loading chats:", err);
          // On error, keep existing messages
        }
      };

      loadChats();
    }, [messages.length]),
  );

  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const loadUserEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) setUserEmail(email);
    };
    loadUserEmail();
  }, []);

  const saveChat = async (msg: {
    text: string;
    isUser: boolean;
    ts: string;
    audioUrl?: string;
  }) => {
    try {
      await apiFetch("/api/chat/save", {
        method: "POST",
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  };

  const appendMessage = (
    text: string,
    isUser = false,
    audioUrl?: string,
    persist = true,
  ) => {
    messageIdCounterRef.current += 1;
    const msg = {
      id: `${isUser ? "u" : "b"}-${Date.now()}-${messageIdCounterRef.current}`,
      text,
      isUser,
      ts: timeNow(),
      localDate: new Date().toDateString(),
      audioUrl,
    };
    setMessages((prev) => [msg, ...prev]);
    if (persist) saveChat(msg);
  };

  const getMessageKey = (item: any) => {
    if (item._id) return `db-${item._id}`;
    if (item.id) return `local-${item.id}`;

    const owner = item.isUser ? "user" : "bot";
    const textPreview =
      typeof item.text === "string" ? item.text.slice(0, 80) : "audio";
    return `${owner}-${item.ts || "no-time"}-${textPreview}`;
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access gallery is required!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setBgImage(selectedImage);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    } catch (e) {
      console.error("Error picking image:", e);
    }
  };

  // ── callAI: calls backend /ask with full history context ───────────────────
  // The server handles emotion detection, verse triggering, and tone adaptation.
  // Frontend passes style/religious for system prompt generation but does NOT
  // re-implement any of that logic locally.
  const callAI = async (
    userText: string,
    contextNote?: string,
    currentCount: number = 0,
  ) => {
    setIsTyping(true);
    try {
      const history = messages
        .filter((m) => !m.text.includes("Voice Message (Processing...)"))
        .filter((m) => !m.text.includes("Oops... I connection issue"))
        .filter((m) => !m.text.includes("keep going"))
        .map((m) => ({
          role: m.isUser ? "user" : "assistant",
          content: m.text,
        }))
        .slice(0, 15)
        .reverse();

      const res = await apiFetch("/api/chat/ask", {
        method: "POST",
        body: JSON.stringify({
          style: comfortStyle,
          religious: religiousGuidance,
          message: contextNote
            ? `${userText}\n\n[System Note: ${contextNote}]`
            : userText,
          mood: lastOfferedMood,
          history: history,
          seenVerseRefs: usedVerseKeys,
          sessionMessageCount: currentCount,
        }),
      });

      const data = await res.json();
      setIsTyping(false);
      return data;
    } catch (e) {
      console.error(e);
      setIsTyping(false);
      return "Oops... connection issue 😅";
    }
  };

  const ensureNonRepetitive = (reply: string) => {
    const lastFew = recentAssistantReplies.slice(-8);
    if (!lastFew.includes(reply)) {
      setRecentAssistantReplies((r) => [...r, reply].slice(-12));
      return reply;
    }
    const snippet =
      VARIATION_SNIPPETS[Math.floor(Math.random() * VARIATION_SNIPPETS.length)];
    const newReply = reply + " " + snippet;
    setRecentAssistantReplies((r) => [...r, newReply].slice(-12));
    return newReply;
  };

  // ── provideVerseWithTafsir: renders a verse that the SERVER selected ────────
  // Uses LOCKED format helpers from chatbotCore. Never re-fetches independently
  // unless preSelectedData is absent (explicit user request fallback).
  // The LOCKED format: ﴿ arabic ﴾ + Translation + Explanation + Reference
  const provideVerseWithTafsir = async (
    mood: string,
    userMessage: string,
    preSelectedData?: any,
  ) => {
    try {
      let data = preSelectedData;

      if (!data) {
        // Fallback fetch for explicit verse requests not pre-selected by server
        const res = await apiFetch("/api/chat/verse", {
          method: "POST",
          body: JSON.stringify({ mood, usedVerseKeys }),
        });
        data = await res.json();
      }

      if (!data || !data.arabic) {
        appendMessage(
          "I've shared most of what I know for now... but just know, ease can still find a way in. 💜",
          false,
        );
        return;
      }

      const {
        arabic,
        translation,
        context,
        tafsir,
        verseRef,
        formattedVerse,
        reflectionPrompt,
      } = data;
      const key = verseRef || arabic.slice(0, 30);
      setUsedVerseKeys((prev) => [...prev, key]);

      // LOCKED: lead-in from core constants
      const leadIn =
        VERSE_LEAD_INS[Math.floor(Math.random() * VERSE_LEAD_INS.length)];
      appendMessage(leadIn, false);

      // LOCKED: verse format — use server-provided formattedVerse if available,
      // otherwise build with the locked formatVerseMessage helper from core.
      setTimeout(() => {
        const verseText =
          formattedVerse ||
          formatVerseMessage({
            Ayat: arabic,
            Translation: translation,
            Surah: context,
            Tafseer: tafsir,
            "Ayat no": verseRef?.split(" ").pop() || "",
          });
        appendMessage(verseText, false);
      }, 900);

      // LOCKED: reflection — use server-provided reflectionPrompt if available,
      // otherwise build with the locked buildVerseReflectionPrompt helper from core.
      setTimeout(async () => {
        try {
          const prompt =
            reflectionPrompt ||
            buildVerseReflectionPrompt(mood, tafsir, userMessage);
          const resReflect = await apiFetch("/api/chat/ask", {
            method: "POST",
            body: JSON.stringify({
              style: comfortStyle,
              religious: religiousGuidance,
              message:
                "Share a warm, short personal reflection on this verse for the person.",
              systemPrompt: { role: "system", content: prompt },
            }),
          });
          const dataReflect = await resReflect.json();
          if (dataReflect.reply) {
            appendMessage(dataReflect.reply, false);
          }
        } catch (e) {
          console.error("Reflection fetch error:", e);
        }
      }, 2200);

      // LOCKED: continuation from core constants
      setTimeout(() => {
        const cont =
          // VERSE_CONTINUATIONS[
          //   Math.floor(Math.random() * VERSE_CONTINUATIONS.length)
          // ];
          "Just wanted you to have that. 💜";
        appendMessage(cont, false);
      }, 4200);

      setLastOfferedMood(mood);
    } catch (e) {
      console.error("Error fetching verse:", e);
      appendMessage("Let's stay with one small breath for a second. 💜", false);
    }
  };

  // ── MAIN: Process User Message ─────────────────────────────────────────────
  // Order of operations:
  // 1. Append user message
  // 2. Detect client-side emotion (for emotion saving only)
  // 3. Call server /ask (server handles verse trigger, tone adaptation, emotion)
  // 4. If server returns verseOffer → store in pendingVerseOffer
  // 5. If pendingVerseOffer already exists → check if user is affirming/declining
  // 6. If explicit verse request → fetch directly
  // 7. Otherwise render reply normally
  const processUserMessage = async (
    text: string,
    audioUrl?: string,
    skipAppend = false,
    persistReply = true,
  ) => {
    if (!skipAppend) {
      appendMessage(text, true, audioUrl, true);
    }

    sessionMsgCountRef.current += 1;
    recentUserTextsRef.current = [...recentUserTextsRef.current, text].slice(
      -10,
    );

    // === Streak Tracking ===
    try {
      const email = await AsyncStorage.getItem("userEmail");
      const streakKey = email ? `userStreak_${email}` : "userStreak";
      const dateKey = email ? `lastActiveDate_${email}` : "lastActiveDate";

      const lastDate = await AsyncStorage.getItem(dateKey);
      const currentStreakStr = await AsyncStorage.getItem(streakKey);
      let currentStreak = currentStreakStr ? parseInt(currentStreakStr) : 0;

      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastDate !== today) {
        currentStreak = lastDate === yesterdayStr ? currentStreak + 1 : 1;
        await AsyncStorage.setItem(streakKey, currentStreak.toString());
        await AsyncStorage.setItem(dateKey, today);
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
    }

    // === Parallel: client emotion detection + server AI reply ===
    const emotionPromise = detectEmotion(recentUserTextsRef.current);

    // ── contextNote for negative self-talk (uses LOCKED detector from core) ──
    let contextNote = "";
    if (detectNegativeSelfTalk(text)) {
      contextNote =
        "The person is being very hard on themselves right now. Respond with genuine warmth — not analysis, not cheerleading, just a steady, calm presence that makes them feel less alone. Don't name what they're feeling. Don't say their feelings are valid. Just be real and soft with them.";
    }

    const replyPromise = callAI(text, contextNote, sessionMsgCountRef.current);

    // Save client-side emotion (supplementary, not authoritative for verses)
    const currentEmotion = await emotionPromise;
    if (currentEmotion !== "neutral") saveEmotionToBackend(currentEmotion);

    const updatedMoods = [...recentUserMoods, currentEmotion].slice(-10);
    setRecentUserMoods(updatedMoods);

    const data = await replyPromise;

    let reply = "";
    if (typeof data === "string") {
      reply = data;
    } else {
      reply = data.reply || "Hmm, keep going. 💜";

      // ── Server-driven verse offer (AUTHORITATIVE) ──────────────────────────
      // The server's shouldOfferVerse() decided this. We store it and wait for
      // user confirmation. Frontend NEVER independently triggers verse offers.
      if (data.verseOffer) {
        setPendingVerseOffer({
          mood: data.verseOffer.emotion || "sad",
          ...data.verseOffer,
        });
      }
    }

    // ── Pending verse offer confirmation check ─────────────────────────────
    // Uses LOCKED isAffirmative / isNegative from chatbotCore
    if (pendingVerseOffer) {
      if (isAffirmative(text)) {
        const verseData = pendingVerseOffer;
        setPendingVerseOffer(null);
        await provideVerseWithTafsir(verseData.mood, text, verseData);
        return;
      } else if (isNegative(text)) {
        setPendingVerseOffer(null);
        appendMessage(
          "All good — I'm glad we can just sit with this gently. 🙂",
          false,
        );
        return;
      }
      // User said something unrelated → drop the pending offer silently
      setPendingVerseOffer(null);
    }

    // ── Explicit verse request (uses LOCKED isExplicitVerseRequest from core) ─
    if (isExplicitVerseRequest(text)) {
      const mood = currentEmotion !== "neutral" ? currentEmotion : "sad";
      await provideVerseWithTafsir(mood, text);
      return;
    }

    reply = ensureNonRepetitive(reply);
    appendMessage(reply, false, undefined, persistReply);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await processUserMessage(text, transcribedAudioUrl || undefined);
    setTranscribedAudioUrl(null);
  };

  // === Voice Recording Logic ===
  const startRecording = async () => {
    try {
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {}
        setRecording(null);
      }
      const perm = await ExpoAudio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await ExpoAudio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } =
          await ExpoAudio.Recording.createAsync(
            ExpoAudio.RecordingOptionsPresets.LOW_QUALITY,
          );
        setRecording(newRecording);
        setRecordingStatus("recording");
      } else {
        showToast("Microphone permission required", "error");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
      setRecording(null);
      setRecordingStatus("idle");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingStatus("stopped");
      setTempAudioUri(uri);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {}
    }
    setRecording(null);
    setRecordingStatus("idle");
    setTempAudioUri(null);
  };

  const sendVoiceMessage = async (uriOverride?: string) => {
    const uriToSend = uriOverride || tempAudioUri;
    if (!uriToSend) return;

    try {
      setIsTyping(true);
      setRecordingStatus("idle");

      const formData = new FormData();
      formData.append("audio", {
        uri: uriToSend,
        type: "audio/m4a",
        name: "voice.m4a",
      } as any);

      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE}/api/transcribe`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await res.json();

      if (data.text) {
        setInput(data.text);
        setTranscribedAudioUrl(data.audioUrl);
      } else {
        showToast("No speech detected", "error");
      }
    } catch (e) {
      console.error("Voice input error:", e);
      showToast("Failed to process voice", "error");
    } finally {
      setIsTyping(false);
      setTempAudioUri(null);
    }
  };

  const stopAndSend = async () => {
    if (!recording) return;
    try {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {}
      const uri = recording.getURI();
      setRecording(null);
      setRecordingStatus("idle");
      if (uri) await sendVoiceMessage(uri);
    } catch (error) {
      console.error("Error doing instant send:", error);
      setRecording(null);
      setRecordingStatus("idle");
    }
  };

  const playAudio = async (url: string) => {
    try {
      if (currentSound) await currentSound.unloadAsync();
      const { sound } = await ExpoAudio.Sound.createAsync({ uri: url });
      setCurrentSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play audio", error);
    }
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[styles.messageRow, item.isUser ? styles.userRow : styles.botRow]}
    >
      {!item.isUser && (
        <View style={styles.avatarWrapper}>
          <Image source={require("../assets/luna.png")} style={styles.avatar} />
        </View>
      )}
      {item.isUser ? (
        <LinearGradient
          colors={[appTheme.primary, appTheme.accent]}
          style={[styles.bubble, styles.userBubble]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {item.audioUrl ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity onPress={() => playAudio(item.audioUrl)}>
                <Ionicons name="play-circle" size={32} color="#FFF" />
              </TouchableOpacity>
              <View
                style={{
                  height: 4,
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.4)",
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 10, color: "#FFF", marginLeft: 8 }}>
                Voice
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.msgText,
                { color: "#FFF", fontFamily: fonts[fontStyle] },
              ]}
            >
              {item.text}
            </Text>
          )}
          <Text style={[styles.tsText, { color: "rgba(255,255,255,0.7)" }]}>
            {item.ts}
          </Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.botBubble]}>
          {item.audioUrl ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity onPress={() => playAudio(item.audioUrl)}>
                <Ionicons name="play-circle" size={32} color="#5e35b1" />
              </TouchableOpacity>
              <View
                style={{
                  height: 4,
                  flex: 1,
                  backgroundColor: "rgba(94, 53, 177, 0.2)",
                  borderRadius: 2,
                }}
              />
              <Text style={{ fontSize: 10, color: "#5e35b1", marginLeft: 8 }}>
                Voice
              </Text>
            </View>
          ) : (
            <Text style={[styles.msgText, { fontFamily: fonts[fontStyle] }]}>
              {item.text}
            </Text>
          )}
          <Text style={styles.tsText}>{item.ts}</Text>
        </View>
      )}
    </View>
  );

  const Background = () => {
    if (bgImage)
      return (
        <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFill} />
      );
    return (
      <LinearGradient
        colors={appTheme.colors as any}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Background />

        {/* Ambient background orbs for depth */}
        <View
          style={[
            styles.orb,
            { top: -60, right: -100, backgroundColor: "#A4B0F5" },
          ]}
        />
        <View
          style={[
            styles.orb,
            { bottom: 100, left: -120, backgroundColor: "#FFE4E1" },
          ]}
        />
        <View
          style={[
            styles.orb,
            {
              top: "40%",
              right: -150,
              backgroundColor: "#E0C3FC",
              width: 250,
              height: 250,
            },
          ]}
        />

        <LinearGradient
          colors={[appTheme.colors[0], appTheme.colors[1]]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Text
            style={[
              styles.headerTitle,
              { color: appTheme.primary, letterSpacing: 1.5 },
            ]}
          >
            Qalbify
          </Text>
          <Text style={[styles.headerSub, { color: appTheme.textDim }]}>
            Your calm chat companion
          </Text>
        </LinearGradient>

        <TouchableOpacity
          style={styles.topLeftIcon}
          onPress={() => setShowMenu(!showMenu)}
        >
          <LinearGradient
            colors={[appTheme.primary, appTheme.accent]}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topRightIcon}
          onPress={() => setShowCustomize(true)}
        >
          <LinearGradient
            colors={[appTheme.primary, appTheme.accent]}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="color-palette" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {showMenu && (
          <>
            <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
              <View style={styles.menuOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.popupMenu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  handleClearChat();
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                <Text style={[styles.menuText, { color: "#E74C3C" }]}>
                  Clear Chat
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Modal visible={showCustomize} transparent animationType="slide">
          <View style={styles.modalContainer}>
            {/* Ambient background orbs for depth inside modal */}
            <View
              style={[
                styles.orb,
                {
                  top: 50,
                  right: -120,
                  backgroundColor: "#6366F1",
                  opacity: 0.3,
                },
              ]}
            />
            <View
              style={[
                styles.orb,
                {
                  bottom: 50,
                  left: -100,
                  backgroundColor: "#D946EF",
                  opacity: 0.3,
                },
              ]}
            />

            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Customize</Text>

              <FlatList
                data={[{ key: "content" }]}
                renderItem={() => (
                  <View onStartShouldSetResponder={() => true}>
                    <Text style={styles.modalSub}>Theme</Text>
                    <View style={styles.optionsRow}>
                      {Object.keys(themes).map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.colorOption,
                            { backgroundColor: themes[t][0] },
                          ]}
                          onPress={() => setTheme(t)}
                        />
                      ))}
                    </View>

                    <Text style={styles.modalSub}>Font</Text>
                    <View style={styles.optionsRow}>
                      {Object.keys(fonts).map((f) => (
                        <TouchableOpacity
                          key={f}
                          onPress={() => setFontStyle(f)}
                        >
                          <Text
                            style={[
                              styles.fontOption,
                              { fontFamily: fonts[f] },
                            ]}
                          >
                            {f}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.modalSub}>Wallpaper</Text>
                    <View style={styles.optionsRow}>
                      {wallpaperList.map((w, i) => (
                        <TouchableOpacity
                          key={`wallpaper-${i}`}
                          onPress={() =>
                            setBgImage(Image.resolveAssetSource(w).uri)
                          }
                        >
                          <Image source={w} style={styles.wallOption} />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.pickGalleryBtn}
                      onPress={pickImageFromGallery}
                    >
                      <Text style={styles.pickGalleryText}>
                        Pick from Gallery
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeBgBtn}
                      onPress={() => {
                        setBgImage(null);
                        Animated.timing(fadeAnim, {
                          toValue: 0,
                          duration: 400,
                          useNativeDriver: true,
                        }).start();
                      }}
                    >
                      <Text style={styles.removeBgBtnText}>
                        Remove Background
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item.key}
                style={{ maxHeight: hp(50) }}
                showsVerticalScrollIndicator={false}
              />

              <TouchableOpacity
                style={styles.closeBtnContainer}
                onPress={() => setShowCustomize(false)}
              >
                <LinearGradient
                  colors={[appTheme.primary, appTheme.accent]}
                  style={styles.closeBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          ref={flatRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={getMessageKey}
          contentContainerStyle={{
            paddingTop: scale(20),
            paddingBottom: scale(20),
          }}
          inverted={true}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          decelerationRate="fast"
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
        />

        <View
          style={{ marginBottom: keyboardHeight > 0 ? keyboardHeight : 20 }}
        >
          {recordingStatus !== "idle" ? (
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: "#F3E5F5",
                  justifyContent: "center",
                  height: 70,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  paddingHorizontal: 10,
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity onPress={cancelRecording}>
                  <Ionicons name="trash-outline" size={24} color="#FF5252" />
                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  {recordingWaveHeights.map((height, i) => (
                    <View
                      key={`wave-${i}`}
                      style={{
                        width: 4,
                        height: scale(height),
                        backgroundColor: appTheme.primary,
                        borderRadius: 2,
                      }}
                    />
                  ))}
                  <Text
                    style={{
                      marginLeft: 10,
                      color: "#9D50BB",
                      fontWeight: "600",
                    }}
                  >
                    {recordingStatus === "recording"
                      ? "Recording..."
                      : "Recorded"}
                  </Text>
                </View>
                {recordingStatus === "recording" ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={stopAndSend}
                      style={{
                        padding: 8,
                        backgroundColor: "#944E96",
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => sendVoiceMessage()}
                    style={{
                      padding: 8,
                      backgroundColor: appTheme.primary,
                      borderRadius: 20,
                    }}
                  >
                    <Ionicons name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={{ padding: 8, marginRight: 4 }}
                onPress={startRecording}
              >
                <Ionicons name="mic-outline" size={24} color={appTheme.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Chat with Qalbify..."
                placeholderTextColor="#999"
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendBtn, { backgroundColor: appTheme.primary }]}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F0FE" },
  header: {
    height: scale(80),
    paddingTop: scale(20),
    paddingBottom: scale(20),
    alignItems: "center",
    backgroundColor: "transparent",
    borderBottomLeftRadius: scale(25),
    borderBottomRightRadius: scale(25),
    elevation: 10,
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
  },
  headerTitle: {
    fontSize: rf(28),
    marginBottom: scale(10),
    fontWeight: "bold",
    color: "#9D50BB",
    textAlign: "center",
  },
  headerSub: {
    fontSize: rf(11),
    color: "#884EA0",
    opacity: 0.9,
    marginTop: scale(-9),
  },
  topLeftIcon: {
    position: "absolute",
    top: scale(48),
    left: scale(20),
    zIndex: 90,
    elevation: 8,
    shadowColor: "#9D50BB",
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 88,
    backgroundColor: "transparent",
  },
  popupMenu: {
    position: "absolute",
    top: scale(95),
    left: scale(24),
    width: scale(200),
    backgroundColor: "#FFF",
    borderRadius: scale(12),
    paddingVertical: scale(8),
    zIndex: 99,
    elevation: 6,
    shadowColor: "#5e35b1",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(12),
    paddingHorizontal: scale(16),
  },
  menuText: {
    marginLeft: scale(10),
    fontSize: rf(14),
    fontWeight: "500",
    color: "#4A235A",
  },
  topRightIcon: {
    position: "absolute",
    top: scale(48),
    right: scale(20),
    zIndex: 90,
    elevation: 8,
    shadowColor: "#9D50BB",
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
  },
  btnGradient: {
    padding: scale(10),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  messageRow: {
    width: "100%",
    flexDirection: "row",
    marginVertical: scale(7),
    alignItems: "flex-end",
    paddingHorizontal: scale(16),
  },
  userRow: { justifyContent: "flex-end" },
  botRow: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "80%",
    minHeight: scale(34),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(18),
    justifyContent: "center",
  },
  userBubble: {
    borderBottomRightRadius: 4,
    elevation: 4,
    shadowColor: "#5E2B97",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  botBubble: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 4,
    elevation: 2,
    shadowColor: "#9D50BB",
    shadowOpacity: 0.1,
  },
  msgText: { color: "#4A235A", fontSize: rf(15), fontWeight: "500" },
  tsText: {
    fontSize: rf(10),
    color: "#884EA0",
    marginTop: scale(4),
    alignSelf: "flex-end",
    opacity: 0.8,
  },
  avatarWrapper: {
    marginRight: scale(10),
    marginBottom: scale(2),
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 5,
  },
  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    borderWidth: 1.2,
    borderColor: "#6366F1",
    backgroundColor: "#F3E8FF",
  },
  orb: {
    position: "absolute",
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: scale(6),
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginHorizontal: scale(24),
    borderRadius: scale(30),
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(15),
    elevation: 8,
    zIndex: 50,
  },
  input: {
    flex: 1,
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    backgroundColor: "#F3E8FF",
    fontSize: rf(15),
    color: "#4A235A",
    maxHeight: scale(100),
    paddingTop: scale(8),
    paddingBottom: scale(8),
  },
  sendBtn: {
    marginLeft: scale(10),
    backgroundColor: "#944E96",
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    justifyContent: "center",
    alignItems: "center",
  },
  styleOption: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#9D50BB",
    marginRight: scale(8),
    marginTop: scale(4),
  },
  styleOptionSelected: { backgroundColor: "#9D50BB" },
  styleText: { color: "#4A235A", fontSize: rf(13) },
  styleTextSelected: { color: "#FFF" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: scale(25),
    padding: scale(26),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(10) },
    shadowOpacity: 0.1,
    shadowRadius: scale(20),
    elevation: 8,
  },
  modalTitle: {
    fontSize: rf(24),
    fontWeight: "800",
    marginBottom: scale(20),
    color: "#6A67CE",
    textAlign: "center",
  },
  modalSub: {
    fontSize: rf(14),
    fontWeight: "700",
    marginTop: scale(12),
    marginBottom: scale(8),
    color: "#944E96",
    opacity: 0.7,
    textAlign: "left",
    width: "100%",
    textTransform: "uppercase",
    letterSpacing: scale(2),
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: scale(15),
    justifyContent: "center",
  },
  colorOption: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    margin: scale(6),
  },
  fontOption: { margin: scale(8), fontSize: rf(18), color: "#3d006c" },
  wallOption: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(12),
    margin: scale(6),
  },
  pickGalleryBtn: {
    marginTop: scale(20),
    borderRadius: scale(18),
    borderWidth: 1.5,
    borderColor: "#6A67CE",
    backgroundColor: "#FFF",
    width: "100%",
    paddingVertical: scale(14),
    alignItems: "center",
  },
  pickGalleryText: {
    color: "#000",
    fontSize: rf(16),
    fontWeight: "700",
  },
  removeBgBtn: {
    marginTop: scale(12),
    borderRadius: scale(18),
    borderWidth: 1.5,
    borderColor: "#FFC0CB",
    backgroundColor: "#FFF",
    width: "100%",
    paddingVertical: scale(14),
    alignItems: "center",
  },
  removeBgBtnText: {
    color: "#944E96",
    fontSize: rf(16),
    fontWeight: "700",
  },
  closeBtnContainer: {
    marginTop: scale(12),
    width: "100%",
  },
  closeBtnGradient: {
    borderRadius: scale(18),
    paddingVertical: scale(14),
    alignItems: "center",
    width: "100%",
  },
  closeBtnText: {
    color: "#FFF",
    fontSize: rf(16),
    fontWeight: "800",
  },
});
