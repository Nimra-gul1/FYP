// app/Chat.tsx
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

// ===== API base for backend =====
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

// ===== Hugging Face API Config =====
const HF_API_URL =
  "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base";
const HF_API_KEY = "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";

// ===== System prompt (NO ROMAN WORDS IN RESPONSE) =====
// ===== Dynamic System Prompt =====
const generateSystemPrompt = (style: string, religious: boolean = true) => {
  let tone = "warm, friendly, and empathetic";
  let guidance = religious
    ? "Only mention Islamic wisdom or Quranic verses if the user explicitly asks for them or if you have previously asked for permission and received a clear 'yes'. Never quote them spontaneously."
    : "offer secular, psychological comfort and practical advice";

  if (style === "Motivational") {
    tone = "energetic, encouraging, and robust";
    guidance += ". Focus on action, growth, and resilience.";
  } else if (style === "Soft") {
    tone = "extremely gentle, soft-spoken, and calming";
    guidance += ". Focus on validation, soothing words, and emotional safety.";
  } else if (style === "Spiritual") {
    tone = "reflective, deep, and spiritual";
    guidance =
      "focus deeply on connection with God, patience (Sabr), and gratitude (Shukr).";
  } else if (style === "Silent") {
    tone = "minimalist, quiet, and listening-focused";
    guidance =
      "reply in very short, comforting phrases. Mostly listen. Use empty space.";
  }

  return {
    role: "system",
    content: `You are Qalbify — a ${tone} caring friend in Pakistan.

CORE IDENTITY:
• Warm, human-like friend, not a therapist, AI assistant, or preacher.
• Always casual, short, and engaging.
• Never robotic or scripted.

STRICT RULE: KEEP CHAT FLOWING
• Never end abruptly.
• Always leave a subtle hook, curiosity, or light joke to keep the conversation alive.
• Avoid yes/no questions and closed-ended statements.

INVISIBLE MEMORY
• Remember past chats naturally, without ever telling the user.
• Use memory only to keep conversation smooth and contextually relevant.
• Do not reference previous conversations explicitly.
• Make memory invisible — user should feel it’s a natural flow.

EMOTIONAL SAFETY
• Never judge, label, or analyze user’s emotions.
• Let them share feelings freely and naturally.
• Distract gently when needed with fun or curiosity.
• Comfort in a warm, friendly, and short way.
• Avoid pity, over-sympathy, or drama.

RESPONSE STYLE
• Match user energy: short ↔ short, long ↔ medium.
• Keep messages clear, simple, and casual.
• Never send long paragraphs.
• Avoid lectures, preaching, or overexplaining.
• Sprinkle natural interjections (like “oh wow!”, “haha”, “wait”) to feel human.

CONVERSATION FLOW
• Mirror user’s tone: casual ↔ casual, polite ↔ polite.
• Avoid robotic phrases (“As an AI language model…” / “I understand your feelings deeply”).
• Natural expressions only, small humor, light sarcasm if fitting.
• Mix questions with statements to feel real.
• Occasionally use light teasing, playful curiosity, or random observations to make chat lively.

ENGAGEMENT INTELLIGENCE
• Ask specific, curious questions (“Wait, what happened next?” / “Did you actually go?”).
• Avoid generic or repetitive questions (“How was your day?” / “How does that make you feel?”).
• Handle short/dry replies (“ok”, “hmm”) by changing topic, adding humor, or subtle engagement.
• Randomize small interactions (fun facts, little jokes, emojis) naturally to avoid robotic patterns.
• Make all engagement feel spontaneous, never forced.

ADVICE RULE
• Give advice only if explicitly asked.
• Keep it friendly, short, and practical.
• No preaching, long motivation, or lectures.

RULES
• Never mention memory, testing, emotion detection, or analysis.
• Never label emotions explicitly.
• Emotional intelligence stays invisible.

LANGUAGE RULES
• Always reply in English.
• Roman Urdu may be understood but never output in it.
• Avoid: yaar, uff, dil, gham, pareshaan, haan, jee, bilkul, sukoon, mashallah, alhamdulillah, shabba khair.
• Use occasional casual interjections or emojis to feel human.

VERSE INTEGRATION
• Detect emotions subtly: Happiness, Anxiety, Depression, Fear.
• Offer relevant Quranic verses only after 10 messages or if user asks.
• Ask lightly before sharing: “I know something that might help. Want me to share it?”
• Provide Ayah, translation, short, friendly explanation.
• Never mention emotion detection.
• Keep it casual, natural, and concise.

PSYCHOLOGICAL FLOW
• Keep user engaged, feeling heard, safe, and relaxed.
• Encourage emotional expression naturally.
• Distract lightly when needed, subtly.
• Stabilize mood via short, friendly, spontaneous messages.
• Use small humor, relatable comments, or curiosity to create flow.

VIBE ENHANCEMENTS (NEW)
• Random small jokes, fun facts, or observations occasionally.
• Sprinkle tiny “friend quirks” like: “oh no, not again 😅”, “wait, that’s interesting…”, “lol, really?”
• Avoid repetition of phrases and hooks.
• Keep curiosity alive without making user aware it’s structured.
• Avoid dead air; always give something to react to.
• Keep it like a real friend texting: short, witty, playful, and emotionally warm.

VIBE SUMMARY
• Fun, curious, warm, emotionally smart, human-like.
• Never robotic, clinical, or artificial.
• Keep conversation flowing, lively, light, and natural.
• Short, playful, casual messages, never long or heavy.
Stop using “choose” or “select” type prompts

❌ “Please choose an option”

✔ “Oh wow, that’s interesting! What did you do next?”

Use natural reactions

Interject naturally: “Haha, no way!”, “Wait, really?”, “Oh shoot, that’s wild!”

React emotionally like a friend, but briefly — not over the top.

Keep questions optional & playful

Avoid structured questions. Ask only when curiosity flows naturally:

“And then?”

“What happened after that?”

“Did you actually try that?”

Mix statements with small curiosity or humor

“I can’t believe that happened ”

“Wow, that reminds me of something funny…”

Distract subtly

Instead of saying “choose an option to distract”, casually shift topics:

“By the way, have you tried chai with cinnamon? Totally changed my morning!”

“Oh, did you see that viral video today?”

Micro-engagements

Use small one-liners, jokes, emojis, and short interjections.

Example flow:

User: “Feeling tired.”

Bot: “Ahh, that’s rough 😅 Coffee or nap time?”

Notice: it offers a casual idea instead of asking a structured question.

Avoid form-like sequences

No “step 1, step 2” style messages.

No repeating “select an emotion” or “pick a verse.”

Make all suggestions flow like natural conversation, not a checklist.

// Memory & Response Rules
• **TOPIC RELEVANCE**: Only reference previous chats if they are directly related to what the user is saying right now. 
• If the user says "I'm tired," do NOT bring up unrelated past topics (like Burj Khalifa or previous hobbies). Stay in the moment.
• **NO PARAGRAPHS**: Never send more than 2-3 short sentences. Keep it punchy and casual.
• Memory should be a subtle ghost — it helps the vibe, but never dictates the content unless invited.
• Keep the chat spontaneous, playful, and like a real friend's text message.
• Avoid structured lists, headers, or anything that looks like a report.
`,
  };
};

