import React, { useEffect, useRef } from "react";

export function UserJourneyModal({ journeyUser, setJourneyUser }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!journeyUser || !journeyUser.emotions || !window.Chart) return;

    const C = window.Chart;
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const emotionScores = { happy: 0.8, joy: 0.8, calm: 0.6, grateful: 0.9, neutral: 0, sad: -0.6, anxious: -0.5, fearful: -0.8, fear: -0.8 };
    
    // Sort by date ascending and filter valid entries
    const sortedEmotions = [...journeyUser.emotions]
        .filter(e => e && e.date && e.emotion)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedEmotions.map(e => {
        const d = new Date(e.date);
        return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
    });
    
    const data = sortedEmotions.map(e => {
        const key = String(e.emotion || "neutral").toLowerCase();
        return emotionScores[key] || 0;
    });

    const ctx = chartRef.current;
    if (ctx) {
      chartInstance.current = new C(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Healing Progress",
              data,
              borderColor: "rgba(157, 80, 187, 1)",
              borderWidth: 3,
              backgroundColor: "rgba(157, 80, 187, 0.15)",
              tension: 0.45,
              fill: true,
              pointBackgroundColor: data.map(d => d < -0.3 ? "#ff6b6b" : (d > 0.3 ? "#51cf66" : "#fcc419")),
              pointBorderColor: "rgba(255,255,255,0.1)",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: {
              backgroundColor: '#FFFFFF',
              titleColor: 'var(--ink)',
              bodyColor: 'var(--mu)',
              borderColor: 'var(--bd)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 12,
              displayColors: false
            }
          },
          scales: {
            y: { 
              min: -1, 
              max: 1, 
              grid: { color: "#F3E8FF" }, 
              ticks: { color: "var(--mu)", font: { size: 10, weight: 600 } },
              title: { display: true, text: "Tranquility Score", color: "var(--pd)", font: { size: 11, weight: 900 } } 
            },
            x: { 
              grid: { display: false },
              ticks: { color: "var(--mu)", font: { size: 10, weight: 600 } }
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [journeyUser]);

  const getProgressSummary = () => {
    if (!journeyUser || !journeyUser.emotions || journeyUser.emotions.length < 2) {
        return { text: "Insufficient data to determine a trend yet. Continue monitoring and supporting the user's journey.", color: "rgba(255,255,255,0.4)" };
    }
    const emotionScores = { happy: 0.8, joy: 0.8, calm: 0.6, grateful: 0.9, neutral: 0, sad: -0.6, anxious: -0.5, fearful: -0.8, fear: -0.8 };
    const validEmos = [...journeyUser.emotions]
        .filter(e => e && e.emotion && e.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (validEmos.length < 2) return { text: "Initializing progress tracking... More interactions needed for trend analysis.", color: "rgba(255,255,255,0.4)" };

    const firstScore = emotionScores[validEmos[0].emotion.toLowerCase()] || 0;
    const lastScore = emotionScores[validEmos[validEmos.length - 1].emotion.toLowerCase()] || 0;
    const recentScores = validEmos.slice(-3).map(e => emotionScores[e.emotion.toLowerCase()] || 0);
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    if (recentAvg > 0.4) return { text: "The user is showing significant emotional stability and positivity. They seem to be in a state of 'Grateful Healing' and peace.", color: "#51cf66" };
    if (lastScore > firstScore + 0.2) return { text: "Trend Analysis: Upward Trajectory. The user is successfully navigating out of distress towards a more peaceful and resilient state.", color: "#51cf66" };
    if (recentAvg < -0.4) return { text: "Status: Critical. The user remains in a high-distress zone (Anxiety/Grief). Active intervention or spiritual guidance via the AI is highly recommended.", color: "#ff6b6b" };
    if (lastScore < firstScore - 0.2) return { text: "Trend Analysis: Downward Shift. The user has recently experienced a dip in emotional well-being. Monitor for red-flag triggers.", color: "#ff6b6b" };
    
    return { text: "The user's emotional state is currently 'Stable'. They are maintaining a balanced journey without major distress spikes at this time.", color: "#fcc419" };
  };

  if (!journeyUser) return null;

  const summary = getProgressSummary();

  return (
    <div className="m-ov fa" onClick={() => setJourneyUser(null)}>
      <div className="m-cnt" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="m-h">
          <div>
            <h3>Healing Journey: {String(journeyUser.id).slice(-6).toUpperCase()}</h3>
            <div style={{ fontSize: ".75rem", color: "var(--mu)", fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '4px' }}>
              Emotional Progress Visualization
            </div>
          </div>
          <button className="m-close" onClick={() => setJourneyUser(null)}>&times;</button>
        </div>
        <div className="m-b">
          <div className="m-sec">
            <span className="m-label" style={{ color: 'var(--ink)', opacity: 1, fontWeight: 900, borderLeft: '3px solid var(--p)', paddingLeft: '12px' }}>Progress Overview</span>
            <p style={{ fontSize: "0.95rem", color: "var(--mu)", marginBottom: "1.5rem", lineHeight: 1.6, fontWeight: 500 }}>
              This graph maps the user's emotional state over time, ranging from high distress (negative values) to tranquility and joy (positive values).
            </p>
            {journeyUser.emotions && journeyUser.emotions.length > 0 ? (
                <>
                    <div style={{ position: "relative", height: "300px", width: "100%", marginTop: "1rem" }}>
                        <canvas ref={chartRef} />
                    </div>
                    <div style={{ 
                        marginTop: '2rem', 
                        padding: '1.5rem', 
                        background: '#FDFBFF', 
                        borderRadius: '20px',
                        border: '1px solid var(--bd)',
                        borderLeft: `4px solid ${summary.color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        boxShadow: '0 10px 30px rgba(110, 72, 170, 0.05)'
                    }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: summary.color, letterSpacing: '0.15em' }}>
                            AI Progress Insights
                        </span>
                        <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: '1.6', fontWeight: 500 }}>
                            {summary.text}
                        </p>
                    </div>
                </>
            ) : (
                <div style={{ 
                    padding: "5rem 2rem", 
                    textAlign: "center", 
                    color: "var(--mu)",
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px dashed var(--bd)',
                    fontSize: '1rem',
                    fontWeight: 500
                }}>
                    No emotional data detected for this user yet.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
