import React from "react";
import { OrbBg } from "./DashboardComponents.jsx";

export function AuthPage({
  page,
  lMode,
  setLMode,
  lErr,
  setLErr,
  lSuccess,
  setLSuccess,
  lForm,
  focusedField,
  setFocusedField,
  lBusy,
  handleAdminAuthSubmit,
  handleInput,
}) {
  const primaryColor = "#FFFFFF"; 

  const getInputStyle = (field) => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: "14px",
    border: `1px solid ${focusedField === field ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
    background: "rgba(255, 255, 255, 0.05)",
    color: "#FFFFFF",
    fontSize: "0.9rem",
    fontWeight: 500,
    outline: "none",
    transition: "0.3s",
    backdropFilter: "blur(10px)",
  });

  return (
    <div className={`pg ${page === "login" ? "on" : ""}`} style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5000,
      overflow: 'hidden',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <OrbBg />
      
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        
        {/* LEFT PANEL */}
        <div style={{
          flex: '1.4',
          padding: '40px 8%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
            }}>
              🛡️
            </div>
            <div style={{ fontFamily: "'Scheherazade New', serif", fontSize: '1.4rem', color: '#FFFFFF' }}>
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '20px', height: '2px', background: 'rgba(255,255,255,0.4)' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '3px' }}>
              Qalbify Executive
            </span>
          </div>

          <h1 style={{ 
            fontSize: '3.4rem', fontWeight: 900, color: '#FFFFFF', 
            lineHeight: 1.1, marginBottom: '2.5rem', letterSpacing: '-2px'
          }}>
            Guided by Wisdom,<br/>
            <span style={{ opacity: 0.6 }}>Powered by Care.</span>
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: '1rem' }}>
            {[
              { label: 'Live Metrics', sub: 'Emotional trends', icon: '📊' },
              { label: 'AI Guardrails', sub: 'Quranic alignment', icon: '📜' },
              { label: 'Crisis Hub', sub: 'Rapid response', icon: '🚨' },
              { label: 'Audit Logs', sub: 'Secure history', icon: '🔐' }
            ].map((f, i) => (
              <div key={i} style={{
                padding: '1.1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '22px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: '0.3s'
              }}>
                <div style={{ fontSize: '1.3rem' }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#FFFFFF' }}>{f.label}</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingRight: '4%'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(50px)',
            borderRadius: '40px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '50px 45px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
          }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-1px' }}>Welcome Back</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 500 }}>
                System Access Protocol Required
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                Admin Identifier
              </label>
              <input
                type="email"
                placeholder="admin@qalbify.com"
                style={getInputStyle("email")}
                value={lForm.email}
                onChange={handleInput("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            <div style={{ marginBottom: '35px' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                Security Key
              </label>
              <input
                type="password"
                placeholder="••••••••"
                style={getInputStyle("password")}
                value={lForm.password}
                onChange={handleInput("password")}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {lErr && (
              <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.15)', color: '#FF4D4D', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '25px', textAlign: 'center' }}>
                {lErr}
              </div>
            )}

            <button
              onClick={handleAdminAuthSubmit}
              disabled={lBusy}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '18px',
                background: '#FFFFFF',
                color: '#130820',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              {lBusy ? "VALIDATING..." : "Establish Secure Session"}
            </button>

            <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.65rem', color: '#FFFFFF', fontWeight: 800, letterSpacing: '1.5px' }}>
              QALBIFY SECURE PROTOCOL v1.2
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
