import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePoll } from "../context/PollContext";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import "../styles/OfficialDashboard.css";

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

const OfficialDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { polls } = usePoll();
  const navigate = useNavigate();
  const { toast, show: showToast } = useToast();

  const [stats, setStats] = useState({
    pendingPetitions: 0, inProgressPetitions: 0, resolvedPetitions: 0,
    totalPetitions: 0, totalCitizens: 0, activePolls: 0,
  });
  const [petitions, setPetitions] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [petRes, statsRes] = await Promise.all([
        API.get("/petitions", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/petitions/stats"),
      ]);
      const petitionsList = petRes.data.petitions || petRes.data || [];
      const statsData = statsRes.data.stats || {};
      setPetitions(petitionsList);
      setStats(prev => ({
        ...prev,
        pendingPetitions: statsData.pending || 0,
        inProgressPetitions: statsData.inProgress || 0,
        resolvedPetitions: statsData.resolved || 0,
        totalPetitions: statsData.total || 0,
        totalCitizens: statsData.totalCitizens || 0,
      }));
    } catch {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep activePolls in sync with PollContext separately
  useEffect(() => {
    setStats(prev => ({ ...prev, activePolls: polls.filter(p => p.status === "active").length }));
  }, [polls]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const patchStatus = async (id, status, label) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(`/petitions/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Petition ${label}`, "success");
      fetchDashboardData();
    } catch {
      showToast("Action failed. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this petition? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/petitions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Petition deleted", "info");
      fetchDashboardData();
    } catch {
      showToast("Delete failed.", "error");
    }
  };

  const filteredPetitions = petitions.filter(p => {
    if (activeTab === "all") return true;
    return p.status?.toLowerCase() === activeTab;
  });

  const TABS = [
    { key: "pending",     label: "Pending",     count: stats.pendingPetitions },
    { key: "in_progress", label: "In Progress", count: stats.inProgressPetitions },
    { key: "resolved",    label: "Resolved",    count: stats.resolvedPetitions },
    { key: "rejected",    label: "Rejected" },
    { key: "all",         label: "All",         count: stats.totalPetitions },
  ];

  const STAT_CARDS = [
    { icon: "📋", label: "Pending",    value: stats.pendingPetitions,    cls: "pending" },
    { icon: "🔄", label: "In Progress",value: stats.inProgressPetitions, cls: "progress" },
    { icon: "✅", label: "Resolved",   value: stats.resolvedPetitions,   cls: "resolved" },
    { icon: "👥", label: "Citizens",   value: stats.totalCitizens,       cls: "citizens" },
    { icon: "🗳️", label: "Active Polls",value: stats.activePolls,        cls: "polls" },
    { icon: "📁", label: "Total",      value: stats.totalPetitions,      cls: "total" },
  ];

  const QUICK_ACTIONS = [
    { icon: "📈", title: "Analytics",          action: () => navigate("/analytics") },
    { icon: "🗳️", title: "Manage Polls",       action: () => navigate("/dashboard/polls") },
    { icon: "📄", title: "Reports",            action: () => navigate("/dashboard/reports") },
    { icon: "💬", title: "Governance Response",action: () => navigate("/official-response") },
    { icon: "📋", title: "All Petitions",      action: () => setActiveTab("all") },
  ];

  return (
    <div className="official-container">
      {/* Header */}
      <div className="official-header">
        <div className="official-header-left">
          <p className="official-role">🏛️ Official Panel</p>
          <h2>{user?.name || "Government Official"}</h2>
        </div>
        <div className="official-header-right">
          <button className="official-nav-btn" onClick={() => navigate("/official-response")}>
            💬 Respond to Petitions
          </button>
          <button className="official-nav-btn" onClick={() => navigate("/dashboard/polls")}>
            🗳️ Polls
          </button>
          <button className="official-logout" onClick={() => { logout(); navigate("/login"); }}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="official-stats-grid">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="official-stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-content">
              <h3>{loading ? "—" : s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Petitions Management */}
      <div className="official-section">
        <h3 className="section-title">Petitions Management</h3>

        <div className="petition-tabs">
          {TABS.map(tab => (
            <button key={tab.key}
              className={`petition-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}>
              {tab.label}
              {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state">Loading petitions…</div>
        ) : filteredPetitions.length === 0 ? (
          <div className="empty-state">
            No {activeTab === "all" ? "" : activeTab.replace("_", " ")} petitions found.
          </div>
        ) : (
          <div className="petitions-list">
            {filteredPetitions.map((p) => (
              <div key={p._id} className="petition-review-card">
                <div className="petition-info">
                  <h4>{p.title}</h4>
                  <p>{p.description?.slice(0, 110) || "No description."}{p.description?.length > 110 ? "…" : ""}</p>
                  <div className="petition-meta">
                    <span className="signature-count">
                      ✍️ {Array.isArray(p.signatures) ? p.signatures.length : 0} / {p.target || 1000}
                    </span>
                    <span className="petition-date">📅 {new Date(p.createdAt).toLocaleDateString()}</span>
                    <span className="petition-category">🏷️ {p.category}</span>
                    <span>📍 {p.location}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                <div className="petition-actions">
                  {p.status === "pending" && (
                    <button className="approve-btn" onClick={() => patchStatus(p._id, "in_progress", "approved")}>
                      ✓ Approve
                    </button>
                  )}
                  {p.status === "in_progress" && (
                    <button className="approve-btn" onClick={() => patchStatus(p._id, "resolved", "resolved")}>
                      ✓ Resolve
                    </button>
                  )}
                  {(p.status === "pending" || p.status === "in_progress") && (
                    <button className="reject-btn" onClick={() => patchStatus(p._id, "rejected", "rejected")}>
                      ✗ Reject
                    </button>
                  )}
                  <button className="action-btn" onClick={() => navigate(`/edit-petition/${p._id}`)}>
                    ✎ Edit
                  </button>
                  <button className="reject-btn" onClick={() => handleDelete(p._id)}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="official-grid">
        {QUICK_ACTIONS.map((item, i) => (
          <div key={i} className="official-card clickable" onClick={item.action}>
            <div className="card-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <div className="card-footer">
              <span className="view-link">Open →</span>
            </div>
          </div>
        ))}
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default OfficialDashboard;
