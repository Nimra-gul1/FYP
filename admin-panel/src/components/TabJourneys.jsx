import React from "react";

export function TabJourneys({ users, userFilters, setUserFilters, handleUserAction, fetchAdminData }) {
  return (
    <>
      <div className="dh">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--ink)' }}>User Journeys</h2>
          <p style={{ color: 'var(--mu)', fontWeight: 500 }}>Healing trajectories · Visualized Progress</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search ID..." 
            style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--bd)', fontSize: '0.85rem', color: 'var(--ink)', background: '#FFFFFF', fontWeight: 600 }}
            value={userFilters?.search || ""}
            onChange={(e) => setUserFilters(f => ({...f, search: e.target.value}))}
          />
          <select 
            style={{ 
              padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--bd)', fontSize: '0.85rem', 
              background: userFilters?.status === 'Critical' ? 'rgba(239,68,68,0.1)' : '#FFFFFF', 
              color: userFilters?.status === 'Critical' ? '#dc2626' : 'var(--ink)', 
              fontWeight: 800,
              outline: 'none'
            }}
            value={userFilters?.status || "all"}
            onChange={(e) => setUserFilters(f => ({...f, status: e.target.value}))}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
            <option value="Critical">🚨 Critical Users</option>
          </select>
          <button
            className="p-back"
            style={{ padding: '0.6rem 1.4rem', fontSize: '0.8rem', background: 'var(--p)', borderColor: 'var(--p)' }}
            onClick={fetchAdminData}
          >
            <span className="spin-hover">↻</span> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {users
          .filter(u => {
            if (userFilters?.status === 'Critical') {
              return u.healingDescription?.includes('Critical') || u.healingDescription?.includes('Downward');
            }
            return userFilters?.status === "all" || u.status === userFilters?.status;
          })
          .filter(u => !userFilters?.search || String(u._id).toLowerCase().includes(userFilters.search.toLowerCase()))
          .sort((a, b) => {
            const priority = { "Active": 1, "Monitoring": 2, "Away": 3, "Verified": 4, "Offline": 5, "Inactive": 6 };
            return (priority[a.status] || 99) - (priority[b.status] || 99);
          })
          .map((u) => (
            <div key={u._id} className="dc" 
              style={{ 
                padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', minHeight: '340px',
                background: '#FFFFFF', border: '1px solid var(--bd)', borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(110, 72, 170, 0.05)'
              }}
              onClick={() => handleUserAction(u._id, "journey")}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(110, 72, 170, 0.12)';
                e.currentTarget.style.borderColor = 'var(--p)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(110, 72, 170, 0.05)';
                e.currentTarget.style.borderColor = 'var(--bd)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 900, color: 'var(--ink)', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                  {String(u._id).slice(-6).toUpperCase()}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ 
                    fontSize: "0.75rem", fontWeight: 900, textTransform: 'uppercase', 
                    padding: '8px 16px', borderRadius: '12px',
                    background: u.status === "Active" ? 'rgba(16,185,129,0.1)' :
                               u.status === "Monitoring" ? 'rgba(239,68,68,0.1)' :
                               u.status === "Away" ? 'rgba(245,158,11,0.1)' : 
                               u.status === "Verified" ? 'rgba(16,185,129,0.1)' : 
                               'rgba(100,116,139,0.1)',
                    color: u.status === "Active" ? '#059669' :
                           u.status === "Monitoring" ? '#dc2626' :
                           u.status === "Away" ? '#d97706' : 
                           u.status === "Verified" ? '#059669' : 
                           '#64748b',
                    border: `1px solid ${u.status === "Active" ? 'rgba(16,185,129,0.2)' :
                                         u.status === "Monitoring" ? 'rgba(239,68,68,0.2)' :
                                         u.status === "Away" ? 'rgba(245,158,11,0.2)' : 
                                         u.status === "Verified" ? 'rgba(16,185,129,0.2)' : 
                                         'rgba(100,116,139,0.2)'}`,
                    lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {u.status || "Inactive"}
                  </span>
                  {u.healingDescription && u.healingDescription !== "VERIFIED" && u.healingDescription !== "verified" && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      padding: '4px 12px', 
                      borderRadius: '8px',
                      background: u.healingDescription.includes("Critical") || u.healingDescription.includes("Downward") ? "rgba(239,68,68,0.1)" : 
                                  u.healingDescription.includes("Healing") || u.healingDescription.includes("Upward") ? "rgba(34,197,94,0.1)" : "rgba(201,162,51,0.1)",
                      color: u.healingDescription.includes("Critical") || u.healingDescription.includes("Downward") ? "#e11d48" : 
                             u.healingDescription.includes("Healing") || u.healingDescription.includes("Upward") ? "#16a34a" : "#ca8a04",
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {u.healingDescription}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3E8FF', paddingBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--mu)', fontWeight: 700 }}>Avg Sentiment:</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 900 }}>{u.avgScore || u.avgSentiment || "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3E8FF', paddingBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--mu)', fontWeight: 700 }}>Sessions:</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 900 }}>{u.sessions || u.sessionCount || 0}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--mu)', fontWeight: 700, fontSize: '0.8rem' }}>Recent Emotions:</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 800, fontSize: '0.85rem', lineHeight: '1.4' }}>
                    {u.lastSentiment || u.recentEmotions || "-"}
                  </span>
                </div>
              </div>

              <button style={{
                marginTop: 'auto',
                background: 'var(--p)',
                border: 'none',
                color: '#FFFFFF',
                padding: '1rem',
                borderRadius: '16px',
                fontSize: '0.85rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: '0.3s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 8px 20px rgba(157, 80, 187, 0.2)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--pd)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--p)'; e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={(e) => { e.stopPropagation(); handleUserAction(u._id, "journey"); }}
              >
                View Healing Progress <span>→</span>
              </button>
            </div>
        ))}
        {users.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', color: 'var(--mu)', fontWeight: 600 }}>
            No users found matching the criteria.
          </div>
        )}
      </div>
    </>
  );
}
