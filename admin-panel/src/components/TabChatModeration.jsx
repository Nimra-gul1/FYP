import { useEffect, useRef, useState, useMemo } from "react";
import { API_BASE } from "../utils/constants.js";

const BAD_LANGUAGE_REGEX = /fuck|shit|bitch|ass|damn|bastard|idiot|stupid|loser|hate you|kill|die|useless|worthless/i;
const SELF_HARM_REGEX = /suicid|end my life|want to die|kill myself|self.harm|cut myself|hurt myself|no point living|hopeless/i;
const JAILBREAK_REGEX = /ignore all previous|jailbreak|act as|pretend you are|system prompt|bypass|disregard|new persona/i;
const DISTRESS_REGEX = /hopeless|helpless|i give up|can't go on|nobody cares|feel empty|numb|trapped/i;

function classifyMessage(text) {
  if (!text) return null;
  if (SELF_HARM_REGEX.test(text)) return { label: "Critical Distress", color: "#ef4444", bg: "#fee2e2", icon: "🚨" };
  if (JAILBREAK_REGEX.test(text)) return { label: "System Breach", color: "#f59e0b", bg: "#fef3c7", icon: "🔓" };
  if (BAD_LANGUAGE_REGEX.test(text)) return { label: "Policy Violation", color: "#f97316", bg: "#ffedd5", icon: "🤬" };
  if (DISTRESS_REGEX.test(text)) return { label: "High Sensitivity", color: "#9333ea", bg: "#f3e8ff", icon: "💜" };
  return null;
}

