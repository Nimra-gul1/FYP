import React, { useMemo } from "react";
import { adminAuthStyles } from "../utils/constants.js";

export function OrbBg() {
  return (
    <div className="bg-container">
      <div className="noise-overlay"></div>
      <div className="stars-layer"></div>
      <div className="nebula-layer"></div>
      <div className="mesh-gradient"></div>
      <style>{`
        .bg-container {
          position: fixed; inset: 0; z-index: -1;
          background: linear-gradient(to right, #6b52ae, #9452a5);
          overflow: hidden;
        }
        .mesh-gradient {
          position: absolute; inset: -20%;
          background: 
            radial-gradient(at 10% 10%, rgba(124, 58, 237, 0.35) 0, transparent 40%),
            radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.3) 0, transparent 40%),
            radial-gradient(at 20% 80%, rgba(56, 189, 248, 0.25) 0, transparent 40%),
            radial-gradient(at 90% 90%, rgba(192, 132, 252, 0.3) 0, transparent 40%),
            radial-gradient(at 50% 50%, rgba(30, 27, 75, 0.5) 0, transparent 60%);
          filter: blur(100px);
          animation: meshMove 20s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
          opacity: 0.8;
        }
        @keyframes meshMove {
          0% { transform: scale(1) rotate(0deg) translate(0, 0); }
          50% { transform: scale(1.15) rotate(10deg) translate(-5%, 5%); }
          100% { transform: scale(1) rotate(-10deg) translate(5%, -5%); }
        }
        .nebula-layer {
          position: absolute; inset: 0;
          background: 
            radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 30% 70%, rgba(56, 189, 248, 0.1) 0%, transparent 50%);
          mix-blend-mode: screen;
          animation: nebulaPulse 12s infinite alternate ease-in-out;
        }
        @keyframes nebulaPulse {
          from { opacity: 0.4; transform: scale(1) rotate(0deg); }
          to { opacity: 0.7; transform: scale(1.3) rotate(5deg); }
        }
        .noise-overlay {
          position: absolute; inset: 0; opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 5;
        }
        .stars-layer {
          position: absolute; inset: 0;
          background-image: 
            radial-gradient(1.5px 1.5px at 15% 15%, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 35% 65%, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 55% 25%, #fff, rgba(0,0,0,0)),
            radial-gradient(2.5px 2.5px at 85% 45%, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 95% 85%, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 25% 95%, #fff, rgba(0,0,0,0));
          background-size: 350px 350px;
          opacity: 0.4;
          animation: twinkle 4s infinite alternate ease-in-out;
          z-index: 1;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: translateY(0) scale(1); }
          50% { opacity: 0.7; transform: translateY(-8px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export const Sparkline = ({ data = [], color = "#9D50BB" }) => {
  if (!data || data.length < 2) return <div className="sl-c" style={{ borderBottom: `1px solid ${color}22` }} />;
  
  const id = useMemo(() => `grad-${Math.random().toString(36).substr(2, 9)}`, []);
  const width = 100;
  const height = 40;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d - min) / range) * height * 0.8 - (height * 0.1)
  }));
  
  const pathData = `M ${points[0].x} ${points[0].y} ` + 
    points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    
  const fillData = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="sl-c">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillData} fill={`url(#${id})`} />
        <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const LiveActivityFeed = ({ items = [] }) => (
  <div className="lfs">
    {items.length === 0 ? <p style={{ fontSize: "0.8rem", color: "#999" }}>Waiting for activity...</p> : 
      items.map((item, i) => (
        <div key={i} className="lfi">
          <div className="lfi-ic" style={{ 
            background: item.type === "crisis" ? "rgba(239,68,68,0.15)" : 
                       item.type === "verse" ? "rgba(201,162,51,0.15)" : 
                        item.type === "emotion" ? "rgba(109,52,138,0.15)" : 
                        item.type === "auth" ? "rgba(16,185,129,0.15)" :
                        item.type === "message" ? "rgba(59,130,246,0.15)" : "rgba(100,116,139,0.1)",
             color: item.type === "crisis" ? "var(--er)" : 
                   item.type === "verse" ? "var(--go)" : 
                   item.type === "emotion" ? "var(--pd)" : 
                   item.type === "auth" ? "#10b981" :
                   item.type === "message" ? "#3b82f6" : "#64748b"
          }}>
            {item.type === "message" ? "💬" : item.type === "crisis" ? "🚨" : item.type === "verse" ? "📖" : item.type === "emotion" ? "🎭" : item.type === "auth" ? "" : "⚙️"}
          </div>
          <div className="lfi-tx">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                padding: '2px 6px', 
                borderRadius: '4px',
                background: item.type === "crisis" ? "var(--er)" : 
                           item.type === "verse" ? "var(--go)" : 
                           item.type === "emotion" ? "var(--pd)" : 
                           item.type === "auth" ? "#10b981" :
                           item.type === "message" ? "#3b82f6" : "#64748b",
                color: '#fff'
              }}>
                {item.type.toUpperCase()}
              </span>
              <span style={{ fontWeight: 600, fontSize: "0.75rem", color: 'rgba(255,255,255,0.6)' }}>
                · {item.email || "Guest"}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#fff', lineHeight: '1.5' }}>
              {item.type === "verse" ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontStyle: 'italic', color: 'var(--go)', fontWeight: 600 }}>{item.verseRef}</span>
                  {item.emotion && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--mu)', fontWeight: 500 }}>
                      Triggered by: <span style={{ color: 'var(--pd)' }}>{item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)}</span>
                    </span>
                  )}
                </div>
              ) : item.type === "emotion" ? (
                <span>Detected Emotion: <strong>{item.emotion}</strong></span>
              ) : item.type === "auth" ? (
                <span style={{ color: '#10b981', fontWeight: 600 }}>{item.action || "System Access"}</span>
              ) : (
                item.text || "Activity detected"
              )}
            </div>
            <div className="lfi-ts">
              <span style={{ marginRight: '6px' }}>{new Date(item.ts).toLocaleDateString()}</span>
              <span>{new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      ))
    }
  </div>
);

