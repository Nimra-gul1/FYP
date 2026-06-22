import { io } from "socket.io-client";

// ─── CONFIG ───────────────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

// HuggingFace is a public endpoint so we can still use it from the browser:
export const HF_URL =
  "https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base";
export const HF_KEY = import.meta.env.VITE_HF_KEY || "";

// ─── BACKEND HELPERS ──────────────────────────────────────────────────────
export const headers = (tok) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${tok}`,
});

// Initialize Socket.IO
export const socket = io(API_BASE, { autoConnect: false });

// ─── FALLBACK VERSES (if backend is offline) ─────────────────────────────
export const VERSES = {
  sad: {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    trans: "Indeed, with hardship comes ease.",
    ref: "Surah Ash-Sharh · 94:5",
    tafsir:
      "This wasn't a future promise — 'with' means ease exists alongside the hardship, right now, in this very moment. You're not waiting for better days. They're already here, hidden inside this one.",
  },
  anxious: {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    trans: "Verily, in the remembrance of Allah do hearts find rest.",
    ref: "Surah Ar-Ra'd · 13:28",
    tafsir:
      "The Arabic 'tatma'innu' means deep settled calm — not temporary relief. This is the peace that comes when we turn toward Allah rather than away from our problems.",
  },
  fearful: {
    arabic: "وَعَلَى اللَّهِ فَتَوَكَّلُوا",
    trans: "And upon Allah, place your trust.",
    ref: "Surah Al-Ma'idah · 5:23",
    tafsir:
      "Tawakkul isn't passive. It's taking every action you can, then releasing the outcome. You do your part — Allah handles the rest.",
  },
  happy: {
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    trans: "If you are grateful, I will surely increase you.",
    ref: "Surah Ibrahim · 14:7",
    tafsir:
      "Gratitude isn't just a feeling — it's an act that multiplies blessings. Allah literally promises more when we acknowledge what we have.",
  },
  default: {
    arabic: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
    trans: "Your Lord has not abandoned you, nor has He detested you.",
    ref: "Surah Ad-Duha · 93:3",
    tafsir:
      "These words were revealed directly to a heart in silence and waiting. If you feel forgotten — this verse was written specifically for you.",
  },
};

export const CSS = `
:root {
  --p: #9D50BB; --pd: #6E48AA; --pp: #F3E8FF;  --bg: #F3E8FF;
  --ink: #4A235A; --mu: #884EA0; --bd: #D7BDE2; --go: #6E48AA;
  --ok: #10b981; --er: #ef4444; --wa: #f59e0b;
  --p1: #dc2626; --p2: #ea580c; --p3: #ca8a04;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
body { font-family: 'Outfit', 'Poppins', sans-serif; background: var(--bg); color: var(--ink); line-height: 1.6; overflow-x: hidden; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #D7BDE2; border-radius: 10px; }

/* PAGE CONTROL */
.pg { display: none; background: transparent; }
.pg.on { display: block; }

/* ANIMATIONS */
@keyframes fU { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pu { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes bo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes fl { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
@keyframes sp { to { transform: rotate(360deg); } }
@keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
.fa { animation: fU 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

/* UTILS */
.spin { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: sp 0.8s linear infinite; }
.odot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--ok); margin-right: 6px; }
.pdot { width: 10px; height: 10px; border-radius: 50%; }
.p1-bg { background: var(--p1); box-shadow: 0 0 8px var(--p1); }
.p2-bg { background: var(--p2); box-shadow: 0 0 8px var(--p2); }
.p3-bg { background: var(--p3); box-shadow: 0 0 8px var(--p3); }

/* ACTIVITY FEED */
.lfs { display: flex; flex-direction: column; gap: 0.8rem; background: #FFFFFF; border: 1px solid var(--bd); border-radius: 20px; padding: 1.5rem; max-height: 650px; overflow-y: auto; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(110, 72, 170, 0.05); }
.lfi { display: flex; gap: 0.8rem; padding-bottom: 1rem; border-bottom: 1px solid #F3E8FF; animation: fU 0.4s ease both; }
.lfi-ic { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; background: #F3E8FF; color: var(--p); }
.lfi-tx { font-size: 0.82rem; line-height: 1.4; color: var(--ink); }
.lfi-ts { font-size: 0.7rem; color: var(--mu); margin-top: 2px; }

/* SPARKLINE */
.sl-c { width: 100%; height: 50px; margin: 12px 0; overflow: visible; filter: drop-shadow(0 2px 4px rgba(110, 72, 170, 0.05)); }

/* KEYWORD CLOUD */
.kwc { display: flex; flex-wrap: wrap; gap: 0.6rem; padding: 1rem 0; }
.kwi { padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: #FFFFFF; color: var(--ink); border: 1px solid var(--bd); transition: 0.2s; cursor: default; }
.kwi:hover { transform: scale(1.05); background: #F3E8FF; }

/* PULSE STRIP */
.pls { display: flex; align-items: center; gap: 1.2rem; background: #FFFFFF; color: var(--ink); padding: 0.6rem 1.2rem; border-radius: 12px; margin-bottom: 1.5rem; overflow: hidden; white-space: nowrap; box-shadow: 0 4px 12px rgba(110, 72, 170, 0.08); border: 1px solid var(--bd); }
.pls-t { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--p); letter-spacing: 1px; flex-shrink: 0; }
.pls-c { flex: 1; overflow: hidden; min-width: 0; display: flex; align-items: center; }
.pls-m { font-size: 0.8rem; display: inline-block; padding-left: 100%; animation: marquee 50s linear infinite; flex-shrink: 0; color: var(--mu); }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-105%); } }

/* NAV */
nav { position: sticky; top: 0; height: 74px; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--bd); 
      display: flex; align-items: center; justify-content: space-between; padding: 0 6%; z-index: 1000; transition: 0.3s; }
.logo { font-size: 1.6rem; font-weight: 800; color: var(--p); letter-spacing: -0.04em; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.logo:hover { transform: scale(1.03); }
.nl { font-size: 0.92rem; font-weight: 600; color: var(--mu); cursor: pointer; transition: 0.2s; position: relative; }
.nl:hover { color: var(--p); }
.nl.on { color: var(--p); }
.nl.on::after { content: ''; position: absolute; bottom: -6px; left: 0; width: 100%; height: 2.5px; background: var(--p); border-radius: 10px; }
.ncta { background: var(--p); color: #fff; border: none; padding: 0.7rem 1.6rem; border-radius: 14px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(157,80,187,0.25); }
.ncta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(157,80,187,0.35); filter: brightness(1.1); }

/* HERO */
.hero { position: relative; padding: 120px 6% 80px; text-align: center; overflow: hidden; background: linear-gradient(180deg, #FFFFFF 0%, #F3E8FF 100%); }
.orbs { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; z-index: 0; }
.orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: fl 8s infinite ease-in-out; }
.o1 { width: 400px; height: 400px; background: #D7BDE2; top: -100px; right: -50px; animation-delay: 0s; }
.o2 { width: 350px; height: 350px; background: #E8DAEF; bottom: -50px; left: -50px; animation-delay: 2s; }
.o3 { width: 300px; height: 300px; background: #F4ECF7; top: 20%; left: 30%; animation-delay: 4s; }
.hero > * { position: relative; z-index: 1; }
.h-ar { font-family: 'Scheherazade New', serif; font-size: 2.2rem; color: var(--pd); margin-bottom: 1.5rem; opacity: 0.8; }
.h-badge { display: inline-block; padding: 0.5rem 1.2rem; background: #FFFFFF; color: var(--pd); border-radius: 100px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 2rem; border: 1px solid var(--bd); }
.hero h1 { font-size: clamp(2.5rem, 6vw, 4.2rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.05em; color: var(--ink); margin-bottom: 1.5rem; }
.hero h1 em { font-style: normal; color: var(--p); background: linear-gradient(to right, #9D50BB, #6E48AA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero p { font-size: 1.2rem; color: var(--mu); max-width: 680px; margin: 0 auto 3rem; }
.hbtns { display: flex; gap: 1.2rem; justify-content: center; align-items: center; flex-wrap: wrap; }
.btn-w { background: var(--p); color: #fff; padding: 1.1rem 2.8rem; border-radius: 18px; font-size: 1.05rem; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 25px rgba(157,80,187,0.3); }
.btn-w:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(157,80,187,0.4); }
.btn-ow { background: #FFFFFF; color: var(--p); padding: 1.1rem 2.5rem; border-radius: 18px; font-size: 1.05rem; font-weight: 700; border: 2px solid var(--bd); cursor: pointer; transition: 0.3s; }
.btn-ow:hover { background: #F3E8FF; color: var(--pd); border-color: var(--p); }

.hstats { display: flex; gap: 4rem; justify-content: center; margin-top: 5rem; }
.sn { font-size: 1.8rem; font-weight: 800; color: var(--ink); }
.sl { font-size: 0.85rem; color: var(--mu); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

/* SECTIONS */
.sec { padding: 100px 6%; }
.si { max-width: 1200px; margin: 0 auto; }
.chip { display: inline-block; padding: 0.4rem 1rem; background: #FFFFFF; border: 1px solid var(--bd); border-radius: 100px; font-size: 0.75rem; font-weight: 700; color: var(--p); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.2rem; }
.st { font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1rem; color: var(--ink); }
.st em { font-style: normal; color: var(--p); }
.ss { font-size: 1.1rem; color: var(--mu); max-width: 600px; margin-bottom: 4rem; }
.g3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
.fc { background: #FFFFFF; color: var(--ink); padding: 2.5rem; border-radius: 24px; border: 1px solid var(--bd); transition: 0.4s; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(110, 72, 170, 0.05); }
.fc:hover { transform: translateY(-10px); border-color: var(--p); box-shadow: 0 20px 40px rgba(110, 72, 170, 0.1); }
.fi { font-size: 2.5rem; margin-bottom: 1.5rem; background: #F3E8FF; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; border-radius: 18px; border: 1px solid var(--bd); }
.fc h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; color: var(--ink); }
.fc p { font-size: 0.95rem; color: var(--mu); line-height: 1.7; }
.ftag { position: absolute; top: 2.5rem; right: 2.5rem; font-size: 0.65rem; font-weight: 800; color: var(--p); opacity: 0.4; text-transform: uppercase; letter-spacing: 0.1em; }

/* ADMIN PREVIEW */
.adm-sec { background: #FFFFFF; padding: 120px 6%; border-radius: 60px 60px 0 0; margin-top: -40px; box-shadow: 0 -20px 40px rgba(0,0,0,0.02); }
.ac { background: #F3E8FF; border: 1px solid var(--bd); padding: 2.5rem; border-radius: 24px; transition: 0.4s; }
.ac:hover { background: #FFFFFF; border-color: var(--p); box-shadow: 0 10px 30px rgba(110, 72, 170, 0.1); }
.ac h3 { color: var(--ink); font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
.ac p { color: var(--mu); font-size: 0.95rem; }

/* LOGIN */
.lw { position: fixed; inset: 0; background: linear-gradient(135deg, #fdfbff 0%, #f3e8ff 100%); z-index: 5000; overflow-y: auto; display: flex; align-items: center; justify-content: center; padding: 20px; }
.lc { background: #FFFFFF; color: var(--ink); width: 100%; max-width: 440px; padding: 3rem; border-radius: 32px; box-shadow: 0 25px 60px rgba(110, 72, 170, 0.1); border: 1px solid var(--bd); }
.lc h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--ink); }
.lc p { font-size: 1rem; color: var(--mu); margin-bottom: 2.5rem; }
.fg { margin-bottom: 1.5rem; }
.fg label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.6rem; color: var(--ink); }
.fi2 { width: 100%; padding: 1rem 1.2rem; border: 2px solid var(--bd); border-radius: 16px; font-size: 1rem; transition: 0.3s; font-family: inherit; color: var(--ink); background: #FFFFFF; }
.fi2:focus { outline: none; border-color: var(--p); background: #F3E8FF; }
.fb { width: 100%; padding: 1.1rem; background: var(--p); color: #fff; border: none; border-radius: 16px; font-size: 1.05rem; font-weight: 700; cursor: pointer; transition: 0.3s; margin-top: 1rem; box-shadow: 0 8px 25px rgba(157, 80, 187, 0.2); }
.fb:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 12px 30px rgba(157, 80, 187, 0.3); }
.fb2 { width: 100%; padding: 1.1rem; background: #FFFFFF; color: var(--p); border: 2px solid var(--bd); border-radius: 16px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: 0.3s; margin-top: 1rem; }
.fb2:hover { background: #F3E8FF; border-color: var(--p); }
.ord { text-align: center; margin: 1.5rem 0; font-size: 0.8rem; font-weight: 700; color: var(--mu); position: relative; }
.ord::before, .ord::after { content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--bd); }
.ord::before { left: 0; } .ord::after { right: 0; }
.dn2 { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: var(--mu); }
.dn2 span { color: var(--p); font-weight: 700; cursor: pointer; text-decoration: underline; }
.eb { background: #fee2e2; color: #ef4444; padding: 1rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; border: 1px solid #fecaca; }

/* CHAT LAYOUT */
.cl { display: flex; height: calc(100vh - 74px); }
.csb { width: 300px; background: #FFFFFF; border-right: 1px solid var(--bd); display: flex; flex-direction: column; flex-shrink: 0; }
.csbh { padding: 1.5rem; border-bottom: 1px solid var(--bd); }
.csbt { font-size: 0.75rem; font-weight: 700; color: var(--mu); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
.cnb { width: 100%; padding: 0.85rem; background: #F3E8FF; border: 1px solid var(--p); border-radius: 12px; color: var(--p); font-weight: 700; cursor: pointer; transition: 0.3s; }
.cnb:hover { background: var(--p); color: #fff; }
.chi { padding: 1rem 1.5rem; border-bottom: 1px solid #F3E8FF; cursor: pointer; font-size: 0.88rem; color: var(--mu); transition: 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chi:hover { background: #F3E8FF; color: var(--ink); }
.chi.on { background: #F3E8FF; color: var(--ink); border-left: 3px solid var(--p); font-weight: 700; }
.chis { font-size: 0.7rem; color: var(--mu); margin-top: 0.3rem; }

.cm { flex: 1; display: flex; flex-direction: column; background: #FFFFFF; color: var(--ink); position: relative; }
.ctb { height: 74px; border-bottom: 1px solid var(--bd); padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; }
.ctl { display: flex; align-items: center; gap: 12px; }
.ctl h3 { font-size: 1.1rem; font-weight: 700; color: var(--ink); }
.ctl p { font-size: 0.75rem; color: var(--mu); font-weight: 500; display: flex; align-items: center; }

.msgs { flex: 1; overflow-y: auto; padding: 2rem 10% 1rem; display: flex; flex-direction: column; gap: 1.5rem; background: #FDFBFF; }
.mr { display: flex; gap: 1rem; max-width: 85%; }
.mr.u { align-self: flex-end; flex-direction: row-reverse; }
.mav { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.mav.b { background: #F3E8FF; border: 1px solid var(--bd); }
.mav.u { background: var(--p); color: #fff; }
.mb { padding: 1rem 1.25rem; border-radius: 20px; font-size: 0.98rem; position: relative; }
.mb.b { background: #FFFFFF; border: 1px solid var(--bd); border-top-left-radius: 4px; color: var(--ink); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.mb.u { background: var(--p); color: #fff; border-top-right-radius: 4px; box-shadow: 0 4px 12px rgba(157, 80, 187, 0.15); }
.mts { font-size: 0.65rem; margin-top: 0.5rem; opacity: 0.6; font-weight: 600; }

.ayc { margin-top: 1rem; background: #FFFFFF; color: var(--ink); border: 1.5px solid var(--bd); border-radius: 18px; padding: 1.5rem; box-shadow: 0 10px 20px rgba(110, 72, 170, 0.05); }
.ay-ar { display: block; font-family: 'Scheherazade New', serif; font-size: 1.8rem; text-align: right; color: var(--pd); line-height: 1.6; margin-bottom: 0.8rem; }
.ay-tr { display: block; font-size: 0.95rem; font-style: italic; color: var(--mu); line-height: 1.6; margin-bottom: 0.6rem; }
.ay-ref { display: block; font-size: 0.75rem; font-weight: 700; color: var(--p); text-transform: uppercase; letter-spacing: 0.05em; }

.cia { padding: 1rem 10% 2.5rem; background: #FDFBFF; }
.cir { background: #FFFFFF; color: var(--ink); border: 1px solid var(--bd); border-radius: 20px; padding: 0.6rem; display: flex; align-items: flex-end; gap: 0.6rem; transition: 0.3s; box-shadow: 0 10px 30px rgba(110, 72, 170, 0.05); }
.cir:focus-within { border-color: var(--p); box-shadow: 0 10px 30px rgba(157, 80, 187, 0.1); }
.cit { flex: 1; border: none; background: transparent; padding: 0.5rem; font-size: 1rem; font-family: inherit; resize: none; max-height: 150px; line-height: 1.5; color: var(--ink); }
.cit:focus { outline: none; }
.csnd { background: var(--p); color: #fff; border: none; width: 44px; height: 44px; border-radius: 14px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
.csnd:hover { transform: scale(1.05); filter: brightness(1.1); }
.csnd:disabled { opacity: 0.3; cursor: not-allowed; }

.ty { display: flex; gap: 4px; padding: 1.2rem; background: #FFFFFF; border: 1px solid var(--bd); border-radius: 20px; border-top-left-radius: 4px; width: fit-content; }
.td { width: 6px; height: 6px; background: var(--bd); border-radius: 50%; animation: bo 1s infinite alternate; }
.td:nth-child(2) { animation-delay: 0.2s; }
.td:nth-child(3) { animation-delay: 0.4s; }

.mps { display: flex; gap: 0.8rem; overflow-x: auto; padding: 0 10% 1rem; background: #FDFBFF; }
.mp { padding: 0.6rem 1.1rem; background: #FFFFFF; color: var(--mu); border: 1.5px solid var(--bd); border-radius: 14px; font-size: 0.82rem; font-weight: 600; white-space: nowrap; cursor: pointer; transition: 0.2s; }
.mp:hover { border-color: var(--p); color: var(--p); background: #F3E8FF; }

.sbadge { padding: 0.4rem 0.9rem; border-radius: 100px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
.s-pos { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.s-neg { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
.s-neu { background: #f9fafb; color: #4b5563; border: 1px solid #e5e7eb; }

/* CRISIS */
.crisis-bar { margin: 1rem 10% 0; background: #ef4444; color: #fff; padding: 1rem 1.5rem; border-radius: 18px; font-size: 0.88rem; display: flex; align-items: center; gap: 1rem; animation: pu 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 2px solid rgba(255,255,255,0.2); }

/* STYLE PREFS */
.stp { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.stpb { padding: 0.5rem; border: 1px solid var(--bd); background: #FFFFFF; border-radius: 8px; font-size: 0.6rem; color: var(--ink); font-weight: 600; cursor: pointer; transition: 0.2s; }
.stpb:hover { background: #F3E8FF; }
.stpb.on { background: var(--p); border-color: var(--p); color: #fff; }
.rgtoggle { width: 44px; height: 22px; background: #E2E8F0; border-radius: 100px; border: none; position: relative; cursor: pointer; transition: 0.3s; font-size: 0.55rem; font-weight: 800; color: #4A235A; padding-left: 20px; }
.rgtoggle::before { content: ''; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.rgtoggle.on { background: var(--ok); padding-left: 8px; padding-right: 20px; color: #fff; }
.rgtoggle.on::before { transform: translateX(22px); }

.dl-portal {
  display: flex; flex-direction: column; min-height: 100vh; width: 100%;
  position: relative; overflow-x: hidden; background: #F3E8FF;
}
.dm.full-width {
  width: 100%; max-width: 1400px; margin: 0 auto; padding: 2rem 6%;
  position: relative; z-index: 5; background: transparent;
}
.dashboard-header {
  padding: 1.5rem 6%; display: flex; align-items: center; justify-content: space-between;
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--bd);
  position: sticky; top: 0; z-index: 1000;
}

.dm { flex: 1; overflow-y: auto; background: transparent; padding: 2.5rem 6%; }
.dh { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2.5rem; }
.dh h2 { font-size: 2.2rem; font-weight: 900; color: var(--ink); letter-spacing: -1.5px; margin-bottom: 0.4rem; }
.dh p { font-size: 1rem; color: var(--mu); font-weight: 500; }

.kg { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.kc { 
  background: #FFFFFF; 
  backdrop-filter: blur(10px); 
  border: 1px solid var(--bd); 
  border-radius: 20px; 
  padding: 1.5rem; 
  box-shadow: 0 10px 30px rgba(110, 72, 170, 0.05); 
}
.kv { font-size: 2.2rem; font-weight: 800; color: var(--ink); margin-bottom: 0.5rem; }
.kl { font-size: 0.78rem; font-weight: 700; color: var(--mu); text-transform: uppercase; letter-spacing: 0.05em; }
.kt { font-size: 0.75rem; margin-top: 1rem; font-weight: 700; }
.tu { color: var(--ok); } .te { color: var(--er); } .tw2 { color: var(--wa); }

.dc { 
  background: #FFFFFF; 
  backdrop-filter: blur(12px); 
  border: 1px solid var(--bd); 
  border-radius: 24px; 
  padding: 2rem; 
  box-shadow: 0 10px 40px rgba(110, 72, 170, 0.05); 
  margin-bottom: 1.5rem; 
  height: auto; 
}
.dc h4 { font-size: 0.85rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); margin-bottom: 2rem; display: flex; align-items: center; gap: 10px; }
.dc h4::before { content: ''; width: 4px; height: 18px; background: var(--p); border-radius: 10px; }

.dg { display: grid; gap: 1.5rem; margin-bottom: 1.5rem; }
.dg2 { grid-template-columns: 2fr 1fr; }
.dg3 { grid-template-columns: repeat(3, 1fr); }

.tw { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
th { text-align: left; padding: 1.2rem; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em; color: var(--mu); border-bottom: 2px solid #F3E8FF; }
td { padding: 1.2rem; border-bottom: 1px solid #F3E8FF; font-size: 0.95rem; color: var(--ink); }
tr:last-child td { border-bottom: none; }
.sp { display: inline-flex; align-items: center; padding: 0.4rem 0.9rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.spg { background: #f0fdf4; color: #22c55e; border: 1px solid #bbf7d0; }
.spr { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
.spy { background: #fffbeb; color: #f59e0b; border: 1px solid #fef3c7; }
.sp-off { background: #f9fafb; color: #4b5563; border: 1px solid #e5e7eb; }

.fa-pulse { animation: fa-pulse 2s infinite ease-in-out; }
@keyframes fa-pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.98); }
  100% { opacity: 1; transform: scale(1); }
}
.ab { background: #FFFFFF; border: 1.5px solid var(--bd); padding: 0.6rem 1.2rem; border-radius: 12px; font-size: 0.8rem; font-weight: 800; cursor: pointer; color: var(--ink); transition: 0.3s; font-family: inherit; }
.ab:hover { background: var(--p); border-color: var(--p); color: #fff; transform: translateY(-2px); }
.ab.derr:hover { border-color: var(--er); color: var(--er); background: #fef2f2; }

.bw { display: flex; flex-direction: column; gap: 1.2rem; }
.bi { display: flex; align-items: center; gap: 1rem; }
.bl { font-size: 0.8rem; font-weight: 800; color: var(--mu); width: 90px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.5px; }
.bt2 { flex: 1; height: 8px; background: #F3E8FF; border-radius: 10px; overflow: hidden; }
.bf { height: 100%; background: var(--p); border-radius: 10px; }
.bp { font-size: 0.8rem; font-weight: 900; color: var(--ink); width: 45px; text-align: right; }

.kwc { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.kwt { padding: 0.35rem 0.8rem; border-radius: 20px; font-weight: 700; font-size: 0.78rem !important; background: #FFFFFF; color: var(--ink); border: 1px solid var(--bd); white-space: nowrap; cursor: default; transition: opacity 0.2s; display: inline-flex; align-items: center; gap: 4px; }
.kwt:hover { background: #F3E8FF; }

.ali { display: flex; flex-direction: column; gap: 1rem; }
.ai { padding: 1.25rem; border-radius: 18px; display: flex; gap: 1rem; transition: 0.3s; background: #FFFFFF; border: 1px solid var(--bd); }
.ai.r { border-color: #fecaca; background: #fef2f2; }
.ai.y { border-color: #fef3c7; background: #fffbeb; }
.ai.g { border-color: #bbf7d0; background: #f0fdf4; }
.aidot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.ai.r .aidot { background: #e11d48; box-shadow: 0 0 6px rgba(225, 29, 72, 0.4); }
.ai.y .aidot { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.4); }
.ai.g .aidot { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
.ait { font-size: 0.88rem; color: var(--ink); line-height: 1.6; }
.ait strong { display: block; margin-bottom: 0.35rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink); opacity: 0.9; }

.hmg { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
.hmc { padding: 1.5rem; border-radius: 20px; color: var(--ink); text-align: center; background: #FFFFFF; border: 1px solid var(--bd); }
.hmc-c { font-size: 0.9rem; font-weight: 800; color: var(--mu); }
.hmc-s { font-size: 1.3rem; font-weight: 800; margin-top: 0.5rem; color: var(--p); }

.hi { padding: 1rem; border-bottom: 1px solid #F3E8FF; color: var(--ink); }
.hi:last-child { border-bottom: none; }
.hm2 { font-weight: 800; font-family: monospace; }
.hmok { color: #22c55e; }
.hmw { color: #ef4444; }

.spr2 { margin-top: auto; padding: 1.5rem; font-size: 0.62rem; color: var(--mu); line-height: 1.6; border-top: 1px solid #F3E8FF; }

@media (max-width: 900px) {
  .cl { flex-direction: column; }
  .csb { width: 100%; height: auto; border-bottom: 1px solid var(--bd); }
  .dg2, .dg3 { grid-template-columns: 1fr; }
  .hstats { gap: 1.5rem; }
}

/* MODALS - LAVENDER DREAM THEME */
.m-ov { position: fixed; inset: 0; background: rgba(110, 72, 170, 0.4); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
.m-cnt { 
  background: #FFFFFF; 
  border: 1px solid var(--bd); 
  border-radius: 32px; 
  width: 100%; 
  max-width: 600px; 
  max-height: 90vh; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
  box-shadow: 0 40px 100px rgba(110, 72, 170, 0.15);
  position: relative;
}
.m-cnt::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 120px; background: linear-gradient(to bottom, rgba(157, 80, 187, 0.05), transparent); pointer-events: none; }

.m-h { 
  padding: 2rem; 
  background: #FDFBFF;
  border-bottom: 1px solid #F3E8FF;
  display: flex; align-items: center; justify-content: space-between; 
}
.m-h h3 { font-size: 1.2rem; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
.m-close { background: #F3E8FF; border: none; color: var(--ink); font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
.m-close:hover { background: #fee2e2; color: #ef4444; }

.m-b { padding: 2.5rem; overflow-y: auto; flex: 1; color: var(--ink); }
.m-sec { margin-bottom: 2rem; }
.m-label { color: var(--ink); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem; display: block; margin-bottom: 1rem; }
.m-msg { background: #FDFBFF; border: 1px solid #F3E8FF; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; }
.m-emo { display: inline-block; padding: 0.3rem 0.7rem; background: #F3E8FF; border: 1px solid var(--bd); border-radius: 8px; font-size: 0.75rem; margin-right: 0.5rem; margin-bottom: 0.5rem; font-weight: 700; color: var(--ink); }

/* WELCOME BANNER */
.welcome-banner { 
  background: linear-gradient(135deg, var(--p) 0%, var(--pd) 100%); 
  padding: 3rem; border-radius: 30px; margin-bottom: 2.5rem; color: #fff;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 20px 40px rgba(110, 52, 138, 0.2); position: relative; overflow: hidden;
}
.welcome-banner::before {
  content: ''; position: absolute; top: -50px; right: -50px; width: 200px; height: 200px;
  background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(40px);
}
.welcome-content h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; }
.welcome-content p { font-size: 1.1rem; opacity: 0.9; max-width: 500px; line-height: 1.6; }
.welcome-stats { display: flex; gap: 3rem; margin-top: 2rem; }
.w-stat { display: flex; flex-direction: column; }
.w-val { font-size: 1.8rem; font-weight: 800; }
.w-lbl { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
.welcome-art { font-size: 6rem; opacity: 0.2; transform: rotate(15deg); }

/* NAV GRID */
.nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.nav-card { 
  background: #130820; color: #fff; padding: 1.8rem; border-radius: 24px; border: 1.5px solid var(--bd);
  cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; align-items: center; gap: 1.2rem; position: relative;
}
.nav-card:hover { 
  transform: translateY(-8px); border-color: var(--p);
  box-shadow: 0 15px 30px rgba(0,0,0,0.05);
}
.nav-card-icon { 
  width: 64px; height: 64px; border-radius: 18px; display: flex; 
  align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0;
}
.nav-card-info h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--ink); }
.nav-card-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); line-height: 1.5; }
.nav-card-arrow { 
  position: absolute; right: 1.8rem; top: 50%; transform: translateY(-50%);
  font-size: 1.2rem; color: var(--bd); transition: 0.3s; opacity: 0;
}
.nav-card:hover .nav-card-arrow { opacity: 1; transform: translate(5px, -50%); color: var(--p); }

/* PORTAL LAYOUT - PREMIUM ENHANCEMENT */
.dl-portal { 
  min-height: 100vh; 
  background: radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), 
              radial-gradient(at 100% 0%, rgba(217, 70, 239, 0.1) 0px, transparent 50%), 
              #130820;
  display: flex; flex-direction: column;
  position: relative; overflow-x: hidden;
  color: #fff;
}


.dl-portal::before {
  content: ''; position: absolute; top: 15%; left: -10%; width: 40vw; height: 40vw;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
  filter: blur(100px); z-index: 0; pointer-events: none;
}

.dm.full-width { 
  flex: 1; width: 100%; max-width: 1400px; margin: 0 auto !important; 
  padding: 3rem 6% !important; position: relative; z-index: 1;
  transition: all 0.4s ease;
}

/* PORTAL HEADER */
.dashboard-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.2rem 6%;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky; top: 0; z-index: 1000;
}
.admin-profile-pill {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: 0.3s;
}
.admin-profile-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}
.logout-btn-premium {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1.5px solid rgba(239, 68, 68, 0.4);
  padding: 8px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.3s;
  display: flex; align-items: center; gap: 8px;
}
.logout-btn-premium:hover {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.section-heading {
  font-size: 1.4rem; font-weight: 800; color: #fff;
  margin: 3rem 0 1.5rem; display: flex; align-items: center; gap: 12px;
}
.section-heading::before {
  content: ''; width: 4px; height: 24px; background: var(--p); border-radius: 10px;
}
.nav-card { 
  background: #130820; color: #fff; /* White cards on light background */
  padding: 1.8rem; border-radius: 28px; 
  border: 1px solid rgba(139, 92, 246, 0.1);
  cursor: pointer; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex; flex-direction: column; align-items: flex-start; gap: 1.4rem; position: relative;
  box-shadow: 0 10px 25px -10px rgba(139, 92, 246, 0.1);
  overflow: hidden;
}
.nav-card-info h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 0.4rem; color: #fff; }
.nav-card-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); line-height: 1.5; font-weight: 500; }


/* WELCOME BANNER - ILLUMINATE VERSION */
.welcome-banner { 
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%);
  background-size: 200% 200%;
  animation: meshGradient 12s ease infinite;
  padding: 2.5rem 3.5rem; border-radius: 35px; margin-bottom: 2.5rem; color: #fff;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 30px 60px -15px rgba(139, 92, 246, 0.35); position: relative; overflow: hidden;
}
@keyframes meshGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.welcome-banner::after {
  content: ''; position: absolute; bottom: -20%; right: -10%; width: 200px; height: 200px;
  background: rgba(255,255,255,0.08); border-radius: 50%; filter: blur(50px);
}
.welcome-content h1 { font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem; letter-spacing: -1px; }
.welcome-content p { font-size: 1rem; opacity: 0.9; max-width: 550px; line-height: 1.6; font-weight: 500; }
.welcome-stats { display: flex; gap: 3rem; margin-top: 1.8rem; }
.w-val { font-size: 1.8rem; font-weight: 900; text-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.w-lbl { font-size: 0.75rem; font-weight: 700; opacity: 0.8; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }

/* NAV GRID & CARDS - DARK MODE OPTIMIZED */
.nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.nav-card { 
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  padding: 1.8rem; border-radius: 28px; 
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex; flex-direction: column; align-items: flex-start; gap: 1.4rem; position: relative;
  box-shadow: 0 10px 25px -10px rgba(0,0,0,0.4);
  overflow: hidden;
}
.nav-card:hover { 
  transform: translateY(-12px) scale(1.02); 
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 35px 70px -15px rgba(0,0,0,0.6);
  border-color: var(--p);
}
.nav-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px;
  background: linear-gradient(90deg, transparent, var(--p), transparent);
  opacity: 0; transition: 0.4s;
}
.nav-card:hover::before { opacity: 1; }

.nav-card-icon { 
  width: 58px; height: 58px; border-radius: 20px; display: flex; 
  align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0;
  box-shadow: 0 10px 20px -6px rgba(0,0,0,0.4);
  transition: 0.5s;
}
.nav-card:hover .nav-card-icon { transform: rotate(-8deg) scale(1.1); }
.nav-card-info h3 { font-size: 1.15rem; font-weight: 800; margin-bottom: 0.4rem; color: #fff; }
.nav-card-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); line-height: 1.5; font-weight: 500; }

/* NAVIGATION ELEMENTS */
.p-back {
  background: rgba(255, 255, 255, 0.05); border: 1.5px solid rgba(255, 255, 255, 0.1); color: #fff;
  font-weight: 800; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s;
  font-size: 0.9rem; padding: 0.6rem 1.4rem; border-radius: 100px;
}
.p-back:hover { background: rgba(255, 255, 255, 0.1); border-color: #fff; transform: translateX(-5px); }

.p-logout-min {
  background: rgba(124, 58, 237, 0.1); border: 1.5px solid rgba(196, 181, 253, 0.3); color: #c4b5fd;
  padding: 8px 24px; border-radius: 100px; font-weight: 800; font-size: 0.82rem;
  cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 1.5px;
}
.p-logout-min:hover { background: #7c3aed; color: #fff; box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5); border-color: #7c3aed; }

/* ADDITIONAL POLISH */
.fa { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.spin-hover { display: inline-block; transition: 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.p-back:hover .spin-hover { transform: rotate(360deg); }

input, select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  transition: 0.3s;
}
input:focus, select:focus { border-color: var(--p); background: rgba(255, 255, 255, 0.08); }
select option { background: #1a0b2e; color: #fff; }
`;

export const adminAuthStyles = {
  root: {
    minHeight: "100vh",
    background: "transparent",
    display: "flex",
    fontFamily: "'Inter', 'Georgia', serif",
    position: "relative",
    overflow: "hidden",
  },
  bgOrbs: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  leftPanel: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center", /* Center contents for balance */
    textAlign: "center",
    padding: "60px 64px",
    position: "relative",
    zIndex: 1,
  },
  brandMark: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "30px",
  },
  logoRing: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: `2px solid #7c3aed`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(124,58,237,0.1)",
    boxShadow: `0 0 20px rgba(124,58,237,0.25)`,
  },
  brandName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "26px",
    fontWeight: "900",
    letterSpacing: "1px",
    color: "var(--ink)",
    textTransform: "uppercase",
  },
  adminBadge: {
    fontSize: "11px",
    letterSpacing: "3px",
    color: "rgba(168, 85, 247, 0.7)",
    textTransform: "uppercase",
    fontFamily: "'Outfit', sans-serif",
    marginTop: "2px",
    fontWeight: "800",
  },
  headline: {
    fontSize: "42px",
    fontWeight: "700",
    lineHeight: "1.2",
    color: "var(--ink)",
    marginBottom: "20px",
    fontFamily: "'Georgia', serif",
  },
  headlineAccent: {
    color: "#c084fc",
    display: "block",
  },
  subtext: {
    fontSize: "16px",
    color: "var(--mu)",
    lineHeight: "1.7",
    maxWidth: "380px",
    fontFamily: "Georgia, serif",
  },
  featureList: {
    marginTop: "48px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  featureDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#a855f7",
    flexShrink: 0,
    boxShadow: `0 0 8px #a855f788`,
  },
  featureText: {
    fontSize: "14px",
    color: "var(--mu)",
    letterSpacing: "0.3px",
  },
  dividerLine: {
    position: "absolute",
    top: "10%",
    right: "0",
    width: "1px",
    height: "80%",
    background: `linear-gradient(to bottom, transparent, rgba(124,58,237,0.3), transparent)`,
  },
  rightPanel: {
    flex: "1 1 50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 48px",
    position: "relative",
    zIndex: 1,
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#FFFFFF",
    border: `1px solid var(--bd)`,
    borderRadius: "32px",
    padding: "40px 36px",
    backdropFilter: "blur(30px)",
    boxShadow: `0 40px 100px rgba(110, 72, 170, 0.08)`,
  },
  tabRow: {
    display: "flex",
    gap: "0",
    marginBottom: "32px",
    background: "rgba(0,0,0,0.3)",
    borderRadius: "10px",
    padding: "3px",
  },
  tab: (active) => ({
    flex: 1,
    padding: "9px 0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "Georgia, serif",
    transition: "all 0.25s",
    background: active ? `linear-gradient(135deg, #7c3aed, #a855f7)` : "transparent",
    color: active ? "#fff" : "var(--mu)",
    boxShadow: active ? `0 4px 16px rgba(124, 58, 237, 0.35)` : "none",
  }),
  label: {
    display: "block",
    fontSize: "11px",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "rgba(192, 132, 252, 0.7)",
    marginBottom: "8px",
    fontFamily: "Georgia, serif",
  },
  input: {
    width: "100%",
    background: "#FFFFFF",
    border: `1px solid var(--bd)`,
    borderRadius: "10px",
    padding: "13px 16px",
    fontSize: "14px",
    color: "var(--ink)",
    outline: "none",
    fontFamily: "Georgia, serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,0.25)",
    fontSize: "14px",
    pointerEvents: "none",
  },
  forgotLink: {
    display: "block",
    textAlign: "right",
    fontSize: "12px",
    color: "rgba(212,175,55,0.65)",
    cursor: "pointer",
    marginTop: "6px",
    letterSpacing: "0.3px",
    fontFamily: "Georgia, serif",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: `linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)`,
    border: "none",
    borderRadius: "10px",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    cursor: "pointer",
    marginTop: "8px",
    fontFamily: "Georgia, serif",
    transition: "all 0.25s",
    boxShadow: `0 8px 32px rgba(124, 58, 237, 0.25)`,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "24px 0",
  },
  dividerBar: {
    flex: 1,
    height: "0.5px",
    background: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "Georgia, serif",
  },
  secureNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "28px",
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.5px",
    fontFamily: "Georgia, serif",
  },
  shieldIcon: {
    width: "13px",
    height: "13px",
    flexShrink: 0,
  },
  errorBox: {
    background: "rgba(220,50,50,0.1)",
    border: "0.5px solid rgba(220,50,50,0.4)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "#ff8080",
    marginBottom: "20px",
    fontFamily: "Georgia, serif",
  },
  successBox: {
    background: "rgba(50,200,100,0.1)",
    border: "0.5px solid rgba(50,200,100,0.4)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "#80ffaa",
    marginBottom: "20px",
    fontFamily: "Georgia, serif",
  },
};


