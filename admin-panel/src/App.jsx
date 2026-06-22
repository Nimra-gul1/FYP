import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { API_BASE, HF_URL, HF_KEY, headers, socket, VERSES, CSS, adminAuthStyles } from "./utils/constants.js";
import { AuthPage } from "./components/AuthPage.jsx";
import { UserModal } from "./components/UserModal.jsx";
import { UserJourneyModal } from "./components/UserJourneyModal.jsx";
import { AdminDashboard } from "./components/AdminDashboard.jsx";

function QalbifyApp() {
  const [token, setToken] = useState(localStorage.getItem("qb_tok") || "");
  const [page, setPage] = useState(localStorage.getItem("qb_tok") ? "admin" : "login");
  const [role, setRole] = useState(localStorage.getItem("qb_role") || "user");
  const [adminStats, setAdminStats] = useState(null);
  const [selUser, setSelUser] = useState(null);
  const [journeyUser, setJourneyUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [dashTab, setDT] = useState("home");
  const [activeAlertTab, setActiveAlertTab] = useState("alerts");
  const [hallView, setHallView] = useState("all");
  const [lMode, setLMode] = useState("login");
  const [lBusy, setLBusy] = useState(false);
  const [lForm, setLForm] = useState({ name: "", email: "", password: "", confirmPassword: "", adminKey: "" });
  const [lErr, setLErr] = useState("");
  const [lSuccess, setLSuccess] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // --- New Advanced States ---
  const [liveFeed, setLiveFeed] = useState([]);
  const [pulse, setPulse] = useState([]);
  const [aiPerf, setAiPerf] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [userFilters, setUserFilters] = useState({ status: "all", search: "" });
  const [contentVerses, setContentVerses] = useState([]);
  const [activityFilter, setActivityFilter] = useState("all");
  const [isDataLoading, setIsDataLoading] = useState(false);

  // --- WebSocket Setup ---
  useEffect(() => {
    if (token && page === "admin") {
      socket.auth = { token };
      socket.connect();

      socket.on("connect", () => console.log("✅ WebSocket Connected"));
      socket.on("activity_feed", (data) => {
        setLiveFeed(prev => [data, ...prev].slice(0, 600));
        setPulse(prev => [data, ...prev].slice(0, 10));
        if (data.type === "verse" || data.type === "crisis") fetchAdminData(true);
      });

      return () => {
        socket.disconnect();
        socket.off("activity_feed");
        socket.off("connect");
      };
    }
  }, [token, page]);

  const handleAdminAuthSubmit = async () => {
    setLErr("");
    setLSuccess("");
    if (lMode === "login") {
      if (!lForm.email || !lForm.password) { setLErr("All fields are required."); return; }
      await doAuth();
    } else {
      if (!lForm.name || !lForm.email || !lForm.password || !lForm.confirmPassword || !lForm.adminKey) {
        setLErr("All fields are required."); return;
      }
      if (lForm.password !== lForm.confirmPassword) {
        setLErr("Passwords do not match."); return;
      }
      if (lForm.password.length < 8) {
        setLErr("Password must be at least 8 characters."); return;
      }
      await doAuth();
    }
  };

  const handleInput = (field) => (e) => {
    setLForm((f) => ({ ...f, [field]: e.target.value }));
    setLErr("");
  };

  const getInputStyle = (field) => ({
    ...adminAuthStyles.input,
    padding: lMode === "signup" ? "8px 12px" : "13px 16px",
    borderColor: focusedField === field ? `rgba(168, 85, 247, 0.5)` : "rgba(255,255,255,0.12)",
    boxShadow: focusedField === field ? `0 0 0 2px rgba(168, 85, 247, 0.1)` : "none",
  });
  const charts = useRef({});

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    if (!window.Chart) {
      const sc = document.createElement("script");
      sc.src =
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
      sc.onload = () => drawCharts(dashTab);
      document.head.appendChild(sc);
    }
    if (token && role === "admin") fetchAdminData();
    return () => {
      try {
        document.head.removeChild(s);
      } catch { /* ignore */ }
    };
  }, []);

  const fetchAdminData = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setIsDataLoading(true);
    try {
      const [sR, uR, hR] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, { headers: headers(token) }),
        fetch(`${API_BASE}/api/admin/users`, { headers: headers(token) }),
        fetch(`${API_BASE}/api/admin/activity-history`, { headers: headers(token) }),
      ]);
      
      if (sR.status === 401 || sR.status === 403) {
        logout();
        return;
      }
      
      if (sR.ok) setAdminStats(await sR.json());
      if (uR.ok) setUsers(await uR.json());
      if (hR.ok) {
        const hist = await hR.json();
        setLiveFeed(prev => {
          const combined = [...prev, ...hist];
          const unique = Array.from(new Map(combined.map(item => [item.ts + item.userId, item])).values());
          const sorted = unique.sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 600);
          if (pulse.length === 0) setPulse(sorted.slice(0, 10));
          return sorted;
        });
      }
    } catch { /* ignore */ }
    finally {
      setIsDataLoading(false);
    }
  }, [token, pulse.length]);

  async function handleUserAction(uid, action, extra = {}) {
    if (action === "view" || action === "journey") {
      try {
        const r = await fetch(`${API_BASE}/api/admin/users/${uid}/details`, {
          headers: headers(token),
        });
        if (!r.ok) throw new Error("Failed to fetch details");
        const data = await r.json();
        if (action === "view") setSelUser(data);
        if (action === "journey") setJourneyUser(data);
      } catch (e) {
        alert(e.message);
      }
      return;
    }

    if (action === "guidance") {
      try {
        const r = await fetch(`${API_BASE}/api/admin/users/${uid}/ai-guidance`, {
          method: "POST",
          headers: headers(token),
          body: JSON.stringify({ instructions: extra.instructions }),
        });
        if (r.ok) fetchAdminData();
      } catch (e) {
        alert("Action failed: " + e.message);
      }
      return;
    }

    if (!token) return;

    let reason = extra?.reason || "System Intercept: Automated Moderation / Policy Violation";

    try {
      const r = await fetch(`${API_BASE}/api/admin/users/${uid}/action`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ action, reason }),
      });
      if (r.ok) fetchAdminData();
    } catch (e) {
      alert("Action failed: " + e.message);
    }
  }
  useEffect(() => {
    if (page === "admin") {
      fetchAdminData();
      const interval = setInterval(() => {
        fetchAdminData(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [page, fetchAdminData]);
  useEffect(() => {
    // Immediate scroll to top when tab changes
    window.scrollTo(0, 0);
    // Secondary safety scroll after render
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
      drawCharts(dashTab);
    }, 100);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashTab]);

  useEffect(() => {
    drawCharts(dashTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, adminStats]);



  const logout = () => {
    localStorage.clear();
    setToken("");
    setRole("user");
    setPage("login");
  };

  async function doAuth() {
    setLBusy(true);
    setLErr("");
    try {
      const url =
        lMode === "login"
          ? `${API_BASE}/api/auth/login`
          : `${API_BASE}/api/auth/signup`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Auth failed");

      localStorage.setItem("qb_tok", d.token);
      const userRole = d.role || "user";
      localStorage.setItem("qb_role", userRole);

      setToken(d.token);
      setRole(userRole);
      setPage("admin");
    } catch (e) {
      setLErr(e.message);
    } finally {
      setLBusy(false);
    }
  }



  // ─── DASHBOARD CHARTS ──────────────────────────────────────────────────
  function drawCharts(tab) {
    // Small delay to ensure DOM nodes are ready after React render cycle
    setTimeout(() => {
      Object.values(charts.current).forEach((c) => {
        try {
          c.destroy();
        } catch { /* ignore */ }
      });
      charts.current = {};
      const C = window.Chart;
      if (!C) return;
      const purple = "#9D50BB",
        gold = "#6E48AA",
        ok = "#8b5cf6";
      const gridColor = "rgba(157, 80, 187, 0.08)";
      const labelColor = "#4A235A";

      if (tab === "overview") {
        const c1 = document.getElementById("ch-t");
        const prog = adminStats?.progress || {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          data: [0, 0, 0, 0, 0, 0, 0],
        };
        if (c1)
          charts.current.t = new C(c1, {
            type: "line",
            data: {
              labels: prog.labels,
              datasets: [
                {
                  label: "Avg Sentiment",
                  data: prog.data,
                  borderColor: purple,
                  backgroundColor: "rgba(157,80,187,.1)",
                  tension: 0.45,
                  fill: true,
                  pointBackgroundColor: purple,
                  pointRadius: 4,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { min: -1, max: 1, grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 10, weight: 600 } } },
                x: { grid: { display: false }, ticks: { color: labelColor, font: { size: 10, weight: 600 } } },
              },
            },
          });
        const c2 = document.getElementById("ch-e");
        const dist = adminStats?.distribution || [];
        if (c2)
          charts.current.e = new C(c2, {
            type: "doughnut",
            data: {
              labels: dist.map((d) => d.label) || ["None"],
              datasets: [
                {
                  data: dist.map((d) => d.value) || [100],
                  backgroundColor: [
                    "#9D50BB",
                    "#6E48AA",
                    "#8b5cf6",
                    "#c084fc",
                    "#d8b4fe",
                    "#f3e8ff",
                    "#10b981",
                  ],
                  borderWidth: 2,
                  borderColor: "#ffffff",
                  hoverOffset: 15,
                  borderRadius: 10,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "#4A235A",
                  titleFont: { size: 14, weight: 800 },
                  bodyFont: { size: 13 },
                  padding: 12,
                  cornerRadius: 12,
                  displayColors: true,
                }
              },
              cutout: "82%",
            },
          });
      }

      if (tab === "sentiment") {
        const c3 = document.getElementById("ch-u");
        if (c3)
          charts.current.u = new C(c3, {
            type: "line",
            data: {
              labels: adminStats?.sentimentTrends?.weeks || [
                "Wk1",
                "Wk2",
                "Wk3",
                "Wk4",
                "Wk5",
                "Wk6",
                "Wk7",
                "Wk8",
              ],
              datasets: [
                {
                  label: "Sentiment Score",
                  data: adminStats?.sentimentTrends?.sentimentScores || [
                    -0.8, -0.65, -0.5, -0.3, -0.1, 0.1, 0.25, 0.42,
                  ],
                  borderColor: purple,
                  tension: 0.4,
                  fill: false,
                  pointBackgroundColor: purple,
                  pointRadius: 4,
                },
                {
                  label: "Tranquility Index",
                  data: adminStats?.sentimentTrends?.tranquilityScores || [
                    0.1, 0.12, 0.2, 0.28, 0.35, 0.4, 0.48, 0.55,
                  ],
                  borderColor: gold,
                  tension: 0.4,
                  fill: false,
                  pointBackgroundColor: gold,
                  pointRadius: 4,
                  borderDash: [5, 3],
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { min: -1, max: 1, grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 10, weight: 600 } } },
                x: { grid: { display: false }, ticks: { color: labelColor, font: { size: 10, weight: 600 } } },
              },
            },
          });
        const c4 = document.getElementById("ch-d");
        if (c4)
          charts.current.d = new C(c4, {
            type: "radar",
            data: {
              labels: adminStats?.radarPattern?.labels || [
                "Grief",
                "Anxiety",
                "Hope",
                "Gratitude",
                "Acceptance",
                "Peace",
              ],
              datasets: [
                {
                  label: "Wk 1",
                  data: adminStats?.radarPattern?.data1 || [90, 80, 10, 5, 8, 5],
                  backgroundColor: "rgba(157,80,187,.13)",
                  borderColor: purple,
                  pointBackgroundColor: purple,
                },
                {
                  label: "Current Wk",
                  data: adminStats?.radarPattern?.data2 || [
                    40, 35, 55, 48, 50, 45,
                  ],
                  backgroundColor: "rgba(34,197,94,.1)",
                  borderColor: ok,
                  pointBackgroundColor: ok,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 0,
                  max: 100,
                  grid: { color: gridColor },
                  angleLines: { color: gridColor },
                  pointLabels: { color: labelColor, font: { size: 10, weight: 700 } },
                  ticks: { display: false },
                },
              },
            },
          });
      }

      if (tab === "hallucination") {
        const c5 = document.getElementById("ch-a");
        if (c5)
          charts.current.a = new C(c5, {
            type: "bar",
            data: {
              labels: adminStats?.hallucinationBarStats?.labels || [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun",
              ],
              datasets: [
                {
                  label: "Accurate",
                  data: adminStats?.hallucinationBarStats?.accurate || [
                    12, 19, 15, 17, 22, 20, 25,
                  ],
                  backgroundColor: ok,
                  borderRadius: 6,
                },
                {
                  label: "Flagged",
                  data: adminStats?.hallucinationBarStats?.flagged || [
                    1, 2, 1, 0, 3, 1, 2,
                  ],
                  backgroundColor: "#ef4444",
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              scales: {
                x: { stacked: true, grid: { display: false } },
                y: { stacked: true, grid: { color: gridColor } },
              },
            },
          });
      }
    }, 50);
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────

  // --- SAFETY CHECK ---
  if (!page) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Qalbify System...</div>;

  return (
    <div style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* User Detail Modal */}
      {selUser && <UserModal selUser={selUser} setSelUser={setSelUser} />}
      {journeyUser && <UserJourneyModal journeyUser={journeyUser} setJourneyUser={setJourneyUser} />}

      {page === "login" ? (
        <AuthPage 
          page={page} 
          lMode={lMode} 
          setLMode={setLMode} 
          lErr={lErr} 
          setLErr={setLErr} 
          lSuccess={lSuccess} 
          setLSuccess={setLSuccess} 
          lForm={lForm} 
          focusedField={focusedField} 
          setFocusedField={setFocusedField} 
          lBusy={lBusy} 
          handleAdminAuthSubmit={handleAdminAuthSubmit} 
          handleInput={handleInput} 
        />
      ) : (
        <AdminDashboard 
          role={role}
          page={page}
          setPage={setPage}
          logout={logout}
          dashTab={dashTab}
          setDT={setDT}
          pulse={pulse}
          adminStats={adminStats}
          users={users}
          userFilters={userFilters}
          setUserFilters={setUserFilters}
          fetchAdminData={fetchAdminData}
          handleUserAction={handleUserAction}
          isDataLoading={isDataLoading}
          hallView={hallView}
          setHallView={setHallView}
          activeAlertTab={activeAlertTab}
          setActiveAlertTab={setActiveAlertTab}
          liveFeed={liveFeed}
          activityFilter={activityFilter}
          setActivityFilter={setActivityFilter}
          aiPerf={aiPerf}
          contentVerses={contentVerses}
        />
      )}
    </div>
  );
}

export default function AppWrapper() {
  return <QalbifyApp />;
}
