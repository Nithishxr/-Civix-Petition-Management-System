import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { toast, show: showToast } = useToast();
 
  // Guard: redirect non-officials immediately
  useEffect(() => {
    const role = user?.role || localStorage.getItem("role");
    if (!role) { navigate("/login", { replace: true }); return; }
    if (role !== "official") { navigate("/dashboard", { replace: true }); }
  }, [user]);
 
  const [stats, setStats] = useState({
    pendingPetitions: 0, activePetitions: 0, closedPetitions: 0,
    totalPetitions: 0, totalCitizens: 0, activePolls: 0,
  });
  const [petitions, setPetitions] = useState([]);
  const [pendingOfficials, setPendingOfficials] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [officialsLoading, setOfficialsLoading] = useState(false);
 
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const petRes = await API.get("/petitions", { headers: { Authorization: `Bearer ${token}` } });
      const petitionsList = petRes.data.petitions || petRes.data || [];
      setPetitions(petitionsList);
      setStats(prev => ({
        ...prev,
        pendingPetitions: petitionsList.filter(p => p.status === "pending").length,
        activePetitions:  petitionsList.filter(p => p.status === "active").length,
        closedPetitions:  petitionsList.filter(p => p.status === "closed").length,
        totalPetitions:   petitionsList.length,
      }));
    } catch {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, []);
 
  // Keep activePolls in sync — fetch from backend
  useEffect(() => {
    const fetchPollCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/polls", { headers: { Authorization: `Bearer ${token}` } });
        const allPolls = Array.isArray(res.data) ? res.data : [];
        setStats(prev => ({ ...prev, activePolls: allPolls.length }));
      } catch { /* ignore */ }
    };
    fetchPollCount();
  }, []);
 
  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
 
  // Fetch pending officials
  const fetchPendingOfficials = useCallback(async () => {
    try {
      setOfficialsLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/auth/officials/pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingOfficials(res.data.pendingOfficials || []);
    } catch {
      // silently fail — user might not have permission
    } finally {
      setOfficialsLoading(false);
    }
  }, []);
 
  useEffect(() => { fetchPendingOfficials(); }, [fetchPendingOfficials]);
 
  const handleApproveOfficial = async (officialId) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(`/auth/officials/${officialId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Official approved successfully! They can now login.", "success");
      fetchPendingOfficials();
    } catch {
      showToast("Failed to approve official. Please try again.", "error");
    }
  };
 
  const handleRejectOfficial = async (officialId, officialName) => {
    if (!window.confirm(`Reject and remove ${officialName}'s official registration? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/auth/officials/${officialId}/reject`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Official registration rejected.", "info");
      fetchPendingOfficials();
    } catch {
      showToast("Failed to reject official. Please try again.", "error");
    }
  };
 
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
    { key: "pending", label: "Pending", count: stats.pendingPetitions },
    { key: "active",  label: "Active",  count: stats.activePetitions },
    { key: "closed",  label: "Closed",  count: stats.closedPetitions },
    { key: "all",     label: "All",     count: stats.totalPetitions },
  ];
 
  const STAT_CARDS = [
    { icon: "📋", label: "Pending",      value: stats.pendingPetitions, cls: "pending" },
    { icon: "✅", label: "Active",       value: stats.activePetitions,  cls: "progress" },
    { icon: "🔒", label: "Closed",       value: stats.closedPetitions,  cls: "resolved" },
    { icon: "👥", label: "Citizens",     value: stats.totalCitizens,    cls: "citizens" },
    { icon: "🗳️", label: "Active Polls", value: stats.activePolls,      cls: "polls" },
    { icon: "📁", label: "Total",        value: stats.totalPetitions,   cls: "total" },
  ];
 
  const QUICK_ACTIONS = [
    { icon: "📈", title: "Analytics",          action: () => navigate("/analytics") },
    { icon: "🗳️", title: "Manage Polls",       action: () => navigate("/dashboard/polls") },
    { icon: "📄", title: "Reports",            action: () => navigate("/dashboard/reports/official") },
    { icon: "💬", title: "Governance Response",action: () => navigate("/official-response") },
    { icon: "📋", title: "All Petitions",      action: () => setActiveTab("all") },
    {
      icon: "👤",
      title: `Pending Officials${pendingOfficials.length > 0 ? ` (${pendingOfficials.length})` : ""}`,
      action: () => document.getElementById("pending-officials-section")?.scrollIntoView({ behavior: "smooth" })
    },
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
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <p className="empty-state-title">Loading petitions…</p>
          </div>
        ) : filteredPetitions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {activeTab === "pending" ? "📭" : activeTab === "active" ? "🔍" : activeTab === "closed" ? "🗂️" : "📋"}
            </div>
            <p className="empty-state-title">
              No {activeTab === "all" ? "" : activeTab} petitions{activeTab === "pending" ? " for review" : " found"}
            </p>
            <p className="empty-state-sub">
              {activeTab === "pending"
                ? "All petitions have been reviewed. Nothing is pending at the moment."
                : activeTab === "active"
                ? "No active petitions right now."
                : activeTab === "closed"
                ? "No petitions have been closed yet."
                : "No petitions have been submitted yet."}
            </p>
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
                    <button className="approve-btn" onClick={() => patchStatus(p._id, "active", "activated")}>
                      ✓ Activate
                    </button>
                  )}
                  {(p.status === "pending" || p.status === "active") && (
                    <button className="reject-btn" onClick={() => patchStatus(p._id, "closed", "closed")}>
                      🔒 Close
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
 
      {/* Pending Officials Approval Panel */}
      <div id="pending-officials-section" className="official-section pending-officials-section">
        <div className="section-header-row">
          <h3 className="section-title">
            👤 Pending Official Approvals
            {pendingOfficials.length > 0 && (
              <span className="pending-badge">{pendingOfficials.length}</span>
            )}
          </h3>
          <button className="official-nav-btn" onClick={fetchPendingOfficials}>
            🔄 Refresh
          </button>
        </div>
 
        {officialsLoading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <p className="empty-state-title">Loading pending officials…</p>
          </div>
        ) : pendingOfficials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p className="empty-state-title">No pending approvals</p>
            <p className="empty-state-sub">
              All official registrations have been reviewed. There are no officials waiting for approval right now.
            </p>
          </div>
        ) : (
          <div className="officials-approval-list">
            {pendingOfficials.map((official) => (
              <div key={official._id} className="official-approval-card">
                <div className="official-approval-avatar">
                  {official.name?.charAt(0).toUpperCase()}
                </div>
                <div className="official-approval-info">
                  <h4>{official.name}</h4>
                  <p className="official-approval-email">📧 {official.email}</p>
                  {official.location && (
                    <p className="official-approval-location">📍 {official.location}</p>
                  )}
                  <p className="official-approval-date">
                    🕒 Registered: {new Date(official.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>
                </div>
                <div className="official-approval-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApproveOfficial(official._id)}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleRejectOfficial(official._id, official.name)}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
 
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};
 
export default OfficialDashboard;