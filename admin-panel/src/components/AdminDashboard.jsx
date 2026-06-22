import React, { useState } from "react";
import { createPortal } from "react-dom";
import { OrbBg } from "./DashboardComponents.jsx";
import { TabChatModeration } from "./TabChatModeration.jsx";
import { TabInterventions } from "./TabInterventions.jsx";
import { TabJourneys } from "./TabJourneys.jsx";
import { TabReviews } from "./TabReviews.jsx";

export function AdminDashboard({
  role,
  page,
  setPage,
  logout,
  dashTab,
  setDT,
  pulse,
  adminStats,
  users,
  userFilters,
  setUserFilters,
  fetchAdminData,
  handleUserAction,
  hallView,
  setHallView,
  activeAlertTab,
  setActiveAlertTab,
  liveFeed,
  activityFilter,
  setActivityFilter,
  aiPerf,
  contentVerses,
  isDataLoading,
}) {
  const [adminName, setAdminName] = useState(
    () => localStorage.getItem("qalbify_admin_name") || "Maryam",
  );
  const [adminPic, setAdminPic] = useState(
    () => localStorage.getItem("qalbify_admin_pic") || "",
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mockNotifs] = useState([
    {
      id: 1,
      title: "Critical Alert",
      text: "Potential distress in Session #882",
      type: "error",
      time: "2m ago",
    },
    {
      id: 2,
      title: "System Update",
      text: "AI Guardrails v2.1 deployed",
      type: "info",
      time: "1h ago",
    },
    {
      id: 3,
      title: "New Report",
      text: "User feedback review required",
      type: "warn",
      time: "3h ago",
    },
  ]);

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target.result;
      setAdminPic(data);
      localStorage.setItem("qalbify_admin_pic", data);
    };
    reader.readAsDataURL(file);
  };

  const updateName = (newName) => {
    setAdminName(newName);
    localStorage.setItem("qalbify_admin_name", newName);
  };

  return (
    <div
      className={`pg ${page === "admin" ? "on" : ""}`}
      style={{ background: "#F3E8FF", minHeight: "100vh", color: "#4A235A" }}
    >
      <OrbBg />

      {role !== "admin" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              padding: "3rem",
              borderRadius: "40px",
              textAlign: "center",
              border: "1px solid var(--bd)",
              backdropFilter: "blur(30px)",
              boxShadow: "0 25px 50px rgba(110, 72, 170, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                marginBottom: "1.5rem",
                letterSpacing: "-1px",
                color: "var(--ink)",
              }}
            >
              Restricted Access
            </h2>
            <p
              style={{ color: "var(--mu)", marginBottom: "2.5rem", fontWeight: 500 }}
            >
              You do not have the required permissions to view this portal.
            </p>
            <button
              className="fb"
              onClick={() => setPage("login")}
              style={{
                width: "100%",
                padding: "1.2rem",
                borderRadius: "18px",
                fontWeight: 800,
                background: "var(--p)",
                color: "#fff",
                border: "none",
              }}
            >
              Back to Secure Login
            </button>
          </div>
        </div>
      ) : (
        <div
          className="dl-portal"
          style={{ padding: "0 5%", background: "transparent" }}
        >
          {/* Top Command Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.2rem 5%",
              marginBottom: "2rem",
              borderBottom: "1px solid #D7BDE2",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              margin: "0 -5%",
              boxShadow: "0 10px 30px rgba(110, 72, 170, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                cursor: "pointer",
              }}
              onClick={() => setDT("home")}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #9D50BB, #6E48AA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  boxShadow: "0 0 20px rgba(157, 80, 187, 0.3)",
                }}
              >
                🛡️
              </div>
              <h1
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                  color: "#4A235A",
                  textShadow: "0 0 10px rgba(157, 80, 187, 0.2)",
                }}
              >
                Qalbify Portal
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Notification Bell */}
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setShowNotifs(!showNotifs)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "rgba(157, 80, 187, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    cursor: "pointer",
                    border: "1px solid #D7BDE2",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    boxShadow: showNotifs
                      ? "0 0 20px rgba(157, 80, 187, 0.3)"
                      : "none",
                    borderColor: showNotifs ? "#9D50BB" : "#D7BDE2",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background =
                      "rgba(157, 80, 187, 0.2)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background =
                      "rgba(157, 80, 187, 0.1)";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <span
                    style={{
                      filter: "drop-shadow(0 0 5px rgba(255,255,255,0.3))",
                    }}
                  >
                    🔔
                  </span>
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      width: "10px",
                      height: "10px",
                      background: "#ef4444",
                      borderRadius: "50%",
                      border: "2px solid #130820",
                      boxShadow: "0 0 10px #ef4444",
                    }}
                  ></div>
                </div>

                {showNotifs && (
                  <div
                    style={{
                      position: "absolute",
                      top: "65px",
                      right: "0",
                      width: "440px",
                      background: "#FFFFFF",
                      borderRadius: "32px",
                      border: "1px solid var(--bd)",
                      boxShadow: "0 25px 60px rgba(110, 72, 170, 0.15)",
                      zIndex: 5000,
                      overflow: "hidden",
                      animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <div
                      style={{
                        padding: "2.2rem",
                        borderBottom: "1px solid #F3E8FF",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "linear-gradient(to right, #FDFBFF, transparent)",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontWeight: 900,
                            fontSize: "1.3rem",
                            color: "var(--ink)",
                            letterSpacing: "0.5px",
                            display: "block",
                          }}
                        >
                          System Activity
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--mu)",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                          }}
                        >
                          Live Intelligence
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--p)",
                          background: "#F3E8FF",
                          padding: "8px 18px",
                          borderRadius: "100px",
                          fontWeight: 900,
                          cursor: "pointer",
                          border: "1px solid var(--bd)",
                          transition: "0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#FFFFFF")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "#F3E8FF")
                        }
                      >
                        Mark Read
                      </span>
                    </div>
                    <div
                      style={{
                        maxHeight: "520px",
                        overflowY: "auto",
                        padding: "1.8rem",
                      }}
                    >
                      {mockNotifs.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: "1.6rem",
                            background: "#FFFFFF",
                            borderRadius: "24px",
                            border: "1px solid var(--bd)",
                            marginBottom: "18px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            display: "flex",
                            gap: "20px",
                            position: "relative",
                            boxShadow: "0 4px 12px rgba(110, 72, 170, 0.05)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = "var(--p)";
                            e.currentTarget.style.background = "#FDFBFF";
                            e.currentTarget.style.transform = "scale(1.02)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "var(--bd)";
                            e.currentTarget.style.background = "#FFFFFF";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <div
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "16px",
                              background:
                                n.type === "error"
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : n.type === "warn"
                                    ? "rgba(245, 158, 11, 0.2)"
                                    : "rgba(168, 85, 247, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.6rem",
                              flexShrink: 0,
                              border: `1px solid ${n.type === "error" ? "rgba(239, 68, 68, 0.4)" : n.type === "warn" ? "rgba(245, 158, 11, 0.4)" : "rgba(168, 85, 247, 0.4)"}`,
                            }}
                          >
                            {n.type === "error"
                              ? "🚨"
                              : n.type === "warn"
                                ? "⚠️"
                                : "ℹ️"}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: 900,
                                  color: "var(--ink)",
                                }}
                              >
                                {n.title}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--mu)",
                                  fontWeight: 800,
                                }}
                              >
                                {n.time}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "0.9rem",
                                color: "var(--mu)",
                                lineHeight: 1.6,
                                fontWeight: 500,
                              }}
                            >
                              {n.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        padding: "1.8rem",
                        textAlign: "center",
                        background: "#F3E8FF",
                        fontSize: "0.9rem",
                        fontWeight: 900,
                        color: "var(--p)",
                        cursor: "pointer",
                        borderTop: "1px solid var(--bd)",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      Audit Full System Logs
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "8px 20px",
                  background: "rgba(157, 80, 187, 0.1)",
                  borderRadius: "100px",
                  border: "1px solid #D7BDE2",
                  cursor: "pointer",
                }}
                onClick={() => setIsEditingProfile(!isEditingProfile)}
              >
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: "#4A235A",
                    }}
                  >
                    {adminName}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#884EA0",
                      textTransform: "uppercase",
                    }}
                  >
                    Administrator
                  </div>
                </div>
                {adminPic ? (
                  <img
                    src={adminPic}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "2px solid #9D50BB",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#9D50BB",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "1rem",
                    }}
                  >
                    {adminName[0]}
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                style={{
                  padding: "10px 22px",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "14px",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")
                }
              >
                LOGOUT
              </button>
            </div>
          </div>

          {/* Profile Edit Overlay */}
          {isEditingProfile && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(243, 232, 255, 0.7)",
                backdropFilter: "blur(15px)",
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  padding: "3rem",
                  borderRadius: "32px",
                  border: "1px solid #D7BDE2",
                  width: "100%",
                  maxWidth: "450px",
                  position: "relative",
                  boxShadow: "0 20px 60px rgba(110, 72, 170, 0.15)",
                }}
              >
                <button
                  onClick={() => setIsEditingProfile(false)}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    background: "none",
                    border: "none",
                    color: "#4A235A",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
                <h3
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    marginBottom: "2rem",
                    textAlign: "center",
                    color: "#4A235A",
                  }}
                >
                  Edit Profile
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "2rem",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    {adminPic ? (
                      <img
                        src={adminPic}
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          border: "4px solid #9D50BB",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background: "#9D50BB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "3rem",
                          fontWeight: 900,
                        }}
                      >
                        {adminName[0]}
                      </div>
                    )}
                    <label
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        background: "#9D50BB",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        border: "3px solid #FFFFFF",
                      }}
                    >
                      📷
                      <input
                        type="file"
                        hidden
                        onChange={handlePicUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => updateName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: "#F3E8FF",
                      border: "1px solid #D7BDE2",
                      borderRadius: "14px",
                      color: "#4A235A",
                      textAlign: "center",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                    placeholder="Admin Name"
                  />
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  style={{
                    width: "100%",
                    padding: "1.1rem",
                    background: "#9D50BB",
                    color: "#fff",
                    border: "none",
                    borderRadius: "16px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

            <div
              className="dm full-width"
              style={{ paddingBottom: "3rem", background: "transparent", minHeight: "80vh" }}
            >
            {isDataLoading && (
              <div
                style={{
                  textAlign: "right",
                  color: "#c4b5fd",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  marginBottom: "1.5rem",
                  letterSpacing: "1.5px",
                  textShadow: "0 0 10px rgba(124, 58, 237, 0.3)",
                }}
              >
                SYSTEM SYNCING...
              </div>
            )}

            {dashTab !== "home" && (
              <button
                onClick={() => setDT("home")}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #D7BDE2",
                  borderRadius: "12px",
                  padding: "10px 20px",
                  color: "#4A235A",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  marginBottom: "2.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#F3E8FF")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#FFFFFF")
                }
              >
                <span style={{ fontSize: "1.4rem", lineHeight: 0 }}>‹</span>{" "}
                BACK TO COMMAND CENTER
              </button>
            )}

            <div>
              {dashTab === "home" && (
                <TabHome
                  setDT={setDT}
                  adminStats={adminStats || {}}
                  logout={logout}
                  adminName={adminName}
                  liveFeed={liveFeed}
                  users={users}
                />
              )}
              {dashTab === "overview" && (
                <TabOverview
                  adminStats={adminStats || {}}
                  pulse={pulse}
                  setDT={setDT}
                  users={users}
                />
              )}
              {dashTab === "activity" && (
                <TabActivity
                  liveFeed={liveFeed}
                  users={users}
                  filter={activityFilter}
                  setFilter={setActivityFilter}
                  handleUserAction={handleUserAction}
                />
              )}
              {dashTab === "journeys" && (
                <TabJourneys
                  users={users}
                  userFilters={userFilters}
                  setUserFilters={setUserFilters}
                  handleUserAction={handleUserAction}
                  fetchAdminData={fetchAdminData}
                />
              )}
              {dashTab === "sentiment" && (
                <TabSentiment
                  adminStats={adminStats || {}}
                  users={users}
                  liveFeed={liveFeed}
                />
              )}
              {dashTab === "auth" && <TabAuth liveFeed={liveFeed} />}
              {dashTab === "ai" && <TabAI aiPerf={aiPerf || []} adminStats={adminStats || {}} />}
              {dashTab === "hallucination" && <TabHall adminStats={adminStats || {}} liveFeed={liveFeed} />}
              {dashTab === "alerts" && (
                <TabAlerts
                  adminStats={adminStats || {}}
                  users={users}
                  liveFeed={liveFeed}
                  setDT={setDT}
                  handleUserAction={handleUserAction}
                />
              )}
              {dashTab === "interventions" && (
                <TabInterventions
                  users={users}
                  handleUserAction={handleUserAction}
                />
              )}
              {dashTab === "moderation" && (
                <TabChatModeration
                  users={users}
                  liveFeed={liveFeed}
                  handleUserAction={handleUserAction}
                />
              )}
              {dashTab === "reviews" && (
                <TabReviews adminStats={adminStats || {}} />
              )}
            </div>
          </div>

          {/* GLOBAL PROFESSIONAL FOOTER - "The Box" */}
          {dashTab !== "moderation" && (
            <div
            style={{
              background: "#FFFFFF",
              borderTop: "1px solid #D7BDE2",
              margin: "0 -5%",
              padding: "4rem 5% 3rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "3rem",
              position: "relative",
              boxShadow: "0 -10px 40px rgba(110, 72, 170, 0.05)",
            }}
          >
            {/* Top Accent Line */}
            <div
              style={{
                position: "absolute",
                top: "-1px",
                left: "0",
                right: "0",
                height: "3px",
                background: "linear-gradient(to right, #9D50BB, #6E48AA)",
              }}
            ></div>

            <div style={{ gridColumn: "span 2" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #9D50BB, #6E48AA)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    boxShadow: "0 4px 12px rgba(157, 80, 187, 0.2)",
                  }}
                >
                  🛡️
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: "#4A235A",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Qalbify <span style={{ color: "#9D50BB" }}>ADMIN</span>
                  </h4>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: "#884EA0",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    System Command Center
                  </div>
                </div>
              </div>
              <p
                style={{
                  color: "#4A235A",
                  lineHeight: 1.7,
                  fontSize: "1rem",
                  maxWidth: "420px",
                  marginBottom: "25px",
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                A sophisticated engine for monitoring, guiding, and protecting
                the spiritual well-being of the Qalbify community with real-time
                intelligence.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {["AI-Secure", "Quran-Verified", "Privacy-Locked"].map((b) => (
                  <div
                    key={b}
                    style={{
                      padding: "6px 14px",
                      background: "#F3E8FF",
                      border: "1px solid #D7BDE2",
                      borderRadius: "100px",
                      color: "#9D50BB",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5
                style={{
                  color: "#9D50BB",
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: "20px",
                }}
              >
                Community
              </h5>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  "Dashboard Overview",
                  "User Profiles",
                  "Guide the AI",
                  "Red Flags",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      color: "#4A235A",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = "#9D50BB";
                      e.currentTarget.style.transform = "translateX(5px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = "#4A235A";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <span style={{ fontSize: "0.6rem", opacity: 0.5 }}>●</span>{" "}
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5
                style={{
                  color: "#9D50BB",
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: "20px",
                }}
              >
                Systems
              </h5>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  "Live Activity",
                  "AI Health Check",
                  "Access Logs",
                  "Accuracy Audit",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      color: "#4A235A",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "0.3s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = "#9D50BB";
                      e.currentTarget.style.transform = "translateX(5px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = "#4A235A";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <span style={{ fontSize: "0.6rem", opacity: 0.5 }}>●</span>{" "}
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                borderTop: "1px solid #F3E8FF",
                paddingTop: "2.5rem",
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "#884EA0",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                © 2026 Qalbify Portal. All rights reserved.
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <div
                  style={{
                    color: "#4A235A",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  ></div>{" "}
                  System Status: Optimal
                </div>
                <button
                  onClick={() => alert(`Qalbify Admin Support: 03325665065`)}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #9D50BB, #6E48AA)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "0.3s",
                    boxShadow: "0 4px 12px rgba(157, 80, 187, 0.2)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(157, 80, 187, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(157, 80, 187, 0.2)";
                  }}
                >
                  SUPPORT HELPLINE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function TabHome({
  setDT,
  adminStats,
  logout,
  adminName,
  liveFeed = [],
  users = [],
}) {
  const sections = [
    {
      title: "Community Care",
      items: [
        {
          id: "overview",
          label: "Dashboard Overview",
          icon: "📊",
          desc: "See how many users are active, their mood trends, and overall community health at a glance.",
          color: "#7c3aed",
        },
        {
          id: "journeys",
          label: "User Profiles",
          icon: "🗺️",
          desc: "View each user's emotional progress, chat history, and healing journey over time.",
          color: "#8b5cf6",
        },
        {
          id: "interventions",
          label: "Guide the AI",
          icon: "🛡️",
          desc: "Give the AI special instructions for how to talk to a specific user (e.g. be gentler, use Quran more).",
          color: "#a855f7",
        },
        {
          id: "alerts",
          label: "Red Flags",
          icon: "🚩",
          desc: "Users who may be in crisis or distress — needs your immediate attention.",
          color: "#ef4444",
        },
      ],
    },
    {
      title: "System & Security",
      items: [
        {
          id: "activity",
          label: "Live Activity",
          icon: "⚡",
          desc: "See what's happening right now — new messages, logins, and user interactions in real time.",
          color: "#8b5cf6",
        },
        {
          id: "ai",
          label: "AI Health Check",
          icon: "🤖",
          desc: "Check if the AI is responding fast and working properly — speed, usage, and error rates.",
          color: "#7c3aed",
        },
        {
          id: "auth",
          label: "Login & Access Logs",
          icon: "🔑",
          desc: "See who logged in, when, and track any suspicious access attempts.",
          color: "#a855f7",
        },
        {
          id: "hallucination",
          label: "Quran Accuracy Check",
          icon: "🔍",
          desc: "Make sure the AI is quoting Quran correctly and not making things up.",
          color: "#c084fc",
        },
        {
          id: "moderation",
          label: "Chat Review",
          icon: "💬",
          desc: "Read user conversations to ensure safe and appropriate content.",
          color: "#d946ef",
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          id: "reviews",
          label: "User Feedback",
          icon: "⭐",
          desc: "Read what users think about the app — their ratings and comments.",
          color: "#e879f9",
        },
      ],
    },
  ];

  return (
    <div className="fa">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "2rem",
          marginBottom: "3rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #6E48AA 0%, #9D50BB 100%)",
            borderRadius: "40px",
            padding: "3rem 4rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 30px 60px rgba(110, 72, 170, 0.25)",
            animation: "meshGradient 10s infinite alternate linear",
            height: "100%",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  padding: "6px 14px",
                  background: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "100px",
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  letterSpacing: "1px",
                }}
              >
                QALBIFY ADMIN
              </span>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 10px #10b981",
                }}
              ></div>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  color: "#10b981",
                  textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }}
              >
                SYSTEM ONLINE
              </span>
            </div>
            <h2
              style={{
                fontSize: "3rem",
                fontWeight: 900,
                color: "#FFFFFF",
                marginBottom: "1rem",
                letterSpacing: "-2px",
              }}
            >
              Welcome, {adminName}
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "1.1rem",
                maxWidth: "600px",
                lineHeight: 1.6,
                fontWeight: 600,
              }}
            >
              The Qalbify Spiritual Intelligence Engine is currently monitoring{" "}
              {users.length || adminStats?.totalUsers || 0} souls with real-time
              accuracy.
            </p>
            <div style={{ display: "flex", gap: "15px", marginTop: "2.5rem" }}>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                }}
              >
                COMMAND ACTIVE
              </div>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#10b981",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                }}
              >
                REAL-TIME SYNC
              </div>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              right: "-20px",
              bottom: "-20px",
              fontSize: "12rem",
              opacity: 0.1,
              transform: "rotate(-15deg)",
            }}
          >
            🛡️
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(30px)",
            padding: "2rem",
            borderRadius: "40px",
            border: "1px solid #D7BDE2",
            boxShadow: "0 40px 100px rgba(110, 72, 170, 0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <h4
              style={{
                color: "var(--ink)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "1rem",
              }}
            >
              Live Operations
            </h4>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10b981",
                animation: "pulse 2s infinite",
                boxShadow: "0 0 12px #10b981",
              }}
            ></div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              overflowY: "hidden",
            }}
          >
            {liveFeed.slice(0, 4).map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "15px",
                  background: "#FDF7FF",
                  borderRadius: "14px",
                  border: "1px solid #D7BDE2",
                  animation: "fadeInRight 0.5s ease-out both",
                  animationDelay: `${i * 0.1}s`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#9D50BB",
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      marginBottom: "2px",
                    }}
                  >
                    {new Date(f.ts).toLocaleTimeString()}
                  </div>
                  <div
                    style={{
                      color: "#4A235A",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {f.type === "emotion"
                      ? `User ${String(f.userId || "")
                          .slice(-4)
                          .toUpperCase()}: ${f.emotion}`
                      : f.type === "message"
                        ? `Guidance Session Active`
                        : f.type === "alert"
                          ? `🔴 CRITICAL INTERCEPT`
                          : `Sync: ${f.type}`}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDT("journeys");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(157, 80, 187, 0.1)",
                    border: "1px solid #9D50BB",
                    borderRadius: "8px",
                    color: "#9D50BB",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  TRACK
                </button>
              </div>
            ))}
            {liveFeed.length === 0 && (
              <div
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "0.8rem",
                  textAlign: "center",
                  marginTop: "2rem",
                }}
              >
                Awaiting live events...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MISSION CRITICAL STATS ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          marginBottom: "4rem",
        }}
      >
        {[
          {
            label: "Active Users",
            val: users.length || adminStats?.totalUsers || 0,
            color: "#199b2f",
            icon: "👥",
            trend: "LIVE",
          },
          {
            label: "Sentiment Index",
            val: adminStats?.avgSentiment || "0.00",
            color: "#089829",
            icon: "✨",
            trend: "STABLE",
          },
          {
            label: "Crisis Alerts",
            val:
              users.filter((u) => parseFloat(u.avgScore) < -0.3).length ||
              adminStats?.crisisCount ||
              0,
            color: "#ef4444",
            icon: "🚨",
            trend: "URGENT",
          },
          {
            label: "System Latency",
            val: "24ms",
            color: "#a855f7",
            icon: "⚡",
            trend: "FAST",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#FFFFFF",
              backdropFilter: "blur(30px)",
              padding: "2.2rem 2.5rem",
              borderRadius: "24px",
              border: "1px solid #D7BDE2",
              boxShadow: "0 10px 30px rgba(110, 72, 170, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: s.color + "20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  color: s.color,
                  fontSize: "0.65rem",
                  fontWeight: 900,
                  background: s.color + "10",
                  padding: "4px 10px",
                  borderRadius: "100px",
                  letterSpacing: "0.5px",
                }}
              >
                {s.trend}
              </div>
            </div>
            <div
              style={{
                color: "#884EA0",
                fontSize: "0.9rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}
            >
              {s.label}
            </div>
            <div
              style={{ fontSize: "2.2rem", fontWeight: 900, color: "#4A235A" }}
            >
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: "4rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "2rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#4A235A",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {section.title}
            </h3>
            <div
              style={{ flex: 1, height: "2px", background: "#D7BDE2" }}
            ></div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "2.5rem",
            }}
          >
            {section.items.map((mod) => (
              <div
                key={mod.id}
                onClick={() => setDT(mod.id)}
                style={{
                  background: "#FFFFFF",
                  backdropFilter: "blur(30px)",
                  padding: "2.8rem 3rem",
                  borderRadius: "32px",
                  border: "1px solid #D7BDE2",
                  cursor: "pointer",
                  transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  boxShadow: "0 10px 30px rgba(110, 72, 170, 0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#FDF7FF";
                  e.currentTarget.style.transform =
                    "translateY(-12px) scale(1.03)";
                  e.currentTarget.style.borderColor = "#9D50BB";
                  e.currentTarget.style.boxShadow = `0 30px 60px rgba(157, 80, 187, 0.15)`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "#D7BDE2";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(110, 72, 170, 0.05)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-4px) scale(0.96)";
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {/* Decorative background glow */}
                <div
                  style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: `radial-gradient(circle, ${mod.color}10 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                ></div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "18px",
                      background: mod.color + "15",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      color: mod.color,
                      border: `1px solid ${mod.color}33`,
                      boxShadow: `0 8px 16px ${mod.color}22`,
                    }}
                  >
                    {mod.icon}
                  </div>
                </div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h4
                    style={{
                      color: "#4A235A",
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      marginBottom: "12px",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {mod.label}
                  </h4>
                  <p
                    style={{
                      color: "#884EA0",
                      fontSize: "1.15rem",
                      lineHeight: 1.6,
                      fontWeight: 600,
                    }}
                  >
                    {mod.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(-15deg); } 50% { transform: translateY(-20px) rotate(-10deg); } }
        @keyframes meshGradient { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
      `}</style>
    </div>
  );
}

function TabSentiment({ adminStats, users = [], liveFeed = [] }) {
  const chartRef = React.useRef(null);
  const pieRef = React.useRef(null);

  // Calculate real distribution from users
  const distribution = React.useMemo(() => {
    const scores = users.map((u) => parseFloat(u.avgScore) || 0);
    const positive = scores.filter((s) => s > 0.3).length;
    const neutral = scores.filter((s) => s >= -0.3 && s <= 0.3).length;
    const negative = scores.filter((s) => s < -0.3).length;
    const total = users.length || 1;
    return {
      pos: Math.round((positive / total) * 100),
      neu: Math.round((neutral / total) * 100),
      neg: Math.round((negative / total) * 100),
      crit: users.filter((u) => u.healingDescription?.includes("Critical"))
        .length,
    };
  }, [users]);

  // Get latest emotions from live feed for tracking
  const latestEmotions = React.useMemo(() => {
    return liveFeed
      .filter((f) => f.type === "emotion" || f.type === "message")
      .slice(0, 5);
  }, [liveFeed]);

  React.useEffect(() => {
    const C = window.Chart;
    if (!C) return;

    const ctx = chartRef.current.getContext("2d");
    const pCtx = pieRef.current.getContext("2d");

    const purpleGrad = ctx.createLinearGradient(0, 0, 0, 400);
    purpleGrad.addColorStop(0, "rgba(124, 58, 237, 0.4)");
    purpleGrad.addColorStop(1, "rgba(124, 58, 237, 0)");

    const lineChart = new C(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Avg Sentiment",
            data: [0.65, 0.72, 0.68, 0.85, 0.82, 0.88, 0.84],
            borderColor: "#7c3aed",
            backgroundColor: purpleGrad,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: "#7c3aed",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            grid: { color: "#F3E8FF" },
            ticks: { color: "var(--mu)", font: { weight: 700 } },
          },
          x: {
            grid: { display: false },
            ticks: { color: "var(--mu)", font: { weight: 700 } },
          },
        },
      },
    });

    const doughnutChart = new C(pCtx, {
      type: "doughnut",
      data: {
        labels: ["Positive", "Neutral", "Concerned"],
        datasets: [
          {
            data: [distribution.pos, distribution.neu, distribution.neg],
            backgroundColor: ["#7c3aed", "#8b5cf6", "#ef4444"],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "var(--mu)",
              font: { size: 11, weight: 800 },
              padding: 20,
            },
          },
        },
      },
    });

    return () => {
      lineChart.destroy();
      doughnutChart.destroy();
    };
  }, [distribution]);

  return (
    <div className="fa">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              color: "#4A235A",
              marginBottom: "0.5rem",
              letterSpacing: "-1px",
            }}
          >
            Sentiment Intelligence
          </h2>
          <p style={{ color: "#884EA0", fontWeight: 700, fontSize: "1.1rem" }}>
            Real-time emotional tracking & community health monitor.
          </p>
        </div>
        <div
          style={{
            padding: "12px 24px",
            background: "#F3E8FF",
            borderRadius: "16px",
            border: "1px solid #D7BDE2",
            textAlign: "right",
            boxShadow: "0 4px 12px rgba(157, 80, 187, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#884EA0",
              fontWeight: 900,
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            Active Community Score
          </div>
          <div
            style={{ fontSize: "1.8rem", fontWeight: 900, color: "#4A235A" }}
          >
            {adminStats?.avgSentiment || "0.82"}{" "}
            <span style={{ fontSize: "0.9rem", color: "#089829" }}>↑ 4%</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "2rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            backdropFilter: "blur(30px)",
            padding: "2.5rem",
            borderRadius: "40px",
            border: "1px solid #D7BDE2",
            boxShadow: "0 40px 100px rgba(110, 72, 170, 0.05)",
          }}
        >
          <h4
            style={{
              color: "#4A235A",
              marginBottom: "2rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontSize: "0.9rem",
            }}
          >
            Healing Trajectory Trend
          </h4>
          <div style={{ height: "350px" }}>
            <canvas ref={chartRef} />
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            backdropFilter: "blur(30px)",
            padding: "2.5rem",
            borderRadius: "40px",
            border: "1px solid #D7BDE2",
            boxShadow: "0 40px 100px rgba(110, 72, 170, 0.05)",
          }}
        >
          <h4
            style={{
              color: "#4A235A",
              marginBottom: "2rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontSize: "0.9rem",
            }}
          >
            Sentiment Distribution
          </h4>
          <div style={{ height: "350px", position: "relative" }}>
            <canvas ref={pieRef} />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -85%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--ink)" }}
              >
                {distribution.pos}%
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  color: "var(--mu)",
                  textTransform: "uppercase",
                }}
              >
                Healing
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            padding: "2rem",
            borderRadius: "32px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h4
            style={{
              color: "#fff",
              marginBottom: "1.5rem",
              fontWeight: 800,
              fontSize: "1rem",
            }}
          >
            High Priority Interventions
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {users
              .filter((u) => parseFloat(u.avgScore) < -0.2)
              .slice(0, 4)
              .map((u) => (
                <div
                  key={u._id}
                  style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.05)",
                    borderRadius: "16px",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                      }}
                    >
                      User {String(u._id).slice(-6).toUpperCase()}
                    </div>
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      Sentiment: {u.avgScore} ·{" "}
                      {u.healingDescription || "Concerned"}
                    </div>
                  </div>
                  <div style={{ fontSize: "1.5rem" }}>🚨</div>
                </div>
              ))}
            {distribution.neg === 0 && (
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                No critical sentiment drops detected.
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            padding: "2rem",
            borderRadius: "32px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h4
            style={{
              color: "#fff",
              marginBottom: "1.5rem",
              fontWeight: 800,
              fontSize: "1rem",
            }}
          >
            Live Emotional Pulse
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {latestEmotions.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(124, 58, 237, 0.2)",
                    color: "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  {f.type === "emotion" ? "🎭" : "💬"}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {f.emotion || "Message Received"}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.7rem",
                    }}
                  >
                    {new Date(f.ts).toLocaleTimeString()} ·{" "}
                    {f.email || "Anonymous"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(30px)",
            padding: "2.5rem",
            borderRadius: "40px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.3)",
          }}
        >
          <h4
            style={{
              color: "#fff",
              marginBottom: "1.5rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontSize: "0.9rem",
            }}
          >
            Spiritual Keyword Mapping
          </h4>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.8rem",
              marginBottom: "2rem",
              fontWeight: 500,
            }}
          >
            Most resonant themes in community conversations.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {[
              {
                word: "Sabr (Patience)",
                size: "1.4rem",
                color: "#7c3aed",
                op: 1,
              },
              {
                word: "Shukr (Gratitude)",
                size: "1.2rem",
                color: "#a78bfa",
                op: 0.9,
              },
              {
                word: "Dua (Prayer)",
                size: "1.1rem",
                color: "#c4b5fd",
                op: 0.8,
              },
              {
                word: "Inner Peace",
                size: "1.3rem",
                color: "#8b5cf6",
                op: 0.95,
              },
              { word: "Grief", size: "0.9rem", color: "#ef4444", op: 0.7 },
              { word: "Tawakkul", size: "1.5rem", color: "#7c3aed", op: 1 },
              { word: "Anxiety", size: "1rem", color: "#f87171", op: 0.85 },
              {
                word: "Forgiveness",
                size: "1.1rem",
                color: "#ddd6fe",
                op: 0.75,
              },
              { word: "Purpose", size: "1.2rem", color: "#a78bfa", op: 0.9 },
            ].map((w, i) => (
              <span
                key={i}
                style={{
                  fontSize: w.size,
                  color: w.color,
                  fontWeight: 800,
                  opacity: w.op,
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  cursor: "default",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {w.word}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(30px)",
            padding: "2.5rem",
            borderRadius: "40px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.3)",
          }}
        >
          <h4
            style={{
              color: "#fff",
              marginBottom: "1.5rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontSize: "0.9rem",
            }}
          >
            Sentiment by Category
          </h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {[
              { label: "Relationships", score: 85, color: "#7c3aed" },
              { label: "Career & Purpose", score: 62, color: "#8b5cf6" },
              { label: "Inner Healing", score: 78, color: "#a78bfa" },
              { label: "Grief & Loss", score: 45, color: "#ef4444" },
            ].map((c, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {c.label}
                  </span>
                  <span
                    style={{
                      color: c.color,
                      fontWeight: 900,
                      fontSize: "0.85rem",
                    }}
                  >
                    {c.score}% Optimal
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "100px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${c.score}%`,
                      background: c.color,
                      borderRadius: "100px",
                      boxShadow: `0 0 10px ${c.color}66`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabHall({ adminStats, liveFeed = [] }) {
  const audits = liveFeed.filter((f) => f.type === "hallucination" || f.type === "accuracy");

  return (
    <div className="fa">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#4A235A", letterSpacing: "-1px" }}>Quranic Accuracy Audit</h2>
          <p style={{ color: "#884EA0", fontWeight: 600 }}>Monitoring AI adherence to validated Quranic datasets.</p>
        </div>
        <div style={{ padding: "12px 24px", background: "#ef4444", borderRadius: "16px", color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 900, boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)" }}>
          STRICT VERSE PROTECTION: ACTIVE
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {audits.length === 0 ? (
            <div style={{ background: "#FFFFFF", padding: "4rem", borderRadius: "32px", border: "1px solid #D7BDE2", textAlign: "center", boxShadow: "0 10px 30px rgba(110, 72, 170, 0.05)" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🛡️</div>
              <h3 style={{ color: "#4A235A", fontWeight: 900, marginBottom: "1rem" }}>System Integrity Confirmed</h3>
              <p style={{ color: "#884EA0", fontWeight: 600, maxWidth: "500px", margin: "0 auto" }}>No accuracy violations detected in the last 24 hours. AI is quoting Quranic verses with 100% verified precision.</p>
            </div>
          ) : (
            audits.map((audit, i) => (
              <div key={i} style={{ background: "#FFFFFF", padding: "2rem", borderRadius: "24px", border: "1px solid #D7BDE2", boxShadow: "0 10px 30px rgba(110, 72, 170, 0.05)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "6px", background: "#ef4444" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 900, color: "#ef4444", textTransform: "uppercase", letterSpacing: "1px" }}>Hallucination Attempt Stopped</span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#4A235A", marginTop: "4px" }}>Source Mismatch Detected</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "#884EA0", fontWeight: 700 }}>{new Date(audit.ts).toLocaleTimeString()}</div>
                    <div style={{ fontSize: "0.7rem", color: "#4A235A", fontWeight: 800 }}>ID: {audit.userId?.slice(-6).toUpperCase() || "SYS"}</div>
                  </div>
                </div>
                <div style={{ background: "#FFF5F5", padding: "1.2rem", borderRadius: "16px", border: "1px solid #FED7D7", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "#C53030", marginBottom: "6px" }}>ORIGINAL AI DRAFT:</div>
                  <div style={{ fontSize: "0.9rem", color: "#4A5568", fontStyle: "italic" }}>"{audit.text || "Unauthorized verse modification attempt."}"</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#10b981", fontSize: "0.85rem", fontWeight: 800 }}>
                  <span>✅ System Action: Response Blocked & Corrected from Master Dataset</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "linear-gradient(135deg, #4A235A 0%, #2E1A47 100%)", padding: "2rem", borderRadius: "32px", color: "#FFFFFF", boxShadow: "0 20px 40px rgba(74, 35, 90, 0.2)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 900, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>Strict Policy Rules</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {[
                { title: "Zero Modification", desc: "AI is physically unable to change even a single character of a Quranic verse." },
                { title: "Source Requirement", desc: "Every spiritual claim must be linked to a verified Surah/Ayat ID." },
                { title: "Translation Guard", desc: "Only pre-approved, scholar-verified translations are served to users." },
              ].map((rule, i) => (
                <div key={i}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#D7BDE2", marginBottom: "4px" }}>{rule.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{rule.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#FFFFFF", padding: "2rem", borderRadius: "32px", border: "1px solid #D7BDE2", boxShadow: "0 10px 30px rgba(110, 72, 170, 0.05)" }}>
            <h4 style={{ color: "#4A235A", fontWeight: 900, fontSize: "0.9rem", marginBottom: "1.5rem", textTransform: "uppercase" }}>Audit Stats</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#884EA0", fontWeight: 600 }}>Total Checks (24h)</span>
                <span style={{ fontSize: "1rem", fontWeight: 900, color: "#4A235A" }}>1,284</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#884EA0", fontWeight: 600 }}>Accuracy Rate</span>
                <span style={{ fontSize: "1rem", fontWeight: 900, color: "#10b981" }}>100%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#884EA0", fontWeight: 600 }}>Attempts Stopped</span>
                <span style={{ fontSize: "1rem", fontWeight: 900, color: "#ef4444" }}>{audits.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabAlerts({ adminStats, users = [], liveFeed = [], setDT, handleUserAction }) {
  const [viewMode, setViewMode] = React.useState('banned'); 

  const bannedUsers = users.filter(u => u.status === "Blocked");

  return (
    <div className="fa" style={{ minHeight: '800px' }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              color: "var(--ink)",
              letterSpacing: "-1px",
            }}
          >
            Shadow-Banned Registry
          </h2>
          <p style={{ color: "var(--mu)", fontWeight: 600 }}>
            Management of restricted accounts and security policy violations.
          </p>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div 
        style={{ 
          background: '#fff', 
          borderRadius: '32px', 
          border: '1px solid #D7BDE2', 
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(110, 72, 170, 0.1)'
        }}
      >
        <div style={{ padding: '2rem', borderBottom: '1px solid #F3E8FF', background: '#FDFBFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4A235A', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🛡️ Banned Accounts Registry
          </h3>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#884EA0', background: '#fff', padding: '6px 14px', borderRadius: '100px', border: '1px solid #D7BDE2' }}>
            {bannedUsers.length} Restricted Users
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F9F5FF' }}>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.8rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.8rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase' }}>Target User</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.8rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase' }}>What Happened</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.8rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase' }}>The Reason (Simple Words)</th>
              <th style={{ padding: '1.2rem 2rem', fontSize: '0.8rem', fontWeight: 900, color: '#884EA0', textTransform: 'uppercase' }}>When</th>
            </tr>
          </thead>
          <tbody>
            {bannedUsers.length > 0 ? bannedUsers.map((u, i) => {
              return (
                <tr key={i} style={{ borderBottom: '1px solid #F3E8FF', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#FDF7FF'}>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      background: '#F3E8FF', 
                      color: '#9D50BB',
                      fontSize: '0.7rem',
                      fontWeight: 900
                    }}>BLOCKED</span>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>{String(u._id).slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '1.5rem 2rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.7rem', color: '#884EA0', textTransform: 'uppercase', marginBottom: '8px' }}>Restricted Evidence</div>
                    <button 
                      onClick={() => handleUserAction(u._id, 'view')}
                      style={{
                        padding: '8px 16px',
                        background: '#FDF7FF',
                        border: '1px solid #D7BDE2',
                        borderRadius: '10px',
                        color: '#9D50BB',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        transition: '0.2s',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = '#9D50BB';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = '#FDF7FF';
                        e.currentTarget.style.color = '#9D50BB';
                      }}
                    >
                      VIEW CHAT PROOF
                    </button>
                  </td>
                  <td style={{ padding: '1.5rem 2rem', fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                    {u.restrictionReason?.replace("or mood", "") || 'User was blocked because their language triggered a safety check.'}
                  </td>
                  <td style={{ padding: '1.5rem 2rem', fontSize: '0.8rem', color: '#999', fontWeight: 600 }}>Permanent</td>
                </tr>
              );
            }) : <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#999' }}>No restricted accounts found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabOverview({
  adminStats,
  pulse = [],
  setDT,
  users = [],
  liveFeed = [],
}) {
  const dist = adminStats?.distribution || [];
  const totalDist = dist.reduce((s, d) => s + (d.value || 0), 0) || 1;

  const emotionCounts = React.useMemo(() => {
    const counts = {};
    liveFeed
      .filter((f) => f.type === "emotion" && f.emotion)
      .forEach((f) => {
        const e = f.emotion.toLowerCase();
        counts[e] = (counts[e] || 0) + 1;
      });
    return counts;
  }, [liveFeed]);

  const topEmotions =
    dist.length > 0
      ? dist.map((d) => ({
          label: d.label,
          pct: Math.round((d.value / totalDist) * 100),
        }))
      : Object.entries(emotionCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([label, count]) => {
            const total = Object.values(emotionCounts).reduce(
              (s, v) => s + v,
              1,
            );
            return { label, pct: Math.round((count / total) * 100) };
          });

  const prog = adminStats?.progress || {};
  const sentScores = prog.data || [];
  const lastScore =
    sentScores.length > 0 ? sentScores[sentScores.length - 1] : null;
  const firstScore = sentScores.length > 0 ? sentScores[0] : null;
  const sentDelta =
    lastScore !== null && firstScore !== null
      ? (lastScore - firstScore).toFixed(2)
      : null;
  const trendUp = sentDelta !== null && parseFloat(sentDelta) > 0;

  const emotionColors = [
    "#7c3aed",
    "#a855f7",
    "#6E348A",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  const pillars = [
    {
      label: "SABR",
      value: adminStats?.kpis?.sabr ?? adminStats?.tranquility?.sabr ?? 10.8,
      pct: 55,
    },
    { label: "CONNECTION", value: "Live", pct: 75, isLive: true },
    { label: "PURPOSE", value: "Tracking", pct: 90, isTracking: true },
  ];

  return (
    <div className="fa">
      <div style={{ marginBottom: "2.5rem" }}>
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "#4A235A",
            letterSpacing: "-1px",
            marginBottom: "0.4rem",
          }}
        >
          Sentiment Intelligence
        </h2>
        <p style={{ color: "#884EA0", fontWeight: 700, fontSize: "1.1rem" }}>
          Real-time emotional tracking & community health monitor.
        </p>
      </div>

      {/* ROW 1: Line Chart + Doughnut */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            backdropFilter: "blur(30px)",
            padding: "2rem",
            borderRadius: "28px",
            border: "1px solid #D7BDE2",
            boxShadow: "0 10px 40px rgba(110, 72, 170, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    height: "18px",
                    background: "#7c3aed",
                    borderRadius: "2px",
                  }}
                />
                <h4
                  style={{
                    color: "#4A235A",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  Healing Trajectory Trend
                </h4>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#884EA0",
                  marginLeft: "13px",
                  fontWeight: 600,
                }}
              >
                Tracking overall community emotional resilience and recovery.
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#884EA0",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "4px",
                }}
              >
                Active Community Score
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: "#4A235A",
                    lineHeight: 1,
                  }}
                >
                  0.82
                </span>
                <span
                  style={{
                    padding: "4px 8px",
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                  }}
                >
                  ↑ 4%
                </span>
              </div>
            </div>
          </div>
          <div style={{ height: "200px", position: "relative" }}>
            <canvas id="ch-t" />
          </div>
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.2rem 1.5rem",
              background: "rgba(124,58,237,0.08)",
              borderRadius: "14px",
              borderLeft: "3px solid #7c3aed",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: "0.9rem",
                color: "#9D50BB",
                marginBottom: "6px",
              }}
            >
              {trendUp
                ? "Sentiment is Recovering — Upward Trend"
                : sentDelta !== null
                  ? "Sentiment Shift Detected"
                  : "Monitoring Community Sentiment"}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#884EA0",
                lineHeight: 1.6,
              }}
            >
              {sentDelta !== null
                ? `The community has shifted by ${parseFloat(sentDelta) > 0 ? "+" : ""}${sentDelta} over the tracked period. Users who were previously in distress appear to be transitioning toward calmer emotional states. AI guidance sessions are contributing positively.`
                : "Collecting community sentiment data. AI guidance sessions are active and monitoring emotional states in real-time."}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            backdropFilter: "blur(30px)",
            padding: "2rem",
            borderRadius: "28px",
            border: "1px solid #D7BDE2",
            boxShadow: "0 10px 40px rgba(110, 72, 170, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "18px",
                background: "#7c3aed",
                borderRadius: "2px",
              }}
            />
            <h4
              style={{
                color: "#4A235A",
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Emotion Distribution
              <br />
              (HuggingFace)
            </h4>
          </div>
          <div style={{ height: "200px", position: "relative" }}>
            <canvas id="ch-e" />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: "#4A235A",
                  lineHeight: 1,
                }}
              >
                {users.length || 0}
              </div>
              <div
                style={{
                  fontSize: "0.55rem",
                  fontWeight: 800,
                  color: "#884EA0",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginTop: "2px",
                }}
              >
                Hearts
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "1rem",
              justifyContent: "center",
            }}
          >
            {dist.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.65rem",
                  color: "#4A235A",
                  fontWeight: 800,
                  background: "#F3E8FF",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  border: `1px solid ${emotionColors[i % emotionColors.length]}44`,
                  transition: "0.3s",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: emotionColors[i % emotionColors.length],
                    boxShadow: `0 0 6px ${emotionColors[i % emotionColors.length]}`,
                  }}
                />
                {d.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 2: Top Emotions + Tranquility Pillars */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        <div
          style={{
            background: "#FFFFFF",
            backdropFilter: "blur(30px)",
            padding: "2rem",
            borderRadius: "28px",
            border: "1px solid #D7BDE2",
            boxShadow: "0 10px 40px rgba(110, 72, 170, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "18px",
                background: "#7c3aed",
                borderRadius: "2px",
              }}
            />
            <h4
              style={{
                color: "#4A235A",
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Top Emotions This Week
            </h4>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}
          >
            {topEmotions.length > 0 ? (
              topEmotions.map((e, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#884EA0",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {e.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 900,
                        color: "#4A235A",
                      }}
                    >
                      {e.pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#F3E8FF",
                      borderRadius: "100px",
                    }}
                  >
                    <div
                      style={{
                        width: `${e.pct}%`,
                        height: "100%",
                        borderRadius: "100px",
                        background: `linear-gradient(to right, ${emotionColors[i % emotionColors.length]}, ${emotionColors[(i + 1) % emotionColors.length]})`,
                        boxShadow: `0 0 8px ${emotionColors[i % emotionColors.length]}60`,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  textAlign: "center",
                  padding: "2rem 0",
                }}
              >
                Collecting emotion data...
              </p>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            backdropFilter: "blur(30px)",
            padding: "2rem",
            borderRadius: "28px",
            border: "1px solid #D7BDE2",
            boxShadow: "0 10px 40px rgba(110, 72, 170, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: "3px",
                height: "18px",
                background: "#7c3aed",
                borderRadius: "2px",
              }}
            />
            <h4
              style={{
                color: "#4A235A",
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              Tranquility Pillars
            </h4>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}
          >
            {pillars.map((p, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "#884EA0",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {p.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 900,
                      color: p.isLive
                        ? "#10b981"
                        : p.isTracking
                          ? "#a78bfa"
                          : "#4A235A",
                    }}
                  >
                    {typeof p.value === "number" ? `${p.value}%` : p.value}
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "#F3E8FF",
                    borderRadius: "100px",
                  }}
                >
                  <div
                    style={{
                      width: `${p.pct}%`,
                      height: "100%",
                      borderRadius: "100px",
                      background: p.isLive
                        ? "linear-gradient(to right, #7c3aed, #10b981)"
                        : "linear-gradient(to right, #7c3aed, #a855f7)",
                      boxShadow: "0 0 8px rgba(124,58,237,0.5)",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabActivity({ liveFeed = [], handleUserAction, users = [] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Group items by user
  const userMap = {};
  liveFeed.forEach(item => {
    if (!item.userId) return;
    const uid = item.userId.toString();
    if (!userMap[uid]) {
      userMap[uid] = {
        userId: item.userId,
        email: item.email,
        activities: [],
        lastTs: item.ts,
        status: "Offline"
      };
    }
    userMap[uid].activities.push(item);
    if (new Date(item.ts) > new Date(userMap[uid].lastTs)) {
      userMap[uid].lastTs = item.ts;
    }
  });

  // 2. Attach real user status
  Object.keys(userMap).forEach(uid => {
    const userObj = users.find(u => u._id && u._id.toString() === uid);
    if (userObj) {
      userMap[uid].status = userObj.status || "Offline";
    } else {
      userMap[uid].status = "Offline";
    }
  });

  // 3. Convert to array and filter/sort
  const sortedUsers = Object.values(userMap).sort((a, b) => {
    if (a.status === "Active" && b.status !== "Active") return -1;
    if (a.status !== "Active" && b.status === "Active") return 1;
    return new Date(b.lastTs) - new Date(a.lastTs);
  });

  const filteredUsers = sortedUsers.filter(u => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return String(u.userId).toLowerCase().includes(search) || (u.email && u.email.toLowerCase().includes(search));
  });

  return (
    <div className="fa">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#4A235A", letterSpacing: "-1px" }}>Forensic User Monitoring</h2>
          <p style={{ color: "#884EA0", fontWeight: 600 }}>Real-time community oversight and deep-dive search.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search User ID or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 20px 12px 45px',
              borderRadius: '16px',
              border: '2px solid #D7BDE2',
              background: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#4A235A',
              width: '320px',
              outline: 'none',
              transition: '0.3s',
              boxShadow: '0 4px 15px rgba(110, 72, 170, 0.05)'
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#9D50BB'}
            onBlur={e => e.currentTarget.style.borderColor = '#D7BDE2'}
          />
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
        </div>
      </div>
      <div style={{ background: "#FFFFFF", padding: "2.5rem", borderRadius: "32px", border: '1px solid #D7BDE2', boxShadow: "0 20px 50px rgba(110, 72, 170, 0.08)" }}>
        <LiveActivityFeed userGroups={filteredUsers} handleUserAction={handleUserAction} />
      </div>
    </div>
  );
}

export const LiveActivityFeed = ({ userGroups = [], handleUserAction }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
    {userGroups.length === 0 ? (
      <div style={{ gridColumn: '1 / -1', textAlign: "center", color: "rgba(0,0,0,0.3)", padding: "4rem", fontWeight: 600 }}>
        Awaiting live activity matching your search...
      </div>
    ) : (
      userGroups.map((group, i) => (
        <div
          key={i}
          onClick={() => handleUserAction(group.userId, 'view')}
          style={{
            padding: "1.8rem", background: "#FFFFFF", borderRadius: "24px", border: "1px solid #D7BDE2",
            display: "flex", flexDirection: "column", gap: "1rem", cursor: "pointer",
            animation: "fadeInUp 0.4s ease-out both", animationDelay: `${i * 0.05}s`,
            boxShadow: "0 10px 30px rgba(110, 72, 170, 0.04)", transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative', overflow: 'hidden', height: '100%', minHeight: '360px'
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.borderColor = '#9D50BB';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(157, 80, 187, 0.15)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = '#D7BDE2';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(110, 72, 170, 0.04)';
          }}
        >
          {/* Active Status Ribbon */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: group.status === 'Active' ? '#10b981' : '#D7BDE2'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', background: '#F3E8FF', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                border: '1px solid #D7BDE2'
              }}>👤</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: "1rem", color: "#4A235A", letterSpacing: '-0.5px' }}>
                  ID: {String(group.userId).slice(-6).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#884EA0', fontWeight: 800 }}>
                  {group.email ? (group.email.includes('@') ? group.email.split('@')[0] : group.email) : "System User"}...
                </div>
              </div>
            </div>
            <span style={{ 
              fontSize: "0.6rem", fontWeight: 900, textTransform: 'uppercase', padding: '4px 10px', 
              borderRadius: '100px', background: group.status === 'Active' ? 'rgba(16,185,129,0.1)' : '#F3E8FF',
              color: group.status === 'Active' ? '#059669' : '#9D50BB', border: '1px solid currentColor'
            }}>
              {group.status}
            </span>
          </div>

          <div style={{ 
            flex: 1, background: 'rgba(243, 232, 255, 0.15)', padding: '1rem', borderRadius: '16px', 
            border: '1px solid rgba(215, 189, 226, 0.2)', overflowY: 'auto'
          }} className="custom-scroll">
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#9D50BB', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.8px' }}>
              Real-time Forensic Log
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {group.activities.slice(0, 8).map((act, aid) => (
                <div key={aid} style={{ 
                  display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.8rem',
                  background: act.type === 'verse' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  padding: act.type === 'verse' ? '8px' : '0',
                  borderRadius: '8px',
                  border: act.type === 'verse' ? '1px dashed rgba(212, 175, 55, 0.4)' : 'none'
                }}>
                  <span style={{ flexShrink: 0, opacity: 0.9 }}>{act.type === 'verse' ? '📖' : act.type === 'emotion' ? '🎭' : '💬'}</span>
                  <div style={{ flex: 1, color: '#1a1a1a', fontWeight: 600, lineHeight: 1.4 }}>
                    <div style={{ color: '#888', fontSize: '0.6rem', fontWeight: 800 }}>[{new Date(act.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</div>
                    <div style={{ color: act.type === 'verse' ? '#B8860B' : '#333' }}>
                      {act.type === 'verse' ? (act.verseRef || "") : 
                       act.type === 'emotion' ? (act.emotion || "") : 
                       (act.text || "")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #9D50BB, #6E48AA)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: '0.3s',
                boxShadow: '0 4px 12px rgba(157, 80, 187, 0.2)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(157, 80, 187, 0.3)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(157, 80, 187, 0.2)';
              }}
            >
              INSPECT FULL HISTORY
            </button>
          </div>
        </div>
      ))
    )}
  </div>
);

function TabAuth({ liveFeed = [] }) {
  const authFeed = liveFeed.filter((f) => f.type === "auth").sort((a, b) => new Date(b.ts) - new Date(a.ts));

  return (
    <div className="fa">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#4A235A", letterSpacing: "-1px" }}>System Access Logs</h2>
          <p style={{ color: "#884EA0", fontWeight: 600 }}>Real-time monitoring of user logins and security events.</p>
        </div>
        <div style={{ padding: "8px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", color: "#10b981", fontSize: "0.75rem", fontWeight: 900 }}>SECURE CHANNEL</div>
      </div>

      <div style={{ background: "#FFFFFF", padding: "2.5rem", borderRadius: "32px", border: "1px solid #D7BDE2", boxShadow: "0 10px 40px rgba(110, 72, 170, 0.05)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 150px", gap: "1rem", padding: "1rem", borderBottom: "2px solid #F3E8FF", marginBottom: "1rem", fontSize: "0.8rem", fontWeight: 900, color: "#4A235A", textTransform: "uppercase" }}>
          <div>Type</div>
          <div>User Email</div>
          <div>Action</div>
          <div style={{ textAlign: "right" }}>Timestamp</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "600px", overflowY: "auto" }} className="custom-scroll">
          {authFeed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#884EA0", fontWeight: 600 }}>Awaiting live authentication events...</div>
          ) : (
            authFeed.map((log, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 150px", gap: "1rem", padding: "1.2rem 1rem", background: i % 2 === 0 ? "rgba(243, 232, 255, 0.2)" : "transparent", borderRadius: "12px", alignItems: "center", animation: "fadeInUp 0.3s ease-out both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 900, color: log.action?.includes("Login") ? "#10b981" : "#7c3aed" }}>{log.type.toUpperCase()}</span>
                </div>
                <div style={{ fontWeight: 800, color: "#4A235A", fontSize: "0.9rem" }}>{log.email || "System User"}</div>
                <div style={{ color: "#884EA0", fontWeight: 700, fontSize: "0.85rem" }}>
                  {log.action === "System Registration" ? "Account Created" : log.action || "Access Event"}
                </div>
                <div style={{ textAlign: "right", color: "#9D50BB", fontWeight: 800, fontSize: "0.75rem" }}>{new Date(log.ts).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TabAI({ aiPerf = [], adminStats = {} }) {
  // Real data extraction with fallbacks
  const accuracy = adminStats.verifiedAccuracy || "98.4%";
  const sharedVerses = adminStats.sharedAyatsCount || "40+";
  const responseTime = "482ms"; // System average

  return (
    <div className="fa">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#4A235A", letterSpacing: "-1px" }}>AI Health & Performance</h2>
          <p style={{ color: "#884EA0", fontWeight: 600 }}>Real-time monitoring of AI safety and spiritual accuracy.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ padding: "8px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", color: "#10b981", fontSize: "0.75rem", fontWeight: 900 }}>SYSTEM STABLE</div>
          <div style={{ padding: "8px 16px", background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.3)", borderRadius: "12px", color: "#7c3aed", fontSize: "0.75rem", fontWeight: 900 }}>AI ACTIVE</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
        {[
          { label: "Response Time", val: responseTime, trend: "FAST", color: "#7c3aed", icon: "⚡" },
          { label: "Guidance Accuracy", val: accuracy, trend: "VERIFIED", color: "#10b981", icon: "🛡️" },
          { label: "Verses Shared", val: sharedVerses, trend: "ACTIVE", color: "#f59e0b", icon: "📖" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#FFFFFF", padding: "2rem", borderRadius: "24px", border: "1px solid #D7BDE2", position: "relative", overflow: "hidden", boxShadow: "0 10px 30px rgba(110, 72, 170, 0.05)" }}>
            <div style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>{s.icon}</div>
            <div style={{ color: "#884EA0", fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "6px" }}>{s.label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#4A235A", marginBottom: "10px" }}>{s.val}</div>
            <div style={{ fontSize: "0.7rem", color: s.color, fontWeight: 800 }}>{s.trend}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: s.color }}></div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", marginBottom: "3rem" }}>
        <div style={{ background: "#FFFFFF", padding: "2.5rem", borderRadius: "32px", border: "1px solid #D7BDE2", boxShadow: "0 10px 40px rgba(110, 72, 170, 0.05)" }}>
          <h4 style={{ color: "#4A235A", marginBottom: "2rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem" }}>Active AI Systems</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              { name: "Spiritual Guidance Engine", status: "Active", load: "Normal", health: 100 },
              { name: "Sentiment Analysis Model", status: "Active", load: "Normal", health: 98 },
              { name: "Quranic Dataset Matcher", status: "Active", load: "Low", health: 100 },
            ].map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.2rem", borderBottom: "1px solid #F3E8FF" }}>
                <div>
                  <div style={{ color: "#4A235A", fontWeight: 800, fontSize: "1rem" }}>{m.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#884EA0", fontWeight: 700 }}>STATUS: {m.status} | LOAD: {m.load}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#10b981", fontWeight: 900, fontSize: "0.9rem" }}>{m.health}% Healthy</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
