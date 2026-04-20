import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [activeTab, setActiveTab] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [responseForm, setResponseForm] = useState({ officialResponse: "", status: "" });
  const [respMsg, setRespMsg] = useState("");
 
  // Download state
  const now = new Date();
  const [downloadMonth, setDownloadMonth] = useState(now.getMonth() + 1);
  const [downloadYear, setDownloadYear] = useState(now.getFullYear());
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");
 
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
      // Fetch all petitions submitted by citizens
      const res = await API.get("/petitions", { headers: { Authorization: `Bearer ${token}` } });
      // GET /api/petitions returns an array of petition objects
      setReports(Array.isArray(res.data) ? res.data : (res.data?.petitions ?? []));
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
 
  const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
 
  const fetchAndDownloadMonthly = async () => {
    try {
      setDownloading(true);
      setDownloadMsg("");
      const token = localStorage.getItem("token");
      const res = await API.get(
        `/reports/monthly?month=${downloadMonth}&year=${downloadYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = res.data;
      const monthLabel = `${MONTH_NAMES[downloadMonth - 1]} ${downloadYear}`;
 
      // ── Build PDF ──────────────────────────────────────
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
 
      // Header banner
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, pageW, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("🏛  Civic Engagement Report", pageW / 2, 13, { align: "center" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(monthLabel, pageW / 2, 22, { align: "center" });
 
      // Sub-header info
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
      doc.text(`Prepared by: Official Portal`, pageW - 14, 35, { align: "right" });
 
      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 38, pageW - 14, 38);
 
      // Metrics table
      autoTable(doc, {
        startY: 43,
        head: [["Metric", "Value"]],
        body: [
          ["Total Petitions",     d.totalPetitions      ?? 0],
          ["Responded Petitions", d.respondedPetitions  ?? 0],
          ["Pending Petitions",   d.pendingPetitions    ?? 0],
          ["Active Citizens",     d.activeCitizens      ?? 0],
          ["Total Votes",         d.totalVotes          ?? 0],
          ["Total Responses",     d.totalComments       ?? 0],
        ],
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 11,
        },
        bodyStyles: { fontSize: 10, textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 100 },
          1: { halign: "center", cellWidth: 40 },
        },
        margin: { left: 14, right: 14 },
        theme: "grid",
      });
 
      // Footer
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "This report is auto-generated by the Civic Portal. For queries, contact the official department.",
        pageW / 2,
        finalY,
        { align: "center" }
      );
 
      // Save
      doc.save(`Report_${MONTH_NAMES[downloadMonth - 1]}_${downloadYear}.pdf`);
      setDownloadMsg("success");
    } catch (e) {
      console.error(e);
      setDownloadMsg("error");
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadMsg(""), 3000);
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/petitions",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("success");
      setFormData({ title: "", description: "", category: "Infrastructure", location: "" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1800);
    } catch (err) {
      console.error(err);
      setMessage("error");
    }
  };
 
  const statusColor = (s) => {
    if (s === "closed")    return "#16a34a";
    if (s === "active")    return "#2563eb";
    if (s === "pending")   return "#d97706";
    if (s === "resolved")  return "#16a34a";
    if (s === "in_progress") return "#2563eb";
    if (s === "rejected")  return "#dc2626";
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
 
      <div className="reports-tabs-row">
        <div className="reports-tabs">
          <button className="reports-tab active">📈 Monthly Report</button>
        </div>
 
        {/* ── Month-wise Download ── */}
        <div className="download-report-box">
          <span className="download-label">⬇️ Download Report</span>
          <select
            className="download-select"
            value={downloadMonth}
            onChange={e => setDownloadMonth(Number(e.target.value))}
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            className="download-select"
            value={downloadYear}
            onChange={e => setDownloadYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            className={`download-btn ${downloading ? "downloading" : ""}`}
            onClick={fetchAndDownloadMonthly}
            disabled={downloading}
          >
            {downloading ? "⏳ Generating…" : "⬇ Download PDF"}
          </button>
          {downloadMsg === "success" && (
            <span className="download-msg success">✓ Downloaded!</span>
          )}
          {downloadMsg === "error" && (
            <span className="download-msg error">✗ Failed</span>
          )}
        </div>
      </div>
 
      {respMsg && <div className={`message ${respMsg.includes("saved") ? "success" : "error"}`}>{respMsg}</div>}
 
 
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