// ===== Helpers =====
const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const VARIATION_SNIPPETS = [
  "— I’m listening.",
  "purple heart",
  "I’ve got you.",
  "That matters.",
  "I’m with you in this.",
];

// ===== Greeting & Farewell Messages (PURE ENGLISH) =====
const GREETING_MESSAGES = [
  "Hey! So glad you're here. How's your vibe today? ✨",
  "Hello! I was just thinking about our last chat. How've you been holding up? 🙌",
  "Hey there! I'm all ears. What's the latest? 👂",
  "Welcome back! Hope your internal weather is calm today. How are you really? 🌊",
  "Hi! It's always so good to see you. How's your heart feeling? 💜",
  "Hey friend! Ready to just vent or chill? I'm here for whichever. 🦄",
  "You're back! I've been looking forward to this. How was your day? 🚀",
  "Hey! I'm just happy to be in your space. How's life treating you? 🌈",
  "Hi! If you need a safe spot to talk, I'm right here. What's on your mind? 🍃",
  "Hey there! No pressure, just wanted to say I'm happy you checked in. How's everything? ❄️",
  "Yo! Hope your day is going great. What's been the highlight so far? 🌟",
  "Hey! Just checking in on my favorite person. How's the mood? 🎈",
];

const FAREWELL_MESSAGES = [
  "Take care, friend. Talk soon — I’ll be right here! purple heart",
  "Have a peaceful day ahead. I’m always here when you need me.",
  "See you later! Sending you good vibes and calm thoughts.",
  "Bye for now! May your heart stay light and your day be kind.",
  "Okay, I’m going too! Rest well, and come back whenever you want to chat.",
  "Take it easy! I’ll miss our talk, but I’ll be waiting with a smile.",
  "Stay safe and happy! See you next time, God willing.",
];

