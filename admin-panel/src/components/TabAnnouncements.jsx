import React, { useState, useEffect } from "react";

const TYPE_META = {
  islamic_reminder: { label: "Islamic Reminder", icon: "🕌", color: "#228be6", bg: "rgba(34,139,230,0.1)" },
  system_notice:    { label: "System Notice",    icon: "📋", color: "#9D50BB", bg: "rgba(157,80,187,0.1)" },
  important_alert:  { label: "Important Alert",  icon: "🚨", color: "#e03131", bg: "rgba(224,49,49,0.1)" },
  encouragement:    { label: "Encouragement",    icon: "💜", color: "#2f9e44", bg: "rgba(47,158,68,0.1)"  },
};

const AUDIENCE_META = {
  all:      { label: "All Users",        icon: "👥" },
  active:   { label: "Active Users",     icon: "✅" },
  critical: { label: "High-Risk Users",  icon: "🚨" },
  new:      { label: "New Users (7d)",   icon: "🌱" },
};

export function TabAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "system_notice",
    targetAudience: "all",
  });

  const ADMIN_TOKEN = localStorage.getItem("adminToken");

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and message body are required.");
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_TOKEN}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`✓ Broadcast sent to ${data.announcement.recipientCount} user${data.announcement.recipientCount !== 1 ? "s" : ""}!`);
        setForm({ title: "", body: "", type: "system_notice", targetAudience: "all" });
        fetchAnnouncements();
      } else {
        setError(data.message || "Failed to send.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.7rem 1rem",
    borderRadius: "12px",
    border: "1px solid var(--bd)",
    background: "#FFFFFF",
    color: "var(--ink)",
    fontSize: "0.85rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  return (
    <>
      {/* Header */}
      <div className="dh">
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--ink)" }}>📢 Broadcast & Announcements</h2>
          <p style={{ color: "var(--mu)", fontWeight: 500 }}>
            Send system-wide messages · Islamic reminders · Targeted alerts
          </p>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--mu)", fontWeight: 700 }}>
          {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} sent
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "1.5rem", alignItems: "start" }}>

        {/* COMPOSE PANEL */}
        <div className="dc" style={{ margin: 0, display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "var(--mu)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Compose Announcement
          </div>

          {/* Type */}
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--mu)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {Object.entries(TYPE_META).map(([key, { label, icon, color, bg }]) => (
                <div
                  key={key}
                  onClick={() => setForm(f => ({ ...f, type: key }))}
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: "10px",
                    border: form.type === key ? `1.5px solid ${color}` : "1px solid var(--bd)",
                    background: form.type === key ? bg : "#FDFBFF",
                    color: form.type === key ? color : "var(--mu)",
                    fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {icon} {label}
                </div>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--mu)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Target Audience</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {Object.entries(AUDIENCE_META).map(([key, { label, icon }]) => (
                <div
                  key={key}
                  onClick={() => setForm(f => ({ ...f, targetAudience: key }))}
                  style={{
                    padding: "0.55rem 0.75rem",
                    borderRadius: "10px",
                    border: form.targetAudience === key ? "1.5px solid var(--p)" : "1px solid var(--bd)",
                    background: form.targetAudience === key ? "rgba(157,80,187,0.12)" : "#FDFBFF",
                    color: form.targetAudience === key ? "var(--p)" : "var(--mu)",
                    fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {icon} {label}
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--mu)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Title</label>
            <input
              type="text"
              placeholder="e.g. Important Update for Our Community"
              value={form.title}
              maxLength={100}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={inputStyle}
            />
          </div>

          {/* Body */}
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--mu)", fontWeight: 700, display: "block", marginBottom: "6px" }}>Message</label>
            <textarea
              placeholder="Write your announcement here... (max 500 characters)"
              value={form.body}
              maxLength={500}
              rows={5}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" }}
            />
            <div style={{ fontSize: "0.65rem", color: "var(--mu)", textAlign: "right", marginTop: "4px" }}>
              {form.body.length}/500
            </div>
          </div>

          {/* Feedback */}
          {error   && <div style={{ padding: "0.6rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", fontSize: "0.78rem", color: "#ff6b6b", fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ padding: "0.6rem 1rem", background: "rgba(81,207,102,0.1)", border: "1px solid rgba(81,207,102,0.25)", borderRadius: "10px", fontSize: "0.78rem", color: "#51cf66", fontWeight: 600 }}>{success}</div>}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              padding: "0.85rem",
              borderRadius: "14px",
              border: "none",
              background: sending ? "rgba(157,80,187,0.3)" : "linear-gradient(135deg, #9d50bb, #6e34a8)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: sending ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: sending ? "none" : "0 4px 20px rgba(157,80,187,0.4)",
            }}
          >
            {sending ? "Sending..." : "📢 Send Broadcast"}
          </button>
        </div>

        {/* HISTORY PANEL */}
        <div className="dc" style={{ margin: 0, maxHeight: "75vh", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "var(--mu)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>
            Announcement History
          </div>
          <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {loading && <div style={{ color: "var(--mu)", textAlign: "center", padding: "2rem", fontSize: "0.85rem" }}>Loading...</div>}
            {!loading && announcements.length === 0 && (
              <div style={{ color: "var(--mu)", textAlign: "center", padding: "3rem", fontSize: "0.85rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                No announcements sent yet.
              </div>
            )}
            {announcements.map(a => {
              const tm = TYPE_META[a.type] || TYPE_META.system_notice;
              const am = AUDIENCE_META[a.targetAudience] || AUDIENCE_META.all;
              return (
                <div
                  key={a._id}
                  style={{
                    padding: "1rem 1.1rem",
                    background: "#FFFFFF",
                    border: `1px solid ${tm.color}33`,
                    borderLeft: `4px solid ${tm.color}`,
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(110, 72, 170, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--ink)" }}>{a.title}</span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: tm.bg, color: tm.color, whiteSpace: "nowrap" }}>
                          {tm.icon} {tm.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.76rem", color: "var(--mu)", lineHeight: "1.5", margin: "0 0 8px 0" }}>{a.body}</p>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.65rem", color: "var(--mu)", fontWeight: 600 }}>
                        <span>{am.icon} {am.label}</span>
                        <span>👥 {a.recipientCount} recipients</span>
                        <span>🕐 {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(a._id)}
                      disabled={deleting === a._id}
                      style={{
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ff6b6b",
                        borderRadius: "8px", padding: "4px 10px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", flexShrink: 0,
                        opacity: deleting === a._id ? 0.5 : 1,
                      }}
                    >
                      {deleting === a._id ? "..." : "✕"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
