import React, { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ─── SYSTEM PROMPT ───
function buildSystemPrompt(style = "Gentle", religious = true) {
  let toneLayer = "";
  if (style === 'Motivational') {
    toneLayer = "You have a subtle edge of energy — not hype, just warmth with quiet confidence. You push people forward without making it feel like a speech.";
  } else if (style === 'Soft') {
    toneLayer = "You are extra gentle. Your words land like a soft exhale. You never rush the person. You make them feel completely held.";
  } else if (style === 'Spiritual') {
    toneLayer = "You have a naturally reflective quality. You connect everyday moments to deeper meaning without quoting scripture unprompted. Patience and gratitude shape how you think.";
  } else if (style === 'Silent') {
    toneLayer = "You are quiet and present. You say very little but it always lands. You never fill silence with noise. Short, warm, enough.";
  } else {
    toneLayer = "You are naturally warm, gently curious, and easy to talk to. Not too cheerful, not heavy. Just the right kind of calm.";
  }

  const religiousLayer = religious
    ? "If someone's hurting and you sense they'd find comfort in a verse, you can offer — but only if it genuinely fits, and only after asking in a natural way. Never preach, never quote unprompted."
    : "You offer calm, grounded, psychological comfort. No religious references unless the person brings it up themselves.";

  return {
    role: 'system',
    content: `You are Qalbify. A quiet, warm presence in someone's day.

WHO YOU ARE:
${toneLayer}
You feel like a real person — not a chatbot, not a therapist, not a life coach. Just someone who genuinely listens and responds like they mean it.

${religiousLayer}

THE WAY YOU TALK:
- Short. Always. Max 2-3 sentences per reply. Never send walls of text.
- You match energy. They send two words, you send two words back plus a tiny nudge. They open up, you open a little too.
- You never ask two questions in one message. Ever.
- You don't ask yes/no questions. You open doors, not gates.
- You never use hollow phrases: "That makes sense", "I understand your feelings", "I'm here for you", "As an AI..." — these are banned.
- No bullet points. No headers. No lists. Just conversation.
- Occasional emojis if they fit — not for decoration, for tone.

HOW YOU DECOMPOSE FEELINGS (INVISIBLY):
You are skilled at gently pulling threads. You never name what someone is feeling out loud. You just respond to the feeling itself.
- If someone says "I'm tired" — you don't ask "tired how?" You say something like "Ahh that kind of tired where even resting feels like effort?"
- If someone says "nothing's going right" — you don't say "I'm sorry to hear that." You say something like "Yeah, some days it's like the whole universe is just... off."
- You normalize without minimizing. You acknowledge without dramatizing.
- You never say things like "I can hear your pain" or "You're so brave." That's pity. You're a friend, not a counselor.

ABSOLUTE RULE — NEVER LABEL EMOTIONS:
You NEVER say words like "anxiety", "depression", "stress", "trauma", "panic", "disorder", "mental health", "burnout", or any clinical/diagnostic term. Not even casually. Not even "sounds like you're stressed." You respond to what they share — you never put a name on it. Ever. The emotion stays between the lines, never on the page.

CONTENT BOUNDARIES:
If someone brings up sexual content, abuse of others, explicit topics, or anything harmful — you do not engage with it, encourage it, or play along. You gently redirect without making them feel judged. Something like: "Hmm, that's not really my space — but if something's going on with you, I'm genuinely here for that." Keep it brief, warm, and move on. Never lecture, never repeat the redirect.

KEEPING CONVERSATION ALIVE (NATURALLY):
- After you respond to a feeling, you leave one gentle thread open — something they can grab if they want, ignore if they don't.
- Curiosity > questions. "I wonder what started it" lands better than "What started it?"
- If they go quiet or dry ("ok", "yeah", "idk") — don't push. Shift softly. A little humor. A tiny observation. Something easy.
- Never force depth. Let it come.

MEMORY (INVISIBLE):
You remember what came before in this conversation naturally. You don't reference it explicitly ("like you said earlier..."). You just carry the thread as a friend would — it shows in how you respond, not what you say.

ADVICE:
Only if asked directly. Keep it practical and short. No lectures.

BEFORE VERSE (IMPORTANT):
- You offer a Quranic verse only after enough emotional texture has built up (never before 10 messages in a session).
- You never offer it robotically. It comes from a place of genuine care: "Hey, I was just thinking of something. Want me to share it?"
- If they say yes, you provide it fully and warmly. If no, you let it go completely and move on.
- If they ask for a verse directly, you always provide one.

LANGUAGE:
- English only in your replies.
- You understand Roman Urdu but never output it.
- No: yaar, uff, dil, gham, pareshaan, haan, jee, bilkul, sukoon, mashallah, alhamdulillah, shabba khair.
- Natural interjections are welcome: "oh wow", "wait really?", "haha", "ahh", "honestly", "lol" — when they genuinely fit.

AFTER A VERSE:
You don't vanish. You stay present. You continue the conversation as if you're still just two people talking. The verse was a moment, not an ending.

TONE SUMMARY:
Warm. Real. Unhurried. You are not trying to fix anyone. You are just there — and that is enough.`
  };
}

const GREETINGS = [
  "Hey! So glad you're here. How's your vibe today? ✨",
  "Hi! It's always so good to see you. How's your heart feeling? 💜",
  "Welcome back! Hope your internal weather is calm. How are you really? 🌊",
];

const FAREWELLS = [
  "Take care, friend. Talk soon — I'll be right here! 💜",
  "Have a peaceful day. I'm always here when you need me.",
];

async function detectEmotion(text, token) {
  if (!text) return "neutral";
  try {
    const res = await fetch(`${API_BASE}/api/emotion/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.emotion || "neutral";
  } catch {
    return "neutral";
  }
}

function isNegativeSelfTalk(text) {
  const l = text.toLowerCase();
  return [/i('m| am) (useless|worthless|bad|failure|stupid|weak)/,/i (always|never) (fail|succeed)/,/nothing (works|changes)/,/nobody (likes|loves|cares)/].some(p => p.test(l));
}

function isGoodbye(text) {
  const t = text.toLowerCase().trim();
  return ["bye","goodbye","allah hafiz","khuda hafiz","ok bye"].some(k => t === k || t.endsWith(" " + k));
}

const isCrisisTxt = t => /suicid|kill myself|end my life|want to die|self.harm/i.test(t);

const headers = tok => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok}` });

export default function ChatbotApp({ token, logout, backToHub }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [emotion, setEmotion] = useState("neutral");
  const [crisis, setCrisis] = useState(false);
  const [style, setStyle] = useState("Gentle");
  const [relig, setRelig] = useState(true);
  const [pendingVerseOffer, setPendingVerseOffer] = useState(null);
  const chatHist = useRef([]);
  const endRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/chat/get`, { headers: headers(token) });
      const d = await r.json();
      if (Array.isArray(d)) {
        const hist = d.reverse();
        
        // Add a fresh greeting to the bottom of the list on every load
        const gr = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
        const greetingMsg = { id: "g-" + Date.now(), text: gr, isUser: false, ts: new Date().toLocaleTimeString() };
        
        const finalMsgs = [...hist, greetingMsg];
        setMsgs(finalMsgs);
        chatHist.current = finalMsgs.map(m => ({ role: m.isUser?"user":"assistant", content: m.text })).slice(-20);
      }
    } catch (err) {
      console.error("Fetch History Error:", err);
    }
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const appendMsg = (text, isUser = false, extras = {}) => {
    // Standardize message object: text is the fallback, extras can contain ayat details
    const m = { id: Date.now() + Math.random(), text, isUser, ts: new Date().toLocaleTimeString(), ...extras };
    setMsgs(p => [...p, m]);
    
    // For verses, save the formatted reference
    const saveText = m.type === "verse" ? `[Verse: ${m.context}] ${m.arabic}` : text;
    saveMsg(saveText, isUser);
    return m;
  };

  const saveMsg = async (text, isUser) => {
    try {
      await fetch(`${API_BASE}/api/chat/save`, {
        method: "POST", headers: headers(token),
        body: JSON.stringify({ text, isUser, ts: new Date().toISOString() })
      });
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || typing) return;
    const txt = input.trim(); setInput("");
    appendMsg(txt, true);
    chatHist.current = [...chatHist.current, { role: "user", content: txt }].slice(-20);

    if (isCrisisTxt(txt)) setCrisis(true);

    const isAffirmative = (t) => ["yes","yeah","sure","ok","okay","haan","jee","please","do it"].some(k => t.toLowerCase().includes(k));
    const isNegative = (t) => ["no","nah","nope","nahi"].some(k => t.toLowerCase().includes(k));

    if (pendingVerseOffer) {
      if (isAffirmative(txt)) {
        const v = pendingVerseOffer;
        setPendingVerseOffer(null);
        setTyping(true);
        
        // Use special type for raw formatted display
        appendMsg("", false, { 
          type: "verse", 
          arabic: v.arabic, 
          translation: v.translation, 
          tafsir: v.tafsir, 
          context: v.context 
        });
        
        // Short AI reflection for the website too
        setTimeout(async () => {
          try {
            const resReflect = await fetch(`${API_BASE}/api/chat/ask`, {
              method: "POST", headers: headers(token),
              body: JSON.stringify({ 
                message: "Reflect briefly on this verse for me.", 
                style, religious: relig, history: chatHist.current 
              })
            });
            const dr = await resReflect.json();
            if (dr.reply) appendMsg(dr.reply, false);
          } finally { setTyping(false); }
        }, 1200);
        return;
      } else if (isNegative(txt)) {
        setPendingVerseOffer(null);
        appendMsg("No problem, I'm here if you need anything else. 💜", false);
        return;
      }
      setPendingVerseOffer(null);
    }
    if (isGoodbye(txt)) {
      setTyping(true);
      setTimeout(() => {
        const f = FAREWELLS[Math.floor(Math.random() * FAREWELLS.length)];
        appendMsg(f, false);
        setTyping(false);
      }, 1000);
      return;
    }

    setTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          message: txt,
          style: style,
          religious: relig,
          history: chatHist.current.slice(0, -1)
        })
      });
      const d = await res.json();
      const reply = d.reply || "I'm here for you.";
      
      appendMsg(reply, false);
      chatHist.current = [...chatHist.current, { role: "assistant", content: reply }].slice(-20);

      if (d.verseOffer) {
        setPendingVerseOffer(d.verseOffer);
      }
    } catch {
      appendMsg("I'm listening, friend. Tell me more.", false);
    } finally {
      setTyping(false);
    }
  };


  const sentLabel = emotion==="happy"?"Feeling Good 😊":emotion==="sad"?"Feeling Low 😔":emotion==="anxious"?"Anxious 😰":emotion==="fearful"?"Fearful 😟":"Neutral 🌙";
  const sentClass = emotion==="happy"?"sb-ok":(emotion==="sad"||emotion==="fearful")?"sb-er":"sb-nd";

  return (
    <div style={{display:"flex", height:"100vh", background:"var(--su)"}}>
      <header style={{position:"fixed", top:0, left:0, right:0, height:"60px", background:"rgba(255,255,255,0.8)", backdropFilter:"blur(10px)", borderBottom:"1px solid var(--bd)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 2rem", zIndex:100}}>
        <div style={{fontWeight:700, cursor:"pointer", color:"var(--p)"}} onClick={backToHub}>Qalbify Companion 💜</div>
        <div style={{display:"flex", gap:"1rem"}}>
           <button onClick={backToHub} style={{background:"none", border:"1px solid var(--p)", color:"var(--p)", padding:"0.4rem 1rem", borderRadius:"100px", fontSize:"0.8rem", cursor:"pointer"}}>Switch to Hub</button>
           <button onClick={logout} style={{background:"var(--p)", color:"white", border:"none", padding:"0.4rem 1rem", borderRadius:"100px", fontSize:"0.8rem", cursor:"pointer"}}>Logout</button>
        </div>
      </header>

      {/* Sidebar */}
      <div style={{width:"260px", background:"#1e0f2e", color:"white", paddingTop:"80px", display:"flex", flexDirection:"column", gap:"1rem", flexShrink:0}}>
        <div style={{padding:"0 1.5rem", fontSize:"0.75rem", fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em"}}>COMFORT STYLE</div>
        <div style={{padding:"0 1rem", display:"flex", flexWrap:"wrap", gap:"0.5rem"}}>
          {["Gentle","Motivational","Soft","Spiritual","Silent"].map(s=>(
            <button key={s} onClick={()=>setStyle(s)} style={{background:style===s?"var(--p)":"rgba(255,255,255,0.05)", border:"1px solid", borderColor:style===s?"var(--p)":"rgba(255,255,255,0.1)", color:"white", padding:"0.3rem 0.7rem", borderRadius:"100px", fontSize:"0.7rem", cursor:"pointer"}}>{s}</button>
          ))}
        </div>
        <div style={{margin:"1rem 1.5rem 0", display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.7rem"}}>
          <span style={{color:"rgba(255,255,255,0.5)"}}>Religious guidance</span>
          <button onClick={()=>setRelig(!relig)} style={{background:relig?"var(--p)":"rgba(255,255,255,0.1)", border:"none", color:"white", padding:"0.2rem 0.5rem", borderRadius:"4px", fontSize:"0.6rem", cursor:"pointer"}}>{relig?"ON":"OFF"}</button>
        </div>
        <div style={{marginTop:"auto", padding:"1.5rem", fontSize:"0.65rem", color:"rgba(255,255,255,0.2)", lineHeight:"1.5"}}>
          Your data is de-identified & private.<br/>K-Anonymity Active.
        </div>
      </div>

      {/* Chat Area */}
      <div style={{flex:1, display:"flex", flexDirection:"column", paddingTop:"60px", position:"relative"}}>
        {crisis && (
          <div style={{background:"#fff5f5", border:"1px solid #fecaca", margin:"1rem 2rem 0", padding:"1rem", borderRadius:"12px", color:"#b91c1c", fontSize:"0.8rem", display:"flex", gap:"1rem"}}>
            <span style={{fontSize:"1.5rem"}}>🆘</span>
            <div><strong>You are not alone. Help is available.</strong><br/>Umang Pakistan: 0317-4288665 · Rozan: 051-2890505</div>
          </div>
        )}

        <div style={{flex:1, overflowY:"auto", padding:"2rem", display:"flex", flexDirection:"column", gap:"1.5rem"}}>
          {msgs.map(m => (
            <div key={m.id} style={{display:"flex", gap:"1rem", maxWidth:"80%", alignSelf:m.isUser?"flex-end":"flex-start", flexDirection:m.isUser?"row-reverse":"row"}} className="fa">
              <div style={{width:"32px", height:"32px", borderRadius:"50%", background:m.isUser?"linear-gradient(135deg, #c9a233, #e8d48a)":"var(--p)", display:"flex", alignItems:"center", justifyCenter:"center", flexShrink:0, fontSize:"0.8rem", color:"white", fontWeight:700, justifyContent:"center"}}>{m.isUser?"U":"Q"}</div>
              <div style={{background:m.isUser?"var(--pd)":"white", color:m.isUser?"white":"var(--ink)", padding:"1rem", borderRadius:"18px", border:m.isUser?"none":"1px solid var(--bd)", boxShadow:m.isUser?"0 8px 25px rgba(94,43,151,0.1)":"0 2px 8px rgba(0,0,0,0.02)", borderBottomRightRadius:m.isUser?0:"18px", borderBottomLeftRadius:m.isUser?"18px":0}}>
                {m.type === "verse" ? (
                  <div style={{display:"flex", flexDirection:"column", gap:"0.8rem"}}>
                    <div style={{fontSize:"1.6rem", textAlign:"right", color:"var(--p)", fontFamily:"'Scheherazade New', serif", lineHeight:1.6}}>﴿ {m.arabic} ﴾</div>
                    <div style={{fontSize:"0.9rem", fontStyle:"italic", color:"var(--mu)"}}>{m.translation}</div>
                    <div style={{background:"var(--su)", padding:"0.8rem", borderRadius:"10px", fontSize:"0.82rem", lineHeight:1.5, borderLeft:"3px solid var(--p)"}}>
                      <strong style={{display:"block", marginBottom:"0.3rem", color:"var(--p)", fontSize:"0.7rem", textTransform:"uppercase"}}>Reflection & Tafseer</strong>
                      {m.tafsir}
                    </div>
                    <div style={{fontSize:"0.65rem", fontWeight:700, color:"var(--p)", textTransform:"uppercase", letterSpacing:"0.05em"}}>— {m.context}</div>
                  </div>
                ) : (
                  <div style={{fontSize:"0.95rem", lineHeight:1.5}}>{m.text}</div>
                )}
                <div style={{fontSize:"0.65rem", marginTop:"0.4rem", opacity:0.6}}>{m.ts}</div>
              </div>
            </div>
          ))}
          {typing && <div style={{display:"flex", gap:"1rem", alignSelf:"flex-start"}} className="fa"><div style={{width:"32px", height:"32px", borderRadius:"50%", background:"var(--p)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700}}>Q</div><div style={{padding:"0.8rem 1rem", background:"white", borderRadius:"18px", border:"1px solid var(--bd)"}}><div className="ty" style={{fontSize:"0.8rem", color:"var(--p)", fontWeight:600}}>Typing...</div></div></div>}
          <div ref={endRef} />
        </div>

        <div style={{padding:"1.5rem 2rem", background:"white", borderTop:"1px solid var(--bd)"}}>
          <div style={{display:"flex", gap:"1rem", background:"var(--su)", padding:"0.5rem", borderRadius:"15px", border:"1.5px solid var(--bd)"}}>
            <textarea style={{flex:1, background:"none", border:"none", outline:"none", padding:"0.5rem 1rem", fontSize:"0.95rem", resize:"none", fontFamily:"inherit"}} placeholder="How is your heart feeling today?..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(); handleSend();}}} rows={1}/>
            <button onClick={handleSend} disabled={!input.trim()||typing} style={{width:"44px", height:"44px", background:"var(--p)", color:"white", border:"none", borderRadius:"12px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s"}}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );
}
