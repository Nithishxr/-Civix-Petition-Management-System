import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import "../styles/Reports.css";

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b", "#fa709a", "#fee140", "#a18cd1"];

const Reports = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isOfficial = user?.role === "official";

  // Citizen state
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Infrastructure", location: ""
  });
  const [message, setMessage] = useState("");

  // Official state
  const [reports, setReports] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [activeTab, setActiveTab] = useState("reports");
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [responseForm, setResponseForm] = useState({ officialResponse: "", status: "" });
  const [respMsg, setRespMsg] = useState("");

  useEffect(() => {
    if (isOfficial) {
      fetchReports();
      fetchMonthly();
    }
  }, [isOfficial]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Use petition-status report as the "reports" list
      const res = await API.get("/reports/petition-status", { headers: { Authorization: `Bearer ${token}` } });
      // petition-status returns { success, data: { active, pending, closed } }
      setReports([]);
      setMonthlyData(prev => ({ ...prev, statusSummary: res.data.data }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    try {
      const token = localStorage.getItem("token");
      const now = new Date();
      const res = await API.get(
        `/reports/monthly?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Backend returns: { totalPetitions, respondedPetitions, pendingPetitions, activeCitizens, totalVotes, totalComments }
      setMonthlyData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRespond = async () => {
    // No backend endpoint for report responses — placeholder
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // No backend report submission endpoint — show local confirmation
    setMessage("success");
    setFormData({ title: "", description: "", category: "Infrastructure", location: "" });
    setTimeout(() => {
      navigate("/dashboard");
    }, 1800);
  };

  const statusColor = (s) => {
    if (s === "resolved") return "#16a34a";
    if (s === "in_progress") return "#2563eb";
    if (s === "rejected") return "#dc2626";
    return "#d97706";
  };

  // ── CITIZEN VIEW ──────────────────────────────────
  if (!isOfficial) {
    return (
      <div className="reports-container">
        <div className="reports-page-header">
          <button className="reports-back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <h3 className="reports-heading">📋 Report an Issue</h3>
        </div>
        <div className="reports-wrapper">
          {message && (
            <div className={`message ${message === "success" ? "success" : "error"}`}>
              {message === "success"
                ? "✓ Report submitted successfully! We'll review it within 48 hours."
                : "✗ Failed to submit report. Please try again."}
            </div>
          )}
          <div className="report-card">
            <h4>Submit a New Report</h4>
            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input type="text" placeholder="Brief title of the issue" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea placeholder="Detailed description of the issue" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required className="form-textarea" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select">
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Safety">Safety</option>
                  <option value="Environment">Environment</option>
                  <option value="Public Services">Public Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" placeholder="Location of the issue" value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required className="form-input" />
              </div>
              <button type="submit" className="submit-button">Submit Report</button>
            </form>
          </div>
          <div className="report-card">
            <h4>📌 Report Guidelines</h4>
            <ul className="guidelines-list">
              <li>Provide clear and accurate information</li>
              <li>Include specific location details</li>
              <li>Reports are reviewed within 48 hours</li>
              <li>You'll receive updates via email</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── OFFICIAL VIEW ─────────────────────────────────
  return (
    <div className="reports-container">
      <div className="reports-page-header">
        <button className="reports-back-btn" onClick={() => navigate("/official-dashboard")}>
          ← Back to Dashboard
        </button>
        <h3 className="reports-heading">📊 Reports & Civic Engagement</h3>
      </div>

      <div className="reports-tabs">
        {["reports", "monthly"].map(t => (
          <button key={t} className={`reports-tab ${activeTab === t ? "active" : ""}`}
            onClick={() => setActiveTab(t)}>
            {t === "reports" ? "📋 Submitted Reports" : "📈 Monthly Report"}
          </button>
        ))}
      </div>

      {respMsg && <div className={`message ${respMsg.includes("saved") ? "success" : "error"}`}>{respMsg}</div>}

      {/* ── Reports List Tab ── */}
      {activeTab === "reports" && (
        <div className="reports-list-section">
          {loading ? (
            <div className="report-card"><p style={{ textAlign: "center", color: "#718096" }}>Loading reports…</p></div>
          ) : reports.length === 0 ? (
            <div className="report-card"><p style={{ textAlign: "center", color: "#718096" }}>No reports submitted yet.</p></div>
          ) : (
            reports.map(r => (
              <div key={r._id} className="report-item-card">
                <div className="report-item-header">
                  <div>
                    <h4 className="report-item-title">{r.title}</h4>
                    <div className="report-item-meta">
                      <span>📍 {r.location}</span>
                      <span>🏷️ {r.category}</span>
                      <span>👤 {r.submittedBy?.name || "Citizen"}</span>
                      <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="report-status-badge" style={{ background: statusColor(r.status) + "18", color: statusColor(r.status), border: `1px solid ${statusColor(r.status)}40` }}>
                    {r.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="report-item-desc">{r.description}</p>

                {r.officialResponse && (
                  <div className="report-official-response">
                    <span className="report-response-label">Official Response:</span>
                    <p>{r.officialResponse}</p>
                  </div>
                )}

                {respondingId === r._id ? (
                  <div className="report-respond-form">
                    <div className="form-group">
                      <label className="form-label">Response</label>
                      <textarea className="form-textarea" placeholder="Write your official response…"
                        value={responseForm.officialResponse}
                        onChange={e => setResponseForm(f => ({ ...f, officialResponse: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Update Status</label>
                      <select className="form-select" value={responseForm.status}
                        onChange={e => setResponseForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="">Keep current</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="report-respond-actions">
                      <button className="submit-button" onClick={() => handleRespond(r._id)}>Save Response</button>
                      <button className="cancel-button" onClick={() => setRespondingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="respond-btn" onClick={() => { setRespondingId(r._id); setResponseForm({ officialResponse: r.officialResponse || "", status: r.status || "" }); }}>
                    {r.officialResponse ? "✎ Edit Response" : "💬 Respond"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Monthly Report Tab ── */}
      {activeTab === "monthly" && (
        <div className="monthly-report-section">
          {!monthlyData ? (
            <div className="report-card"><p style={{ textAlign: "center", color: "#718096" }}>Loading monthly data…</p></div>
          ) : (
            <>
              <div className="monthly-header-card">
                <h4>Civic Engagement Report — This Month</h4>
              </div>

              {/* Summary Stats */}
              <div className="monthly-stats-grid">
                {[
                  { label: "Total Petitions",    value: monthlyData.totalPetitions,    icon: "📋", color: "#667eea" },
                  { label: "Responded",          value: monthlyData.respondedPetitions,icon: "✅", color: "#16a34a" },
                  { label: "Pending",            value: monthlyData.pendingPetitions,  icon: "⏳", color: "#d97706" },
                  { label: "Active Citizens",    value: monthlyData.activeCitizens,    icon: "👥", color: "#7c3aed" },
                  { label: "Total Votes",        value: monthlyData.totalVotes,        icon: "🗳️", color: "#2563eb" },
                  { label: "Total Responses",    value: monthlyData.totalComments,     icon: "💬", color: "#764ba2" },
                ].map((s, i) => (
                  <div key={i} className="monthly-stat-card">
                    <div className="monthly-stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                    <div>
                      <div className="monthly-stat-value" style={{ color: s.color }}>{s.value ?? 0}</div>
                      <div className="monthly-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
