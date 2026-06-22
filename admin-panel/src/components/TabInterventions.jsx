import React, { useState } from "react";
import { createPortal } from "react-dom";

export function TabInterventions({ users, handleUserAction }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [insightView, setInsightView] = useState(null);
  const [filterProgress, setFilterProgress] = useState("all");
  const [filterGuidance, setFilterGuidance] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  const openGuidance = (u) => {
    setSelectedUser(u);
    setInstructions(u.customAiInstructions || "");
  };

  const saveGuidance = async () => {
    setIsSaving(true);
    try {
      await handleUserAction(selectedUser._id, "guidance", { instructions });
      setSelectedUser(null);
    } catch (e) {
      alert("Failed to save guidance: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter logic
  const interventionCandidates = users
    .filter(u => u.role !== "admin")
    .filter(u => {
      if (filterSearch) return String(u._id).toLowerCase().includes(filterSearch.toLowerCase());
      return true;
    })
    .filter(u => {
      if (filterProgress === "critical") return u.healingDescription?.includes("Critical") || u.healingDescription?.includes("Downward");
      if (filterProgress === "healing")  return u.healingDescription?.includes("Healing") || u.healingDescription?.includes("Upward");
      if (filterProgress === "stable")   return u.healingDescription?.includes("Stable");
      if (filterProgress === "monitoring") return !u.healingDescription || u.healingDescription === "Monitoring";
      return true;
    })
    .filter(u => {
      if (filterGuidance === "custom") return !!u.customAiInstructions;
      if (filterGuidance === "auto")   return !u.customAiInstructions;
      return true;
    });

  return (
    <div style={{ position: 'relative' }}>
      <div className="dh">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--ink)' }}>AI Guidance</h2>
          <p style={{ color: 'var(--mu)', fontWeight: 500 }}>Help and direct the AI for specific user needs</p>
        </div>
        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search User ID..."
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid var(--bd)', fontSize: '0.82rem', minWidth: '140px', background: '#FFFFFF', color: 'var(--ink)', fontWeight: 600 }}
          />
          <select
            value={filterProgress}
            onChange={e => setFilterProgress(e.target.value)}
            style={{
              padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid var(--bd)', fontSize: '0.82rem',
              background: filterProgress === 'critical' ? 'rgba(239,68,68,0.12)' : '#FFFFFF',
              color: filterProgress === 'critical' ? '#ff6b6b' : filterProgress === 'healing' ? '#51cf66' : '#9D50BB',
              fontWeight: 800,
              outline: 'none'
            }}
          >
            <option value="all">All Progress</option>
            <option value="critical">🚨 Critical / Downward</option>
            <option value="healing">✅ Healing / Upward</option>
            <option value="stable">〰 Stable</option>
            <option value="monitoring">👁 Monitoring</option>
          </select>
          <select
            value={filterGuidance}
            onChange={e => setFilterGuidance(e.target.value)}
            style={{
              padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid var(--bd)', fontSize: '0.82rem',
              background: filterGuidance === 'custom' ? 'rgba(157,80,187,0.12)' : '#FFFFFF',
              color: '#9D50BB',
              fontWeight: 800,
              outline: 'none'
            }}
          >
            <option value="all">All Guidance</option>
            <option value="custom">🛡️ Custom Instructions</option>
            <option value="auto">⚙️ Automatic Mode</option>
          </select>
          {(filterProgress !== 'all' || filterGuidance !== 'all' || filterSearch) && (
            <button
              className="p-back"
              style={{ padding: '0.55rem 1rem', fontSize: '0.78rem', color: '#9D50BB', borderColor: '#9D50BB' }}
              onClick={() => { setFilterProgress('all'); setFilterGuidance('all'); setFilterSearch(''); }}
            >
              ✕ Clear
            </button>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--mu)', fontWeight: 800 }}>
            {interventionCandidates.length} user{interventionCandidates.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="dg">
        <div className="dc" style={{ background: '#FFFFFF' }}>
          <h4 style={{ color: 'var(--pd)', fontWeight: 900 }}>Priority Support (High Distress)</h4>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Healing Progress</th>
                  <th>AI Guidance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interventionCandidates.length > 0 ? (
                  interventionCandidates.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 900, color: "var(--pd)", fontSize: '1rem' }}>
                        {String(u._id).slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: "0.7rem", fontWeight: 900, textTransform: 'uppercase', 
                          padding: '6px 12px', borderRadius: '10px',
                          background: u.status === "Active" ? 'rgba(34,197,94,0.12)' :
                                     u.status === "Monitoring" ? 'rgba(239,68,68,0.12)' :
                                     u.status === "Away" ? 'rgba(245,158,11,0.12)' : 
                                     u.status === "Verified" ? 'rgba(16,185,129,0.12)' : 
                                     'rgba(100,116,139,0.12)',
                          color: u.status === "Active" ? '#16a34a' :
                                 u.status === "Monitoring" ? '#dc2626' :
                                 u.status === "Away" ? '#d97706' : 
                                 u.status === "Verified" ? '#059669' : 
                                 '#64748b',
                          border: `1px solid ${u.status === "Active" ? 'rgba(34,197,94,0.2)' :
                                               u.status === "Monitoring" ? 'rgba(239,68,68,0.2)' :
                                               u.status === "Away" ? 'rgba(245,158,11,0.2)' : 
                                               u.status === "Verified" ? 'rgba(16,185,129,0.2)' : 
                                               'rgba(100,116,139,0.2)'}`,
                          display: 'inline-block'
                        }}>
                          {u.status || "Inactive"}
                        </span>
                      </td>
                      <td 
                        style={{ cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => setInsightView(u)}
                        title="Click to view full AI Insight"
                      >
                        {u.healingDescription || "Monitoring"}
                      </td>
                      <td>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            color: u.customAiInstructions ? 'var(--p)' : 'var(--mu)',
                            fontWeight: u.customAiInstructions ? 800 : 500,
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                          {u.customAiInstructions || "Automatic Mode"}
                        </div>
                      </td>
                      <td>
                        <button className="ab" onClick={() => openGuidance(u)}>
                          {u.customAiInstructions ? "📝 Change" : "🛡️ Guide AI"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--mu)' }}>
                      No users requiring immediate AI guidance.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS RENDERING VIA PORTAL */}
      {selectedUser && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0, 0, 0, 0.85)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 9999999,
            padding: '20px'
          }} 
          onClick={() => setSelectedUser(null)}
        >
          <div 
            style={{ 
              maxWidth: '540px', 
              width: '100%',
              backgroundColor: '#FFFFFF', 
              boxShadow: '0 50px 100px rgba(0,0,0,0.5)', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()} 
          >
            <div style={{ background: '#FFFFFF', padding: '1.5rem 2.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1a1a1a', margin: 0 }}>AI Guidance: {String(selectedUser._id).slice(-6).toUpperCase()}</h3>
                <div style={{ fontSize: '.8rem', fontWeight: 800, color: '#9D50BB', marginTop: '4px' }}>Administrative Behavior Override</div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.5rem', color: '#666' }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '2.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#1a1a1a', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', display: 'block', marginBottom: '1rem' }}>Custom System Instructions</label>
                <textarea 
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    padding: '1.2rem', 
                    borderRadius: '16px', 
                    border: '2px solid #f0f0f0',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    color: '#1a1a1a',
                    background: '#fafafa',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                  placeholder="Example: Adopt a gentle tone..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={saveGuidance} 
                  disabled={isSaving}
                  style={{ flex: 1, padding: '1.1rem', background: '#9D50BB', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem' }}
                >
                  {isSaving ? "Saving..." : "Apply AI Instructions"}
                </button>
                {selectedUser.customAiInstructions && (
                   <button 
                   onClick={() => { setInstructions(""); saveGuidance(); }} 
                   style={{ flex: 1, padding: '1.1rem', background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
                 >
                   Reset AI Mode
                 </button>
                )}
              </div>
              <p style={{ fontSize: '0.7rem', color: '#9D50BB', marginTop: '1.5rem', textAlign: 'center', fontWeight: 700 }}>
                CHANGES TAKE EFFECT IMMEDIATELY
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {insightView && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0, 0, 0, 0.8)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 9999999,
            padding: '20px'
          }} 
          onClick={() => setInsightView(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '450px', 
              width: '100%',
              backgroundColor: '#FFFFFF', 
              boxShadow: '0 50px 100px rgba(0,0,0,0.5)', 
              borderRadius: '24px', 
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Journey Context: {String(insightView._id).slice(-6).toUpperCase()}</h3>
              <button onClick={() => setInsightView(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ 
                  padding: '1.5rem', 
                  background: '#FDFBFF', 
                  borderRadius: '20px',
                  border: '1px solid #eee',
                  borderLeft: `5px solid ${insightView.healingDescription?.includes("Critical") || insightView.healingDescription?.includes("Downward") ? "#ef4444" : 
                    insightView.healingDescription?.includes("Healing") || insightView.healingDescription?.includes("Upward") ? "#10b981" : "#9D50BB"}`,
                  width: '100%'
              }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: '#884EA0', letterSpacing: '1px', display: 'block', marginBottom: '0.8rem' }}>
                      LATEST AI INSIGHT
                  </span>
                  <p style={{ fontSize: '1rem', color: '#1a1a1a', lineHeight: '1.6', fontWeight: 500, margin: 0 }}>
                      {insightView.healingInsight}
                  </p>
              </div>
              <button style={{ marginTop: '1.5rem', width: '100%', borderRadius: '12px', height: '48px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#9D50BB', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => { const u = insightView; setInsightView(null); openGuidance(u); }}>
                  🛡️ Guide AI Based on Insight
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
