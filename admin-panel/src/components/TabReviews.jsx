import React, { useState } from "react";

const STARS = (n) => "★".repeat(n) + "☆".repeat(5 - n);

export function TabReviews({ adminStats }) {
  const [filterStars, setFilterStars] = useState(0); // 0 = all

  const reviews = adminStats?.recentReviews || [];
  const avgRating = adminStats?.averageRating || null;

  const filtered = filterStars === 0
    ? reviews
    : reviews.filter(r => r.rating === filterStars);

  // Star distribution
  const dist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === s).length / reviews.length) * 100) : 0,
  }));

  const ratingColor = (r) => {
    if (r >= 4) return "#10b981"; // Modern Green
    if (r >= 3) return "#f59e0b"; // Modern Amber
    return "#ef4444"; // Modern Red
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '2rem',
        padding: '0 0.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#4A235A", margin: 0, letterSpacing: '-1px' }}>Platform Feedback</h2>
          <p style={{ color: "#884EA0", fontWeight: 600, fontSize: '0.9rem', margin: '4px 0 0' }}>
            User satisfaction audit & experience reviews.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Global Rating</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#4A235A', lineHeight: 1 }}>{avgRating || "0.0"}</span>
            <div style={{ color: "#fcc419", fontSize: "1.2rem", letterSpacing: "1px" }}>
              {avgRating ? STARS(Math.round(parseFloat(avgRating))) : "☆☆☆☆☆"}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
        
        {/* Star Breakdown */}
        <div style={{ 
          background: '#FFFFFF', 
          padding: '1.5rem', 
          borderRadius: '24px', 
          border: '1px solid #D7BDE2',
          boxShadow: '0 4px 15px rgba(110, 72, 170, 0.03)'
        }}>
          <h4 style={{ margin: '0 0 1.2rem', color: '#4A235A', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase' }}>Rating Density</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dist.map(({ star, count, pct }) => (
              <div
                key={star}
                onClick={() => setFilterStars(filterStars === star ? 0 : star)}
                style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", transition: '0.2s' }}
                onMouseOver={e => e.currentTarget.style.opacity = 0.7}
                onMouseOut={e => e.currentTarget.style.opacity = 1}
              >
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#4A235A", width: '25px' }}>{star}★</span>
                <div style={{ flex: 1, height: "10px", background: "#F3E8FF", borderRadius: "100px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: filterStars === star ? "#9D50BB" : "#D7BDE2", borderRadius: "10px", transition: "width 0.6s ease" }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#884EA0", width: "35px", textAlign: "right" }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter & Quick Stats */}
        <div style={{ 
          background: '#FFFFFF', 
          padding: '1.5rem', 
          borderRadius: '24px', 
          border: '1px solid #D7BDE2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(110, 72, 170, 0.03)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', color: '#4A235A', fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase' }}>Filter by Sentiment</h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[0, 5, 4, 3, 2, 1].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStars(s)}
                  style={{
                    padding: "0.6rem 1.2rem",
                    borderRadius: "12px",
                    border: filterStars === s ? "2px solid #9D50BB" : "1px solid #D7BDE2",
                    background: filterStars === s ? "#F3E8FF" : "#FFFFFF",
                    color: filterStars === s ? "#9D50BB" : "#884EA0",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {s === 0 ? "All Feed" : `${s} Stars`}
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #F3E8FF', paddingTop: '1rem', display: 'flex', gap: '30px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#4A235A' }}>{reviews.length}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase' }}>Verified Reviews</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{dist[0].pct + dist[1].pct}%</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase' }}>Positive Ratio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Feed */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4A235A', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
        {filterStars === 0 ? "All Feed" : `${filterStars}-Star Reviews`} 
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#884EA0', marginLeft: '10px' }}>({filtered.length} entries)</span>
      </h3>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem", background: '#FFFFFF', borderRadius: '32px', border: '1px solid #D7BDE2' }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⭐</div>
          <h3 style={{ color: '#4A235A', fontWeight: 900 }}>No Reviews Match</h3>
          <p style={{ color: '#884EA0', fontWeight: 600 }}>Adjust your filters to see more feedback.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {filtered.map((r, i) => (
            <div
              key={r.id || i}
              style={{
                padding: "1.8rem",
                background: "#FFFFFF",
                border: "1px solid #D7BDE2",
                borderTop: `4px solid ${ratingColor(r.rating)}`,
                borderRadius: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                boxShadow: '0 4px 12px rgba(110, 72, 170, 0.03)',
                position: 'relative'
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: '#F3E8FF', color: '#9D50BB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 900
                  }}>
                    {(r.name || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, color: "#4A235A", fontSize: "0.95rem" }}>
                      {r.name || "Anonymous User"}
                    </div>
                    <div style={{ color: "#fcc419", fontSize: "0.8rem" }}>
                      {STARS(r.rating)}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: "4px 12px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 900,
                  background: `${ratingColor(r.rating)}15`, color: ratingColor(r.rating),
                  border: `1px solid ${ratingColor(r.rating)}44`
                }}>
                  {r.rating}.0
                </div>
              </div>

              {r.text ? (
                <p style={{ 
                  fontSize: "1rem", 
                  color: "#2D3748", 
                  lineHeight: "1.6", 
                  margin: 0, 
                  fontWeight: 500,
                  fontStyle: r.text.length < 50 ? 'italic' : 'normal'
                }}>
                  "{r.text}"
                </p>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#A0AEC0', fontStyle: 'italic', margin: 0 }}>
                  User left a rating without comments.
                </p>
              )}

              <div style={{ 
                marginTop: "auto", 
                paddingTop: "1rem", 
                borderTop: "1px solid #F3E8FF",
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: "0.75rem", color: "#884EA0", fontWeight: 700 }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Verified Review"}
                </span>
                {r.userText && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#9D50BB', background: '#F3E8FF', padding: '2px 8px', borderRadius: '6px' }}>
                    {r.userText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