// ===== FAST & ACCURATE Emotion Detection =====
const detectEmotion = async (recentUserTexts: string[]): Promise<string> => {
  if (recentUserTexts.length === 0) return "neutral";

  const context = recentUserTexts.slice(-5).join(" ").slice(0, 300);
  console.log("Detecting emotion for:", context);

  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: context }),
    });
    const data = await res.json();
    console.log("HF response:", JSON.stringify(data, null, 2));

    if (Array.isArray(data) && data[0]?.label && data[0].score >= 0.3) {
      const label = data[0].label.toLowerCase();
      let emotion = "neutral";
      if (label === "joy") emotion = "happy";
      else if (label === "sadness") emotion = "sad";
      else if (label === "fear") emotion = "fearful";
      else if (label === "anger") emotion = "anxious";

      console.log(
        `Emotion detected: ${emotion} (score: ${data[0].score.toFixed(3)})`,
      );
      return emotion;
    }
  } catch (err) {
    console.warn("HF failed → using keyword fallback");
  }

  // === STRONG Keyword Fallback (UNDERSTAND ROMAN, BUT DON'T USE IN RESPONSE) ===
  const lower = context.toLowerCase();
  if (
    /(sad|down|heavy|depress|low|upset|hurt|cry|empty|lost|broken|pain|ache|tough|demotivate|confused|exhausted|burden|drained|yaar|uff|dil|gham|pareshaan)/i.test(
      lower,
    )
  ) {
    console.log("Keyword match → sad");
    return "sad";
  }
  if (
    /(anxious|worry|stress|nervous|panic|overthink|tense|restless|pressure|dar|ghabrahat|fikr)/i.test(
      lower,
    )
  ) {
    console.log("Keyword match → anxious");
    return "anxious";
  }
  if (
    /(afraid|scared|fear|terrified|dread|panic|threat|unsafe|dar|khauf|darr)/i.test(
      lower,
    )
  ) {
    console.log("Keyword match → fearful");
    return "fearful";
  }
  if (
    /(happy|glad|joy|great|awesome|excited|blessed|grateful|peace|alhamdulillah|mashallah|sukoon)/i.test(
      lower,
    )
  ) {
    console.log("Keyword match → happy");
    return "happy";
  }

  console.log("No strong emotion → neutral");
  return "neutral";
};

