import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "../styles/Dashboard.css";

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

const statusStyle = (status) => {
  if (status === "active")  return { bg: "#dcfce7", color: "#16a34a" };
  if (status === "pending") return { bg: "#fef9c3", color: "#ca8a04" };
  if (status === "closed")  return { bg: "#f1f5f9", color: "#64748b" };
  return { bg: "#f1f5f9", color: "#64748b" };
};

const statusLabel = (s) => {
  if (s === "active")  return "Active";
  if (s === "pending") return "Pending";
  if (s === "closed")  return "Closed";
  return s;
};

const CitizenDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, show: showToast } = useToast();

  // Guard: redirect non-citizens immediately
  useEffect(() => {
    const role = user?.role || localStorage.getItem("role");
    if (!role) { navigate("/login", { replace: true }); return; }
    if (role !== "citizen") { navigate("/official-dashboard", { replace: true }); }
  }, [user]);

  const [stats, setStats] = useState({ pending: 0, active: 0, closed: 0, total: 0 });
  const [petitions, setPetitions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [responses, setResponses] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMainDashboard = location.pathname === "/dashboard";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [petRes, pollRes] = await Promise.all([
        API.get("/petitions"),
        API.get("/polls", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const all = petRes.data.petitions || petRes.data || [];
      const allPolls = Array.isArray(pollRes.data) ? pollRes.data : [];
      setPetitions(all.slice(0, 5));
      setPolls(allPolls);
      setStats({
        pending: all.filter(p => p.status === "pending").length,
        active:  all.filter(p => p.status === "active").length,
        closed:  all.filter(p => p.status === "closed").length,
        total:   all.length,
      });
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (isMainDashboard) fetchData(); }, [isMainDashboard, fetchData]);

  const loadResponses = async (petitionId) => {
    if (expandedId === petitionId) { setExpandedId(null); return; }
    setExpandedId(petitionId);
    if (responses[petitionId]) return;
    try {
      const res = await API.get(`/responses/${petitionId}`);
      setResponses(prev => ({ ...prev, [petitionId]: res.data.responses || [] }));
    } catch {
      setResponses(prev => ({ ...prev, [petitionId]: [] }));
    }
  };

  const activePolls = polls.slice(0, 3);
  const totalPollVotes = polls.reduce((s, p) => s + p.options.reduce((a, o) => a + (o.voteCount || 0), 0), 0);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏛️</div>
          <span className="sidebar-brand-name">CiviX</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className="nav-item">
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>
          <div className="menu-section">
            <div className="menu-section-label">Public Management</div>
            <NavLink to="/dashboard/petitions" className="nav-item">
              <span className="nav-icon">📋</span> Petitions
            </NavLink>
            <NavLink to="/dashboard/polls" className="nav-item">
              <span className="nav-icon">🗳️</span> Polls
            </NavLink>
            <NavLink to="/dashboard/reports" className="nav-item">
              <span className="nav-icon">📝</span> Reports
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <p className="welcome-text">Welcome back</p>
            <h2>{user?.name || "Citizen"}</h2>
          </div>
          <div className="header-right">
            <span className="header-badge">👤 Citizen</span>
            <button className="logout-btn" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
          </div>
        </div>

        {isMainDashboard && (
          <>
            {/* Banner */}
            <div className="welcome-banner">
              <div className="banner-content">
                <h3>🎯 Your Civic Engagement Hub</h3>
                <p>Make your voice heard. Shape your community.</p>
              </div>
              <div className="banner-emoji">🏛️</div>
            </div>

            {/* Stats — show real petition counts */}
            <div className="stats-grid">
              <div className="stat-card stat-orange">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <p className="stat-label">Pending</p>
                  <h3 className="stat-value">{loading ? "—" : stats.pending}</h3>
                </div>
              </div>
              <div className="stat-card stat-blue">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <p className="stat-label">Active</p>
                  <h3 className="stat-value">{loading ? "—" : stats.active}</h3>
                </div>
              </div>
              <div className="stat-card stat-green">
                <div className="stat-icon">🔒</div>
                <div className="stat-info">
                  <p className="stat-label">Closed</p>
                  <h3 className="stat-value">{loading ? "—" : stats.closed}</h3>
                </div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-icon">🗳️</div>
                <div className="stat-info">
                  <p className="stat-label">Active Polls</p>
                  <h3 className="stat-value">{loading ? "—" : polls.length}</h3>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <p className="section-title">Quick Actions</p>
              <div className="action-grid">
                {[
                  { icon: "✍️", title: "Create Petition", desc: "Start a new petition", path: "/petitions/create" },
                  { icon: "🗳️", title: "Vote on Polls",   desc: "Share your opinion",  path: "/dashboard/polls" },
                  { icon: "📝", title: "Report Issue",    desc: "Report a problem",     path: "/dashboard/reports" },
                  { icon: "👁️", title: "View Petitions",  desc: "Browse all petitions", path: "/dashboard/petitions" },
                ].map((a, i) => (
                  <div key={i} className="action-card" onClick={() => navigate(a.path)}>
                    <div className="action-icon">{a.icon}</div>
                    <h5>{a.title}</h5>
                    <p>{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Petitions — all recent, with official responses expandable */}
            <div className="recent-activity">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p className="section-title" style={{ margin: 0 }}>📋 My Petitions</p>
                <button className="dash-link-btn" onClick={() => navigate("/dashboard/petitions")}>
                  View all →
                </button>
              </div>
              <div className="activity-list">
                {loading ? (
                  <div className="activity-item" style={{ cursor: "default" }}>
                    <p style={{ color: "#94a3b8", margin: 0 }}>Loading…</p>
                  </div>
                ) : petitions.length === 0 ? (
                  <div className="activity-item" style={{ cursor: "default" }}>
                    <p style={{ color: "#94a3b8", margin: 0 }}>
                      No petitions yet.{" "}
                      <span className="dash-inline-link" onClick={() => navigate("/petitions/create")}>
                        Create one →
                      </span>
                    </p>
                  </div>
                ) : petitions.map((p) => {
                  const sigCount = Array.isArray(p.signatures) ? p.signatures.length : 0;
                  const { bg, color } = statusStyle(p.status);
                  const isExpanded = expandedId === p._id;
                  const petResponses = responses[p._id] || [];
                  return (
                    <div key={p._id} className="petition-row-wrap">
                      <div className="activity-item" onClick={() => navigate(`/petitions/${p._id}`)}>
                        <div className="activity-icon">📋</div>
                        <div className="activity-content">
                          <h5>{p.title}</h5>
                          <p>{sigCount} signatures · {p.category} · 📍 {p.location}</p>
                        </div>
                        <span className="status-pill" style={{ background: bg, color, border: `1px solid ${color}30` }}>
                          {statusLabel(p.status)}
                        </span>
                        <button
                          className="responses-toggle"
                          onClick={(e) => { e.stopPropagation(); loadResponses(p._id); }}
                          title="View official responses"
                        >
                          💬 {isExpanded ? "▲" : "▼"}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="responses-panel">
                          {petResponses.length === 0 ? (
                            <p className="responses-empty">No official responses yet.</p>
                          ) : petResponses.map(r => (
                            <div key={r._id} className={`response-entry ${r.type === "status_update" ? "status-update" : ""}`}>
                              <div className="response-entry-header">
                                <span className="response-avatar">{(r.respondedBy?.name || "O")[0].toUpperCase()}</span>
                                <span className="response-author">{r.respondedBy?.name || "Official"}</span>
                                <span className={`response-type-tag ${r.type}`}>
                                  {r.type === "status_update" ? "📋 Status Update" : "💬 Comment"}
                                </span>
                              </div>
                              <p className="response-text">{r.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Polls */}
            <div className="recent-activity">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p className="section-title" style={{ margin: 0 }}>📊 Live Polls</p>
                <button className="dash-link-btn" onClick={() => navigate("/dashboard/polls")}>View all →</button>
              </div>
              <div className="activity-list">
                {activePolls.length === 0 ? (
                  <div className="activity-item" style={{ cursor: "default" }}>
                    <p style={{ color: "#94a3b8", margin: 0 }}>No active polls right now.</p>
                  </div>
                ) : activePolls.map((poll) => {
                  const total = poll.options.reduce((s, o) => s + (o.voteCount || 0), 0);
                  return (
                    <div key={poll._id} className="activity-item" style={{ cursor: "default" }}>
                      <div className="activity-icon">🗳️</div>
                      <div className="activity-content">
                        <h5>{poll.title}</h5>
                        <p>{total.toLocaleString()} votes · 📍 {poll.targetLocation}</p>
                      </div>
                      <span className="activity-badge live">Live</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Outlet />
      </main>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default CitizenDashboard;
