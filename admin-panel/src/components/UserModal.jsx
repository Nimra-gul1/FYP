import React from "react";

export function UserModal({ selUser, setSelUser }) {
  if (!selUser) return null;

  const isBlocked = selUser.status === "Blocked";
  // Sort messages chronologically for proof reading
  const sortedMessages = selUser.messages ? [...selUser.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : [];

  return (
    <div className="m-ov fa" onClick={() => setSelUser(null)}>
      <div className="m-cnt" style={{ 
        background: isBlocked ? 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #FDFBFF 100%)',
        boxShadow: '0 50px 100px rgba(0, 0, 0, 0.2)',
        border: `2px solid ${isBlocked ? '#ef4444' : 'var(--bd)'}`,
        borderRadius: '32px',
        overflow: 'hidden',
        maxWidth: '700px'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* MODAL HEADER */}
        <div className="m-h" style={{ 
          borderBottom: '1px solid #eee', 
          padding: '2rem 2.5rem',
          background: isBlocked ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: isBlocked ? "#C53030" : "var(--ink)", letterSpacing: '-0.5px' }}>
              {isBlocked ? "🛡️ Forensic Evidence Log" : "User Monitoring Detail"}
            </h3>
            <div style={{ fontSize: ".75rem", color: isBlocked ? "#E53E3E" : "var(--mu)", fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>
              {isBlocked ? "Official Restriction Records" : "Spiritual Journey Tracking"}
            </div>
          </div>
          <button style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '2.5rem', 
            color: '#aaa', 
            cursor: 'pointer',
            lineHeight: 0
          }} onClick={() => setSelUser(null)}>
            &times;
          </button>
        </div>

        <div className="m-b" style={{ padding: '2.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* USER INFO STRIP */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', padding: '1rem', background: '#F8F9FA', borderRadius: '16px', border: '1px solid #eee' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Account Identifier</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ink)' }}>{String(selUser.id).slice(-8).toUpperCase()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Account Status</div>
              <span style={{ 
                padding: '6px 14px', borderRadius: '100px', 
                background: isBlocked ? '#FEE2E2' : '#E0F2FE', 
                color: isBlocked ? '#DC2626' : '#0284C7',
                fontSize: '0.8rem', fontWeight: 900
              }}>
                {selUser.status}
              </span>
            </div>
          </div>

          {/* BLOCK EVIDENCE & TIMESTAMP */}
          {isBlocked && (
            <>
              {selUser.blockEvidence && (
                <div style={{ 
                  padding: '1.5rem', background: '#FFF5F5', 
                  borderRadius: '20px', border: '1px solid #FED7D7',
                  borderLeft: '6px solid #ef4444',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Violation Evidence (Actual Message)</div>
                  <div style={{ fontSize: '1.2rem', color: '#B91C1C', fontWeight: 900, fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{selUser.blockEvidence}"
                  </div>
                </div>
              )}

              {selUser.blockedAt && (
                <div style={{ marginBottom: '2.5rem', fontSize: '0.8rem', color: '#E53E3E', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                   🔒 Account Restricted: {new Date(selUser.blockedAt).toLocaleString()}
                </div>
              )}
            </>
          )}

          {/* CHAT EVIDENCE */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Chat Evidence History
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mu)' }}>
                Showing last {sortedMessages.length} interactions
              </span>
            </div>

            {sortedMessages.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedMessages.map((m, i) => (
                  <div key={i} style={{ 
                    padding: '1.2rem', 
                    background: '#FFFFFF', 
                    border: '1px solid #F3E8FF', 
                    borderRadius: '16px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9D50BB' }}>USER MESSAGE</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#aaa' }}>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#1a1a1a', fontWeight: 500, lineHeight: 1.6 }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#F8F9FA', borderRadius: '20px', border: '1px dashed #ddd', color: '#999', fontWeight: 600 }}>
                No recorded chat history available for this identifier.
              </div>
            )}
          </div>

          {/* EMOTIONAL TRIGGERS */}
          <div>
             <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '1rem' }}>
                Detected Emotional Triggers
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {selUser.emotions?.length > 0 ? (
                  [...new Set(selUser.emotions.map((e) => e.emotion))]
                    .filter(em => em && typeof em === "string")
                    .map((em, i) => (
                      <span key={i} style={{ 
                        padding: '8px 16px', background: '#F3E8FF', color: '#9D50BB', 
                        borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800,
                        textTransform: 'capitalize'
                      }}>
                        {em}
                      </span>
                    ))
                ) : (
                  <span style={{ color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic' }}>No emotional indicators recorded.</span>
                )}
              </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ 
          padding: '1.5rem 2.5rem', background: '#FDFBFF', borderTop: '1px solid #eee', 
          textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 600 }}>Official Qalbify Forensic Audit v1.0</span>
          <button 
            onClick={() => setSelUser(null)}
            style={{ 
              padding: '12px 30px', background: 'var(--pd)', color: '#fff', 
              border: 'none', borderRadius: '12px', fontWeight: 900, 
              cursor: 'pointer', boxShadow: '0 5px 15px rgba(110, 72, 170, 0.2)' 
            }}
          >
            DISMISS LOG
          </button>
        </div>
      </div>
    </div>
  );
}