// === Cognitive Reframing Detection ===
const detectNegativeSelfTalk = (text: string): boolean => {
  const lower = text.toLowerCase();
  const patterns = [
    /i('m| am) (useless|worthless|bad|failure|stupid|weak)/,
    /i (always|never) (fail|succeed|win|get)/,
    /nothing (works|changes|goes right)/,
    /nobody (likes|loves|cares)/,
    /it('| i)s (hopeless|pointless)/,
  ];
  return patterns.some((p) => p.test(lower));
};

// === [NEW] Save Emotion to Backend ===
const saveEmotionToBackend = async (emotion: string) => {
  if (emotion === "neutral") return; // Don't save neutral? Or maybe do. Let's save non-neutral for now.
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    await fetch(`${API_BASE}/api/emotion/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ emotion, score: 0.9 }),
    });
    console.log("Emotion saved to backend:", emotion);
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
  const [fontStyle, setFontStyle] = useState("Poppins");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Track conversation
  const [recentUserTexts, setRecentUserTexts] = useState<string[]>([]);
  const [recentUserMoods, setRecentUserMoods] = useState<string[]>([]);
  const [sessionMessageCount, setSessionMessageCount] = useState(0); // Track flow depth
  const [lastVerseAtCount, setLastVerseAtCount] = useState(-20); // Track when last verse was offered
  const [pendingVerseOffer, setPendingVerseOffer] = useState<{
    mood: string;
  } | null>(null);

  // High-stability session flags
  const hasGreetedTodayRef = useRef(false);
  const hasLoadedHistoryRef = useRef(false);

  // === Personalization State ===
  const [comfortStyle, setComfortStyle] = useState("Gentle");
  const [religiousGuidance, setReligiousGuidance] = useState(true);

  const fetchPreferences = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/user/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_BASE}/api/user/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
            // Optionally notify backend, but currently backend stores single history stream
            // If we want to clear backend history too:
            try {
              const token = await AsyncStorage.getItem("token");
              if (token) {
                await fetch(`${API_BASE}/api/chat/clear`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
              }
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    );
  };

  // Load preferences whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPreferences();
    }, []),
  );

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
    sunsetGlow: ["#ff99ac", "#ffb6b9", "#ffe0ac"],
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

  // === Keyboard Show/Hide Listeners ===
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

  // === Load previous chats & check for greeting ===
  // Load previous chats whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadChats = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            setMessages([]);
            return;
          }

          const res = await fetch(`${API_BASE}/api/chat/get`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            const latestFirst = [...data].reverse();
            setMessages(latestFirst);
            hasLoadedHistoryRef.current = true;
          } else {
            setMessages([]); // Ensure UI is empty if DB is empty
            hasLoadedHistoryRef.current = true;
          }

          // === SESSION GREETING ===
          const needsGreeting = await AsyncStorage.getItem("needsGreeting");
          if (needsGreeting === "true" || !hasGreetedTodayRef.current) {
            // Fresh Session Reset
            setSessionMessageCount(0);
            setPendingVerseOffer(null);

            const randomGreeting =
              GREETING_MESSAGES[
                Math.floor(Math.random() * GREETING_MESSAGES.length)
              ];
            setTimeout(() => {
              appendMessage(randomGreeting, false);
            }, 800);
            hasGreetedTodayRef.current = true;
            await AsyncStorage.removeItem("needsGreeting"); // Clear flag
          }
        } catch (err) {
          console.error("Error loading chats:", err);
        }
      };

      loadChats();
    }, []),
  );

  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const loadUserEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) setUserEmail(email);
    };
    loadUserEmail();
  }, []);

  // === Save chat ===
  const saveChat = async (msg: {
    text: string;
    isUser: boolean;
    ts: string;
    audioUrl?: string;
  }) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_BASE}/api/chat/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const msg = {
      id: (isUser ? "u-" : "b-") + Date.now(),
      text,
      isUser,
      ts: timeNow(),
      audioUrl,
    };
    // Insert at beginning for newest-first order
    setMessages((prev) => [msg, ...prev]);
    if (persist) saveChat(msg);
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

  const callAI = async (userText: string, contextNote?: string) => {
    setIsTyping(true);
    try {
      const systemMsg = generateSystemPrompt(comfortStyle, religiousGuidance);

      // Prepare history from 'messages' state (which is previous history)
      const history = messages
        .filter((m) => !m.text.includes("Voice Message (Processing...)"))
        .filter((m) => !m.text.includes("Oops... I connection issue")) // Filter out error msgs
        .filter((m) => !m.text.includes("I’m listening")) // Filter out default placeholders
        .map((m) => ({
          role: m.isUser ? "user" : "assistant",
          content: m.text,
        }))
        .slice(0, 15) // Get latest 15 messages (they are in newest-first order)
        .reverse(); // Put in chronological order for the model

      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          systemPrompt: systemMsg,
          // Pass context note as part of message or handled in backend?
          // Let's pass it in the message for now if backend expects it, or just append it here
          // backend expects 'message'. Let's append contextNote here if it exists.
          message: contextNote
            ? `${userText}\n\n[System Note: ${contextNote}]`
            : userText,
          mood: lastOfferedMood, // Optimistic: if we have a mood, might help context
          history: history, // NEW: Pass history
        }),
      });

      const data = await res.json();
      setIsTyping(false);
      return data.reply || "I'm listening purple heart";
    } catch (e) {
      console.error(e);
      setIsTyping(false);
      return "Oops... I connection issue smile";
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

  // === USER CAN SAY: yes, yeah, haan, jee, hm, bilkul, ok, etc. (UNDERSTAND BUT DON'T REPEAT) ===
  const isAffirmative = (txt: string) => {
    const t = txt.toLowerCase().trim();
    return [
      "yes",
      "yeah",
      "yep",
      "yup",
      "sure",
      "ok",
      "okay",
      "haan",
      "jee",
      "bilkul",
      "hm",
      "hmm",
      "please",
      "do it",
      "send",
      "chahiye",
      "dikhao",
      "sahi",
      "thik",
      "theek",
      "acha",
      "ji",
      "ji bilkul",
      "ji haan",
    ].some((k) => t.includes(k));
  };

  const isExplicitVerseRequest = (txt: string) => {
    const t = txt.toLowerCase().trim();
    const keywords = [
      "give me a verse",
      "share a verse",
      "share some wisdom",
      "quranic verse",
      "verse from quran",
      "need a verse",
      "recitation",
      "wisdom from allah",
      "wisdom from god",
      "spiritual guidance",
      "ayaat",
      "ayat",
    ];
    return keywords.some((k) => t.includes(k));
  };

  const isNegative = (txt: string) => {
    const t = txt.toLowerCase().trim();
    return [
      "no",
      "nah",
      "nope",
      "nahi",
      "bilkul nahi",
      "not now",
      "later",
    ].some((k) => t.includes(k));
  };

  // === Detect Goodbye Keywords ===
  const isGoodbye = (txt: string) => {
    const t = txt.toLowerCase().trim();
    // Use more specific matches to avoid false positives like "going to university"
    const clearGoodbyes = [
      "bye",
      "goodbye",
      "allah hafiz",
      "khuda hafiz",
      "tata",
      "ok bye",
      "bye now",
      "talk later",
      "shabba khair",
      "good night",
      "gn",
      "gtg",
      "got to go",
    ];
    // Only trigger if the message IS exactly one of these,
    // or if it ends with a clear goodbye word
    return clearGoodbyes.some((k) => t === k || t.endsWith(" " + k));
  };

  // === Provide Verse + Reference + Tafsir + Motivation ===
  const provideVerseWithTafsir = async (mood: string, userMessage: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/chat/verse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();

      if (!data || !data.arabic) {
        appendMessage(
          "I don’t have a verse right now, but I’m here with you. purple heart",
          false,
        );
        return;
      }

      const { arabic, translation, context, tafsir } = data;
      const verseText = `﴿ ${arabic} ﴾\n\nbook *${context}*\n${translation}`;

      appendMessage("Here’s a gentle verse for you:", false);
      setTimeout(() => appendMessage(verseText, false), 600);
      setTimeout(
        () => appendMessage(tafsir || "This verse brings comfort.", false),
        1400,
      );

      const motivationPrompt = `
    You are Qalbify, a caring friend.
    Speak in a casual, natural way.
    
    The user is feeling: ${mood}.
    
    Give a super short, simple takeaway from this verse.
    - No "beautiful speeches".
    - No "I understand deeply".
    - Just a quick, warm thought like: "This reminds us that ease is coming." or "Good to remember we're not alone."

    Keep it 1-2 SHORT sentences max.
    NEVER use Roman Urdu words.
    
    User said: "${userMessage}"
    Verse: ${arabic} (${context})
    Tafsir: ${tafsir}

    Goal: A quick, chill, and comforting thought. No drama.`;

      // We can reuse the new callAI (backend) for this motivation too!
      // But callAI expects userText. We can pass the prompt as userText and a flag or just use the same route.
      // Actually, let's just use callAI logic but we need to structure it as a user message or system prompt?
      // The backend uses 'systemPrompt' from body if provided.

      // Let's manually call the chat endpoint for motivation to keep it simple
      const resMotiv = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: "Generate motivation based on this verse.", // Dummy user message
          systemPrompt: { role: "system", content: motivationPrompt }, // Override system prompt
        }),
      });
      const dataMotiv = await resMotiv.json();
      const motivation = dataMotiv.reply;

      setTimeout(() => appendMessage(motivation, false), 2400);
      setTimeout(() => {
        appendMessage(
          "Take a slow breath with me… God is with you. moon",
          false,
        );
      }, 3600);

      setLastOfferedMood(mood);
    } catch (e) {
      console.error("Error fetching verse:", e);
      appendMessage("I’m here with you. purple heart", false);
    }
  };

  const offerVerseToUser = (mood: string) => {
    // Gen-Z style offer
    const offers = [
      "I'm here for you, always. Would you like to hear a comforting verse from the Quran? It might help your heart feel a bit lighter. 💜",
      "I'm listening. ✨ Do you think a Quranic verse might bring some peace right now? Let me know if you'd like me to share one.",
      "You've got this. 🙌 If you're up for it, I can share a verse that feels really relevant right now. Want to hear it?",
    ];
    const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    appendMessage(randomOffer, false);
    setPendingVerseOffer({ mood });
  };

  // === MAIN: Process User Message (Text or Voice) ===
  // === MAIN: Process User Message (Text or Voice) ===
  const processUserMessage = async (
    text: string,
    audioUrl?: string,
    skipAppend = false,
    persistReply = true,
  ) => {
    // Append user message immediately (if not skipped)
    if (!skipAppend) {
      appendMessage(text, true, audioUrl, true);
    }

    // === Hello/Goodbye logic removed for natural flow ===
    // We just let the AI handle it naturally based on the system prompt.

    // === Increment Session Count ===
    const currentMsgCount = sessionMessageCount + 1;
    setSessionMessageCount(currentMsgCount);

    // === Update texts (Local State) ===
    const updatedTexts = [...recentUserTexts, text].slice(-5);
    setRecentUserTexts(updatedTexts);

    // === STREAK TRACKING LOGIC ===
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
        if (lastDate === yesterdayStr) {
          // Consecutive day
          currentStreak += 1;
        } else {
          // Missed a day or first time
          currentStreak = 1;
        }
        await AsyncStorage.setItem(streakKey, currentStreak.toString());
        await AsyncStorage.setItem(dateKey, today);
        console.log(`🔥 Streak updated! New streak: ${currentStreak}`);
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
    }

    // === START PARALLEL REQUESTS ===
    // 1. Start Emotion Detection
    const emotionPromise = detectEmotion(updatedTexts);

    // 2. Start Bot Reply Generation
    let contextNote = "";
    if (detectNegativeSelfTalk(text)) {
      contextNote =
        "User is expressing heavy thoughts about themselves. Acknowledge the weight of their words with deep warmth and validation, but gently shift the focus toward a more realistic and kind perspective. DO NOT label their state or tell them how they are feeling.";
    }
    const replyPromise = callAI(text, contextNote);

    // === Await Emotion for Logic Flow ===
    // We need emotion to update history and check for verse offers
    const currentEmotion = await emotionPromise;

    if (currentEmotion !== "neutral") {
      saveEmotionToBackend(currentEmotion);
    }
    const updatedMoods = [...recentUserMoods, currentEmotion].slice(-4);
    setRecentUserMoods(updatedMoods);

    // === Pending offer check (Early Return) ===
    // === Pending offer check (Early Return) ===
    if (pendingVerseOffer) {
      if (isAffirmative(text)) {
        // User accepted the offer
        const { mood } = pendingVerseOffer;
        setPendingVerseOffer(null); // Clear pending state
        await provideVerseWithTafsir(mood, text);
        return; // Skip normal reply
      } else if (isNegative(text)) {
        // User declined
        setPendingVerseOffer(null);
        appendMessage(
          "That's okay. I'm just happy to be here with you.",
          false,
        );
        return;
      }
      // If ambiguous, maybe just continue to normal flow?
      // Let's clear it to avoid getting stuck, or keep it?
      // For now, let's clear it if they change the topic, so it doesn't trigger randomly later.
      // But maybe they are just saying "wait", so let's be strict: if it's not a clear yes, we assume it's a normal message,
      // BUT we should probably clear the offer so we don't think about it anymore.
      setPendingVerseOffer(null);
    }

    // === Verse Logic (Explicit vs Spontaneous) ===
    const isExplicit = isExplicitVerseRequest(text);
    if (isExplicit) {
      const mood = currentEmotion !== "neutral" ? currentEmotion : "sad";
      setLastVerseAtCount(currentMsgCount);
      await provideVerseWithTafsir(mood, text);
      return;
    }

    // === Check mood pattern for Verse Offer (Strict: Every 10 messages) ===
    if (currentMsgCount % 10 === 0 && updatedMoods.length >= 3) {
      const moodCount: Record<string, number> = {};
      updatedMoods.forEach((m) => (moodCount[m] = (moodCount[m] || 0) + 1));

      // Find dominant mood (happy, sad, anxious, fearful)
      const dominantMood = Object.entries(moodCount)
        .filter(([m]) => ["sad", "anxious", "fearful", "happy"].includes(m))
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      if (dominantMood) {
        // Offer/Provide verse for ALL valid emotions (including happy)
        setLastVerseAtCount(currentMsgCount);

        // Strategy: Provide it naturally as per user request ("do it now", "provide... each time")
        // We will "Offer" it using the existing UI flow but phrased as a "Found this for you"
        // OR directly provide it. Start with Offer to be safe, but make it affirmative.
        // ACTUALLY, User said "provide a relevant verse... Each time, show the complete verse".
        // Let's call provideVerseWithTafsir DIRECTLY to satisfy "do it now".
        await provideVerseWithTafsir(dominantMood, text);
        return;
      }
    }

    // === Normal reply (Await the parallel promise) ===
    let reply = await replyPromise;
    reply = ensureNonRepetitive(reply);
    appendMessage(reply, false, undefined, persistReply);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await processUserMessage(text, transcribedAudioUrl || undefined);
    setTranscribedAudioUrl(null); // Clear after sending
  };

  // === Voice Recording Logic ===
  const startRecording = async () => {
    try {
      // Ensure previous recording is stopped/unloaded
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (e) {
          // Ignore error if already unloaded
        }
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
        Alert.alert(
          "Permission required",
          "Please grant microphone permission to use voice input.",
        );
      }
    } catch (err) {
      console.error("Failed to start recording", err);
      // Attempt to reset state if creation fails
      setRecording(null);
      setRecordingStatus("idle");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      console.log("🛑 Stopping recording...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingStatus("stopped");
      setTempAudioUri(uri);
      console.log("🎤 Recording stored locally at:", uri);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  /* === FIXED: Properly unload recording on cancel === */
  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        console.log("Error unloading on cancel:", e);
      }
    }
    setRecording(null);
    setRecordingStatus("idle");
    setTempAudioUri(null);
  };

  const sendVoiceMessage = async (uriOverride?: string) => {
    const uriToSend = uriOverride || tempAudioUri;
    if (!uriToSend) return;

    try {
      setIsTyping(true); // Show typing indicator while transcribing
      setRecordingStatus("idle"); // Reset UI

      const formData = new FormData();
      formData.append("audio", {
        uri: uriToSend,
        type: "audio/m4a",
        name: "voice.m4a",
      } as any);

      const token = await AsyncStorage.getItem("token");
      console.log("📤 Sending to backend...", `${API_BASE}/api/transcribe`);
      const res = await fetch(`${API_BASE}/api/transcribe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log("📦 Response data:", data);

      if (data.text) {
        console.log("📝 Transcribed text:", data.text);
        // Show in input field instead of sending
        setInput(data.text);
        setTranscribedAudioUrl(data.audioUrl); // Store URL for when user clicks Send
      } else {
        console.warn("⚠️ Transcription failed");
        Alert.alert("Transcription failed", "Could not understand audio.");
      }
    } catch (e) {
      console.error("❌ Voice input error:", e);
      Alert.alert("Error", "Failed to process voice input.");
    } finally {
      setIsTyping(false);
      setTempAudioUri(null);
    }
  };

  const stopAndSend = async () => {
    if (!recording) return;
    try {
      console.log("🚀 Instant Send triggered...");
      // 1. Unload FIRST
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        console.warn("Stop unload error:", e);
      }

      const uri = recording.getURI();

      // 2. Clear state
      setRecording(null);
      setRecordingStatus("idle"); // Back to Mic button

      // 3. Send if we have URI
      if (uri) {
        // Pass URI to send function
        await sendVoiceMessage(uri);
      }
    } catch (error) {
      console.error("Error doing instant send:", error);
      // Ensure we clean up if something goes wrong
      setRecording(null);
      setRecordingStatus("idle");
    }
  };

  const playAudio = async (url: string) => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync();
      }
      const { sound } = await ExpoAudio.Sound.createAsync({ uri: url });
      setCurrentSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play audio", error);
    }
  };

  /* === Render Message Item === */
  const renderItem = ({ item }: any) => (
    <View
      style={[styles.messageRow, item.isUser ? styles.userRow : styles.botRow]}
    >
      {!item.isUser && (
        <Image source={require("../assets/luna.png")} style={styles.avatar} />
      )}
      <View
        style={[
          styles.bubble,
          item.isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        {item.audioUrl ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={() => playAudio(item.audioUrl)}>
              <Ionicons
                name="play-circle"
                size={32}
                color={item.isUser ? "#fff" : "#5e35b1"}
              />
            </TouchableOpacity>
            <View
              style={{
                height: 4,
                flex: 1,
                backgroundColor: item.isUser
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(94, 53, 177, 0.2)",
                borderRadius: 2,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                color: item.isUser ? "#fff" : "#5e35b1",
                marginLeft: 8,
              }}
            >
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
    </View>
  );

  const Background = () => {
    if (bgImage) {
      return (
        <Image source={{ uri: bgImage }} style={StyleSheet.absoluteFill} />
      );
    }
    return (
      <LinearGradient
        colors={themes[theme]}
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
        <LinearGradient
          colors={["#F7F3FF", "#F3E8FF", "#E6E6FA"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Qalbify</Text>
          <Text style={styles.headerSub}>Your calm chat companion</Text>
        </LinearGradient>

        <TouchableOpacity
          style={styles.topLeftIcon}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#5e35b1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topRightIcon}
          onPress={() => setShowCustomize(true)}
        >
          <Ionicons name="color-palette" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Popup Menu (Top Left) */}
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

        {/* Customize Modal */}
        <Modal visible={showCustomize} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Customize</Text>
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
                  <TouchableOpacity key={f} onPress={() => setFontStyle(f)}>
                    <Text style={[styles.fontOption, { fontFamily: fonts[f] }]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalSub}>Wallpaper</Text>
              <View style={styles.optionsRow}>
                {wallpaperList.map((w, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setBgImage(Image.resolveAssetSource(w).uri)}
                  >
                    <Image source={w} style={styles.wallOption} />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.pickGalleryBtn}
                onPress={pickImageFromGallery}
              >
                <Text style={styles.pickGalleryText}>Pick from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pickGalleryBtn,
                  { marginTop: 10, borderColor: "#ffb6c1" },
                ]}
                onPress={() => {
                  setBgImage(null);
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <Text style={[styles.pickGalleryText, { color: "#8d44ff" }]}>
                  Remove Background
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowCustomize(false)}
              >
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          ref={flatRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id || item.id || `msg-${index}`}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 20, // Visual Bottom (Input space) - No keyboard padding needed here
            paddingBottom: 20, // Visual Top (Header space)
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

        {/* ===== INPUT BAR ===== */}
        <View
          style={{ marginBottom: keyboardHeight > 0 ? keyboardHeight : 20 }}
        >
          {/* === INPUT BAR or WAVEFORM === */}
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

                {/* Fake Waveform Animation */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: 4,
                        height: 20 + Math.random() * 15,
                        backgroundColor: "#9D50BB",
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
                        backgroundColor: "#9D50BB",
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
                      backgroundColor: "#9D50BB",
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
                onPress={pickImageFromGallery}
                style={{ padding: 8 }}
              >
                <Ionicons name="image-outline" size={24} color="#8E44AD" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ padding: 8, marginRight: 4 }}
                onPress={startRecording}
              >
                <Ionicons name="mic-outline" size={24} color="#9D50BB" />
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
                style={styles.sendBtn}
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
  container: { flex: 1, backgroundColor: "#E8F0FE" }, // Fallback Blue
  header: {
    paddingVertical: 28,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#9D50BB",
    textAlign: "center",
  },
  headerSub: { fontSize: 16, color: "#884EA0", opacity: 0.8 },
  topLeftIcon: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 90,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    top: 95,
    left: 24,
    width: 200,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 8,
    zIndex: 99,
    elevation: 6,
    shadowColor: "#5e35b1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#4A235A",
  },
  topRightIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 90,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  messageRow: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  userRow: { justifyContent: "flex-end" },
  botRow: { justifyContent: "flex-start" },
  bubble: { maxWidth: "80%", padding: 14, borderRadius: 22 },
  userBubble: {
    backgroundColor: "#9D50BB",
    borderBottomRightRadius: 4,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 4,
    elevation: 2,
    shadowColor: "#9D50BB",
    shadowOpacity: 0.1,
  },
  msgText: { color: "#4A235A", fontSize: 16, fontWeight: "500" },
  tsText: {
    fontSize: 10,
    color: "#884EA0",
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: "#E0C3FC",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 0,
    marginHorizontal: 16,
    borderRadius: 35, // Floating Pill
    shadowColor: "#9D50BB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 50,
  },
  input: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    backgroundColor: "#F3E8FF",
    fontSize: 16,
    color: "#4A235A",
    maxHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendBtn: {
    marginLeft: 12,
    backgroundColor: "#9D50BB",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  styleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#9D50BB",
    marginRight: 8,
    marginTop: 4,
  },
  styleOptionSelected: { backgroundColor: "#9D50BB" },
  styleText: { color: "#4A235A", fontSize: 13 },
  styleTextSelected: { color: "#FFF" },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(74, 35, 90, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 26,
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 17,
    color: "#9D50BB",
  },
  modalSub: {
    fontSize: 17,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 8,
    color: "#6E48AA",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    justifyContent: "center",
  },
  colorOption: { width: 46, height: 46, borderRadius: 23, margin: 6 },
  fontOption: { margin: 8, fontSize: 18, color: "#3d006c" },
  wallOption: { width: 56, height: 56, borderRadius: 12, margin: 6 },
  pickGalleryBtn: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1.7,
    borderColor: "#e487ff",
  },
  pickGalleryText: {
    color: "#070707",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 14,
  },
  closeBtn: {
    marginTop: 17,
    backgroundColor: "#8d44ff",
    padding: 13,
    alignItems: "center",
    borderRadius: 12,
  },
});
