import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/OfficialResponse.css";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "#d97706" },
  { value: "active",  label: "Active",  color: "#16a34a" },
  { value: "closed",  label: "Closed",  color: "#64748b" },
];

const statusColor = (s) => STATUS_OPTIONS.find(o => o.value === s)?.color || "#718096";

export default function OfficialResponse() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [petitions, setPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);       // petition being responded to
  const [responses, setResponses] = useState([]);
  const [respLoading, setRespLoading] = useState(false);
  const [form, setForm] = useState({ message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchLocality(); }, []);

  const fetchLocality = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/petitions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const all = res.data.petitions || res.data || [];
      setPetitions(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openPetition = async (petition) => {
    setSelected(petition);
    setForm({ message: "" });
    setMsg("");
    setRespLoading(true);
    try {
      const res = await API.get(`/responses/${petition._id}`);
      setResponses(res.data.responses || []);
    } catch (e) {
      setResponses([]);
    } finally {
      setRespLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      // Backend expects { comment } — map message → comment
      await API.post(`/petitions/${selected._id}/respond`, { comment: form.message }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If status update requested, patch status separately
      if (form.type === "status_update" && form.status) {
        await API.patch(`/petitions/${selected._id}/status`, { status: form.status }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setMsg("Response posted successfully.");
      setForm({ message: "" });

      // Refresh responses and petition list
      const respRes = await API.get(`/responses/${selected._id}`);
      setResponses(respRes.data.responses || []);
      await fetchLocality();
    } catch (e) {
      setMsg("Failed to post response.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = petitions.filter(p => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="or-page">
      {/* Left panel — petition list */}
      <div className="or-list-panel">
        <div className="or-list-header">
          <div>
            <button className="or-back-btn" onClick={() => navigate("/official-dashboard")}>
              ← Dashboard
            </button>
            <h2 className="or-list-title">Locality Petitions</h2>
            <p className="or-list-sub">
              {user?.location ? `Showing petitions in "${user.location}"` : "All petitions (no location set)"}
            </p>
          </div>
          <span className="or-count-badge">{filtered.length}</span>
        </div>

        <input
          className="or-search"
          placeholder="Search petitions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="or-filter-pills">
          {["all", "pending", "active", "closed"].map(s => (
            <button
              key={s}
              className={`or-pill ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="or-empty">Loading petitions…</div>
        ) : filtered.length === 0 ? (
          <div className="or-empty">No petitions found.</div>
        ) : (
          <div className="or-petition-list">
            {filtered.map(p => (
              <div
                key={p._id}
                className={`or-petition-item ${selected?._id === p._id ? "active" : ""}`}
                onClick={() => openPetition(p)}
              >
                <div className="or-petition-item-top">
                  <span className="or-petition-title">{p.title}</span>
                  <span className="or-status-dot" style={{ background: statusColor(p.status) }} />
                </div>
                <div className="or-petition-meta">
                  <span>📍 {p.location}</span>
                  <span>✍️ {Array.isArray(p.signatures) ? p.signatures.length : 0} sigs</span>
                  <span>🏷️ {p.category}</span>
                </div>
                <div className="or-petition-status" style={{ color: statusColor(p.status) }}>
                  {p.status?.replace("_", " ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel — response area */}
      <div className="or-detail-panel">
        {!selected ? (
          <div className="or-no-selection">
            <div className="or-no-selection-icon">💬</div>
            <h3>Select a petition</h3>
            <p>Choose a petition from the list to view details and post a response.</p>
          </div>
        ) : (
          <>
            {/* Petition detail */}
            <div className="or-detail-card">
              <div className="or-detail-header">
                <div>
                  <h2 className="or-detail-title">{selected.title}</h2>
                  <div className="or-detail-meta">
                    <span>📍 {selected.location}</span>
                    <span>🏷️ {selected.category}</span>
                    <span>✍️ {Array.isArray(selected.signatures) ? selected.signatures.length : 0} / {selected.target || 1000} signatures</span>
                    <span>👤 {selected.createdBy?.name || "Citizen"}</span>
                  </div>
                </div>
                <span className="or-status-badge" style={{ background: statusColor(selected.status) + "18", color: statusColor(selected.status), border: `1px solid ${statusColor(selected.status)}40` }}>
                  {selected.status?.replace("_", " ")}
                </span>
              </div>
              <p className="or-detail-desc">{selected.description}</p>

              {/* Progress bar */}
              <div className="or-progress-wrap">
                <div className="or-progress-bar">
                  <div
                    className="or-progress-fill"
                    style={{ width: `${Math.min(((Array.isArray(selected.signatures) ? selected.signatures.length : 0) / (selected.target || 1000)) * 100, 100)}%` }}
                  />
                </div>
                <span className="or-progress-pct">
                  {Math.round(Math.min(((Array.isArray(selected.signatures) ? selected.signatures.length : 0) / (selected.target || 1000)) * 100, 100))}%
                </span>
              </div>
            </div>

            {/* Response form */}
            <div className="or-response-form-card">
              <h3 className="or-section-title">Post Official Response</h3>
              {msg && <div className={`or-msg ${msg.includes("success") ? "success" : "error"}`}>{msg}</div>}

              <form onSubmit={handleSubmit}>
                <div className="or-form-group">
                  <label className="or-label">Message</label>
                  <textarea
                    className="or-textarea"
                    placeholder="Write your official comment or update…"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="or-submit-btn" disabled={submitting}>
                  {submitting ? "Posting…" : "💬 Post Comment"}
                </button>
              </form>
            </div>

            {/* Existing responses */}
            <div className="or-responses-card">
              <h3 className="or-section-title">Response History ({responses.length})</h3>
              {respLoading ? (
                <p className="or-empty">Loading responses…</p>
              ) : responses.length === 0 ? (
                <p className="or-empty">No responses yet. Be the first to respond.</p>
              ) : (
                <div className="or-responses-list">
                  {responses.map(r => (
                    <div key={r._id} className="or-response-item">
                      <div className="or-response-header">
                        <div className="or-response-avatar">
                          {(r.officialId?.name || "O").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="or-response-author">{r.officialId?.name || "Official"}</span>
                          <span className="or-response-role">Official</span>
                        </div>
                        <span className="or-response-time">{timeAgo(r.createdAt)}</span>
                      </div>
                      <p className="or-response-msg">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
