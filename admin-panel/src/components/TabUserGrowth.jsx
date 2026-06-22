import React, { useState } from "react";

export function TabUserGrowth({ users }) {
  const [view, setView] = useState("week"); // week | month | all

  const now = new Date();

  const startOf = (period) => {
    const d = new Date();
    if (period === "week")  { d.setDate(d.getDate() - 7); }
    if (period === "month") { d.setMonth(d.getMonth() - 1); }
    if (period === "all")   { return new Date(0); }
    return d;
  };

  const nonAdmin = users.filter(u => u.role !== "admin");

  const newUsers = nonAdmin.filter(u => {
    if (!u.createdAt) return false;
    return new Date(u.createdAt) >= startOf(view);
  });

  const totalUsers   = nonAdmin.length;
  const activeUsers  = nonAdmin.filter(u => u.status === "Active").length;
  const blockedUsers = nonAdmin.filter(u => u.status === "Blocked").length;

  // Group new users by day for the last 7 days (week view)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      count: nonAdmin.filter(u => {
        if (!u.createdAt) return false;
        const cd = new Date(u.createdAt);
        return cd.toDateString() === d.toDateString();
      }).length,
    };
  });

  const maxCount = Math.max(...last7.map(d => d.count), 1);

  return (
    <>
      {/* Header */}
      <div className="dh">
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--ink)" }}>User Growth</h2>
          <p style={{ color: "var(--mu)", fontWeight: 500 }}>
            Community registrations · Active vs blocked · New signups
          </p>
        </div>
        {/* Period toggle */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[["week", "Last 7 Days"], ["month", "Last 30 Days"], ["all", "All Time"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setView(k)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "10px",
                border: view === k ? "1.5px solid var(--p)" : "1px solid var(--bd)",
                background: view === k ? "rgba(157,80,187,0.15)" : "#FFFFFF",
                color: view === k ? "var(--p)" : "var(--mu)",
                fontWeight: view === k ? 800 : 500,
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Members",     value: totalUsers,       color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
          { label: `New (${view === "week" ? "7d" : view === "month" ? "30d" : "all"})`, value: newUsers.length, color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
          { label: "Active",            value: activeUsers,      color: "#1d4ed8", bg: "rgba(29,78,216,0.08)" },
          { label: "Blocked",           value: blockedUsers,     color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="dc" style={{ textAlign: "center", margin: 0, background: bg, border: `1px solid ${color}22` }}>
            <div style={{ fontSize: "2.8rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--ink)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "0.6rem", opacity: 0.7 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Bar Chart — Daily signups (last 7 days) */}
        <div className="dc" style={{ margin: 0 }}>
          <h4 style={{ color: "var(--ink)", fontWeight: 800 }}>Daily Signups — Last 7 Days</h4>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "130px", marginTop: "1rem", paddingBottom: "8px", borderBottom: "1px solid var(--bd)" }}>
            {last7.map(({ label, count }) => (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--ink)", fontWeight: 800 }}>{count || ""}</span>
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max((count / maxCount) * 90, count > 0 ? 10 : 4)}px`,
                    background: count > 0 ? "linear-gradient(to top, #6E48AA, #9D50BB)" : "#F3E8FF",
                    borderRadius: "6px 6px 0 0",
                    transition: "height 0.4s ease",
                    minHeight: "4px",
                    boxShadow: count > 0 ? "0 4px 12px rgba(110,72,170,0.2)" : "none"
                  }}
                />
                <span style={{ fontSize: "0.6rem", color: "var(--mu)", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
                  {label.split(",")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups List */}
        <div className="dc" style={{ margin: 0 }}>
          <h4 style={{ color: "var(--ink)", fontWeight: 800 }}>Recent Signups</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
            {newUsers.length === 0 ? (
              <div style={{ color: "var(--mu)", fontSize: "0.82rem", textAlign: "center", padding: "1.5rem" }}>
                No new signups in this period.
              </div>
            ) : (
              newUsers.slice(0, 10).map((u, i) => (
                <div key={u._id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0.9rem", background: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--bd)", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(157,80,187,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900, color: "var(--p)" }}>
                      {String(u._id).slice(-2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 900, color: "var(--ink)", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                        {String(u._id).slice(-6).toUpperCase()}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--mu)", fontWeight: 700, marginTop: "1px" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown"}
                      </div>
                    </div>
                  </div>
                  <span className={`sp ${u.status === "Blocked" ? "spr" : u.status === "Active" ? "spg" : "spy"}`} style={{ fontSize: "0.65rem", fontWeight: 900 }}>
                    {u.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