export const KeywordCloud = ({ words = [] }) => (
  <div className="kwc">
    {words.map((w, i) => (
      <div key={i} className="kwi fa" style={{ 
        fontSize: `${0.7 + (w.count / 10) * 0.5}rem`,
        opacity: 0.5 + (w.count / 10) * 0.5
      }}>
        {w.text}
      </div>
    ))}
  </div>
);

export function TabActivity({ liveFeed, filter, setFilter }) {
  const sortedFeed = [...liveFeed].sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const feedWithNoAuth = sortedFeed.filter(f => f.type !== 'auth');
  const filteredFeed = filter === "all" ? feedWithNoAuth : feedWithNoAuth.filter(f => f.type === filter);

  return (
    <div className="fa">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Real-time Activity Stream</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--ok)', fontWeight: 600 }}>
          <div className="odot" /> Live Connection Active
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { 
            label: 'Total Messages', 
            type: 'message', 
            count: liveFeed.filter(f => f.type === 'message').length, 
            color: '#3b82f6', 
            icon: '💬',
            latest: liveFeed.find(f => f.type === 'message')?.text || 'No messages yet'
          },
          { 
            label: 'Verses Shared', 
            type: 'verse', 
            count: liveFeed.filter(f => f.type === 'verse').length, 
            color: 'var(--go)', 
            icon: '📖',
            latest: liveFeed.find(f => f.type === 'verse')?.verseRef || 'No verses yet'
          },
          { 
            label: 'Emotions Tracked', 
            type: 'emotion', 
            count: liveFeed.filter(f => f.type === 'emotion').length, 
            color: 'var(--pd)', 
            icon: '🎭',
            latest: liveFeed.find(f => f.type === 'emotion')?.emotion || 'No emotions yet'
          }
        ].map(card => (
          <div 
            key={card.label} 
            onClick={() => setFilter(prev => prev === card.type ? "all" : card.type)}
            style={{ 
              background: filter === card.type ? `${card.color}12` : 'rgba(255,255,255,0.03)', 
              border: filter === card.type ? `2px solid ${card.color}` : '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '16px', 
              padding: '1.2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: filter === card.type ? `0 4px 12px ${card.color}20` : 'none',
              transform: filter === card.type ? 'translateY(-2px)' : 'none'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              {card.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{card.count}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--mu)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Latest: <span style={{ color: card.color, fontWeight: 600 }}>{card.latest}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filter !== "all" && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--mu)' }}>Filtering by: <strong>{filter.toUpperCase()}</strong></span>
          <button onClick={() => setFilter("all")} style={{ background: 'none', border: 'none', color: 'var(--p)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Clear Filter</button>
        </div>
      )}
      <div style={{ display: 'block' }}>
        <LiveActivityFeed items={filteredFeed} />
      </div>
    </div>
  );
}

export function TabAuth({ liveFeed }) {
  const authFeed = liveFeed.filter(f => f.type === 'auth').sort((a, b) => new Date(b.ts) - new Date(a.ts));
  
  return (
    <div className="fa">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>System Access Monitor</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
          <div className="odot" style={{ background: '#10b981' }} /> Security Channel Active
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', maxWidth: '420px', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#10b98115', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            🔑
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Recent Access Events</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{authFeed.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontWeight: 600 }}>
              Last: <span style={{ color: '#10b981', fontWeight: 800 }}>{authFeed[0]?.action || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.8rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 style={{ marginBottom: '1.2rem', color: '#fff', fontSize: '1rem', fontWeight: 800 }}>Access Log (Live)</h4>
        <LiveActivityFeed items={authFeed} />
      </div>
    </div>
  );
}

export function TabAI({ aiPerf = [] }) {
  const data = aiPerf.length ? aiPerf : [
    { label: "00:00", latency: 450, tokens: 120, cost: 0.0002 },
    { label: "04:00", latency: 520, tokens: 150, cost: 0.0003 },
    { label: "08:00", latency: 480, tokens: 90, cost: 0.0001 },
    { label: "12:00", latency: 610, tokens: 200, cost: 0.0004 },
    { label: "16:00", latency: 590, tokens: 180, cost: 0.0003 },
    { label: "20:00", latency: 490, tokens: 130, cost: 0.0002 },
  ];

  return (
    <div className="fa">
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>AI Performance & Latency</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 800 }}>Mean Latency (GPT-3.5)</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--p)' }}>523ms</div>
          <Sparkline data={[450, 520, 480, 610, 590, 490]} color="var(--p)" />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 800 }}>Daily Token Usage</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--go)' }}>42.8k</div>
          <Sparkline data={[120, 150, 90, 200, 180, 130]} color="var(--go)" />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 800 }}>Estimated Cost (USD)</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ok)' }}>$0.08</div>
          <Sparkline data={[0.0002, 0.0003, 0.0001, 0.0004, 0.0003, 0.0002]} color="var(--ok)" />
        </div>
      </div>
      
      <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.8rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.2rem', color: '#fff' }}>Provider Health</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px' }}>Provider</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Uptime</th>
              <th style={{ padding: '12px' }}>Requests</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px' }}>OpenAI (gpt-3.5-turbo)</td>
              <td style={{ padding: '12px' }}><span className="odot" /> Operational</td>
              <td style={{ padding: '12px' }}>99.98%</td>
              <td style={{ padding: '12px' }}>12,402</td>
            </tr>
            <tr>
              <td style={{ padding: '12px' }}>HuggingFace (DistilRoBERTa)</td>
              <td style={{ padding: '12px' }}><span className="odot" /> Operational</td>
              <td style={{ padding: '12px' }}>100%</td>
              <td style={{ padding: '12px' }}>8,912</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TabContent({ verses = [] }) {
  return (
    <div className="fa">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Quranic Content Manager</h2>
        <button className="ncta" style={{ borderRadius: '10px', padding: '0.5rem 1rem' }}>+ Add Verse</button>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '14px' }}>Reference</th>
              <th style={{ padding: '14px' }}>Emotion Tag</th>
              <th style={{ padding: '14px' }}>Translation (Snippet)</th>
              <th style={{ padding: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {verses.length ? verses.map((v, i) => (
               <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                 <td style={{ padding: '14px', fontWeight: 600 }}>{v.Surah} {v['Ayat no']}</td>
                 <td style={{ padding: '14px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f0f0f0', fontSize: '0.7rem' }}>{v.Emotion}</span></td>
                 <td style={{ padding: '14px', color: '#666' }}>{v.Translation.substring(0, 50)}...</td>
                 <td style={{ padding: '14px' }}>
                   <button style={{ border: 'none', background: 'none', color: 'var(--p)', cursor: 'pointer', fontWeight: 600, marginRight: '10px' }}>Edit</button>
                   <button style={{ border: 'none', background: 'none', color: 'var(--er)', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                 </td>
               </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No custom verses added yet. Standard DB in use.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const PulseStrip = ({ pulse = [] }) => {
  const sortedPulse = [...pulse].sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const text = sortedPulse.map(p => {
    if (p.type === "message") return `💬 User sent message: "${p.text}"`;
    if (p.type === "crisis") return `🚨 CRISIS ALERT: User in distress!`;
    if (p.type === "verse") return `📖 Quranic verse served: ${p.verseRef}`;
    if (p.type === "emotion") return `🎭 Emotion detected: ${p.emotion}`;
    return "";
  }).filter(t => t).join("  ·  ");

  const displayMsg = text || "Monitoring real-time systems... stable · no recent events";

  return (
    <div className="pls fa">
      <div className="pls-t">Today's Pulse</div>
      <div style={{ width: 1.5, height: 18, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
      <div className="pls-c">
        <div className="pls-m">{displayMsg}</div>
      </div>
    </div>
  );
};