export function TabChatModeration({ users, liveFeed = [], handleUserAction }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [searchId, setSearchId] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  const ADMIN_TOKEN = localStorage.getItem("qb_tok");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Real-time message syncing
  useEffect(() => {
    if (!selectedUser) return;
    
    // Find any NEW messages in liveFeed for this user that aren't in chatHistory
    const userMessages = liveFeed.filter(f => 
      f.userId === selectedUser._id && 
      f.type === "message"
    );

    if (userMessages.length > 0) {
      setChatHistory(prev => {
        // Simple deduplication by timestamp/text
        const existingTexts = new Set(prev.map(m => m.text));
        const newMessages = userMessages
          .filter(m => !existingTexts.has(m.text))
          .map(m => ({
            sender: 'user',
            text: m.text,
            createdAt: m.ts || new Date()
          }));
        
        if (newMessages.length === 0) return prev;
        return [...prev, ...newMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    }
  }, [liveFeed, selectedUser]);

  const openUserChat = async (u) => {
    setSelectedUser(u);
    setChatHistory([]);
    setLoadingChat(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${u._id}/details`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      const data = await res.json();
      setChatHistory(data.messages || []);
    } catch {
      setChatHistory([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const blockUser = async () => {
    if (!selectedUser) return;
    setIsBlocking(true);
    
    try {
      const recent = selectedUser.lastSentiment || "";
      const flag = classifyMessage(recent);
      const autoReason = flag ? `Auto-Detected: ${flag.label} - System protected` : "Automated Safety Protocol Violation";
      
      await handleUserAction(selectedUser._id, "block", { reason: autoReason });
      setSelectedUser(prev => ({ ...prev, status: "Blocked" }));
    } finally {
      setIsBlocking(false);
    }
  };

  const enrichedUsers = useMemo(() => {
    return users.map(u => {
      const liveActivity = liveFeed
        .filter(f => f.userId === u._id && (f.type === "message" || f.type === "crisis"))
        .sort((a, b) => new Date(b.ts) - new Date(a.ts))[0];
      
      return {
        ...u,
        lastSentiment: liveActivity ? liveActivity.text : u.lastSentiment
      };
    });
  }, [users, liveFeed]);

  const filteredUsers = enrichedUsers
    .filter(u => u.role !== "admin")
    .filter(u => !searchId || String(u._id).toLowerCase().includes(searchId.toLowerCase()) || (u.email && u.email.toLowerCase().includes(searchId.toLowerCase())))
    .filter(u => {
      if (filterCat === "all") return true;
      const recent = u.lastSentiment || "";
      if (filterCat === "self-harm") return SELF_HARM_REGEX.test(recent);
      if (filterCat === "jailbreak") return JAILBREAK_REGEX.test(recent);
      if (filterCat === "bad-lang") return BAD_LANGUAGE_REGEX.test(recent);
      if (filterCat === "distress") return DISTRESS_REGEX.test(recent);
      if (filterCat === "blocked") return u.status === "Blocked";
      return true;
    });

  return (
    <div className="fa" style={{ padding: '0 1rem' }}>
      {/* COMPACT GLOBAL HEADER */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        background: '#FFFFFF',
        padding: '1.2rem 2.5rem',
        borderRadius: '100px', // Pill style
        boxShadow: '0 8px 30px rgba(110, 72, 170, 0.05)',
        border: '1px solid #D7BDE2'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#4A235A", margin: 0, letterSpacing: '-0.5px' }}>MODERATION HUB</h2>
          </div>
          <div style={{ height: '24px', width: '1px', background: '#D7BDE2' }}></div>
          <p style={{ color: "#884EA0", fontWeight: 700, fontSize: '0.75rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Live Intercept Active
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search Subject ID..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              style={{
                padding: "0.5rem 1rem 0.5rem 2.5rem",
                borderRadius: "100px",
                background: '#FDFBFF',
                border: "1px solid #D7BDE2",
                color: '#4A235A',
                fontSize: "0.8rem",
                fontWeight: 600,
                width: "200px",
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', opacity: 0.5 }}>🔍</span>
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            style={{
              padding: "0.5rem 1rem", 
              borderRadius: "100px",
              background: '#FFFFFF',
              border: "1px solid #D7BDE2",
              color: '#4A235A',
              fontSize: "0.8rem",
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <option value="all">Security Filter: All</option>
            <option value="self-harm">Critical Distress</option>
            <option value="bad-lang">Violations</option>
            <option value="jailbreak">Integrity</option>
            <option value="distress">Mood Drop</option>
          </select>
        </div>
      </div>

      {/* NEW: Safety Sentinel Monitor (Fills the "Empty" look) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        background: 'rgba(243, 232, 255, 0.3)',
        padding: '1rem',
        borderRadius: '24px',
        border: '1px dashed #D7BDE2'
      }}>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '18px', border: '1px solid #F3E8FF', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase', marginBottom: '4px' }}>Global Risk Level</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>STABLE</div>
        </div>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '18px', border: '1px solid #F3E8FF', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase', marginBottom: '4px' }}>Active Intercepts</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4A235A' }}>{users.filter(u => u.status === 'Active').length}</div>
        </div>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '18px', border: '1px solid #F3E8FF', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase', marginBottom: '4px' }}>Policy Flags</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b' }}>
            {enrichedUsers.filter(u => classifyMessage(u.lastSentiment)).length}
          </div>
        </div>
        <div style={{ padding: '1rem', background: '#fff', borderRadius: '18px', border: '1px solid #F3E8FF', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase', marginBottom: '4px' }}>Access Revoked</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444' }}>{users.filter(u => u.status === 'Blocked').length}</div>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: selectedUser ? "320px 1fr" : "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "1.5rem", 
        alignItems: "start"
      }}>

        {/* User Sidebar / Grid */}
        <div style={{ 
          display: selectedUser ? "flex" : "grid", 
          flexDirection: selectedUser ? "column" : "none",
          gridTemplateColumns: selectedUser ? "none" : "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.2rem", 
          maxHeight: "78vh", 
          overflowY: "auto", 
          padding: '4px' 
        }} className="custom-scroll">
          {filteredUsers.length === 0 ? (
            <>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  padding: "1.2rem",
                  background: "#FFFFFF",
                  border: "1px dashed #D7BDE2",
                  borderRadius: "20px",
                  opacity: 0.3,
                  display: "flex",
                  flexDirection: 'column',
                  gap: "0.8rem"
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3E8FF' }}></div>
                    <div style={{ height: '10px', width: '60px', background: '#F3E8FF', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ height: '30px', background: '#FDFBFF', borderRadius: '10px', border: '1px solid #F3E8FF' }}></div>
                </div>
              ))}
              <div style={{ 
                gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', 
                background: 'rgba(255,255,255,0.5)', borderRadius: '24px', border: '1px solid #D7BDE2'
              }}>
                <h3 style={{ color: '#4A235A', fontWeight: 900, margin: 0, fontSize: '1rem' }}>SCANNING FOR LIVE TRAFFIC</h3>
                <p style={{ color: '#884EA0', fontWeight: 600, fontSize: '0.7rem', margin: '5px 0 0' }}>The monitoring grid is active and searching for intercepted sessions.</p>
              </div>
            </>
          ) : (
            filteredUsers.map(u => {
              const flag = classifyMessage(u.lastSentiment);
              const isSelected = selectedUser?._id === u._id;
              return (
                <div
                  key={u._id}
                  onClick={() => openUserChat(u)}
                  style={{
                    padding: "1.2rem",
                    background: isSelected ? 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 100%)' : "#FFFFFF",
                    border: flag ? `2px solid ${flag.color}` : (isSelected ? "2px solid #9D50BB" : "1px solid #D7BDE2"),
                    borderRadius: "20px",
                    cursor: "pointer",
                    transition: "0.2s",
                    display: "flex",
                    flexDirection: 'column',
                    gap: "0.8rem",
                    boxShadow: isSelected ? '0 10px 30px rgba(157, 80, 187, 0.1)' : '0 4px 12px rgba(110, 72, 170, 0.03)',
                    animation: flag ? 'pulse-border 2s infinite' : 'none'
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: isSelected ? '#9D50BB' : '#F3E8FF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.9rem', fontWeight: 900, color: isSelected ? '#fff' : '#9D50BB'
                      }}>
                        {String(u._id).slice(-2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 900, color: "#4A235A", fontSize: "0.85rem" }}>
                          USER-{String(u._id).slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 900, textTransform: 'uppercase',
                      padding: '3px 6px', borderRadius: '6px',
                      background: u.status === "Active" ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: u.status === "Active" ? '#10b981' : '#ef4444',
                    }}>
                      {u.status || "Away"}
                    </span>
                  </div>

                  <div style={{ 
                    fontSize: "0.75rem", color: "#4A5568", lineHeight: 1.4,
                    padding: '0.6rem', background: '#FDFBFF', borderRadius: '10px',
                    border: '1px solid #F3E8FF', fontStyle: 'italic',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    "{u.lastSentiment || "Monitoring..."}"
                  </div>

                  {flag && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px',
                      background: flag.bg, border: `1px solid ${flag.color}33`, color: flag.color,
                      fontSize: '0.6rem', fontWeight: 900, alignSelf: 'flex-start'
                    }}>
                      <span>{flag.icon}</span> {flag.label}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Chat Inspector - COMPACT Header */}
        {selectedUser && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #D7BDE2',
            borderRadius: '32px',
            height: '78vh',
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: '0 20px 60px rgba(110, 72, 170, 0.1)'
          }}>
            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #F3E8FF', background: '#FDFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#4A235A', textTransform: 'uppercase' }}>Session Stream</h3>
                <div style={{ padding: '4px 8px', background: '#f0fdf4', color: '#10b981', fontSize: '0.6rem', fontWeight: 900, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></div> LIVE
                </div>
                <div style={{ fontSize: '0.7rem', color: '#884EA0', fontWeight: 800, background: '#F3E8FF', padding: '4px 10px', borderRadius: '6px' }}>
                  ID: {selectedUser._id}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={blockUser}
                  disabled={isBlocking || selectedUser.status === "Blocked"}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '10px', border: 'none',
                    background: selectedUser.status === "Blocked" ? '#F3E8FF' : '#ef4444',
                    color: selectedUser.status === "Blocked" ? '#884EA0' : '#fff',
                    fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer'
                  }}
                >
                  {selectedUser.status === "Blocked" ? "RESTRICTED" : "TERMINATE"}
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: '#F3E8FF', border: '1px solid #D7BDE2', color: '#4A235A', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                >CLOSE</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }} className="custom-scroll">
              {loadingChat ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '15px' }}>
                  <div className="spin" style={{ width: '20px', height: '20px', border: '2px solid #F3E8FF', borderTopColor: '#9D50BB' }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#884EA0', fontWeight: 800 }}>RETRIEVING...</span>
                </div>
              ) : chatHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#884EA0', fontWeight: 700 }}>Awaiting traffic for this session.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {chatHistory.map((msg, i) => {
                    const flag = classifyMessage(msg.text);
                    const isUser = msg.sender === 'user';
                    return (
                      <div key={i} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '4px', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.6rem', color: isUser ? '#9D50BB' : '#4A235A', fontWeight: 900 }}>{isUser ? 'CLIENT' : 'SYSTEM'}</span>
                          <span style={{ fontSize: '0.55rem', color: '#884EA0', fontWeight: 600 }}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div style={{
                          padding: '0.8rem 1.2rem',
                          background: isUser ? (flag ? flag.bg : '#F3E8FF') : '#FFFFFF',
                          border: `1px solid ${isUser && flag ? flag.color : '#F3E8FF'}`,
                          borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                          color: '#1a1a1a', fontSize: '0.85rem', lineHeight: 1.5, position: 'relative',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}>
                          {flag && isUser && (
                            <div style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '0.55rem', padding: '2px 8px', background: flag.color, color: '#fff', fontWeight: 900, borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                              {flag.label.toUpperCase()}
                            </div>
                          )}
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse-border {
          0% { border-color: inherit; }
          50% { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
          100% { border-color: inherit; }
        }
      `}</style>
    </div>
  );
}
