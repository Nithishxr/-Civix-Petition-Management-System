import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Users, Download, Send } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/PetitionDetail.css";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const PetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [petition, setPetition] = useState(null);
  const [responses, setResponses] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchPetition();
  }, []);

  const fetchPetition = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/petitions/${id}`);
      const data = await res.json();
      setPetition(data);
      // Load official responses
      const respRes = await fetch(`http://localhost:3000/api/responses/${id}`);
      const respData = await respRes.json();
      setResponses(respData.responses || []);
    } catch (error) {
      console.log(error);
    }
  };

  if (!petition) {
    return <div className="petition-loading">Loading petition...</div>;
  }

  const signatures = Array.isArray(petition.signatures)
    ? petition.signatures.length
    : (petition.signatures || 0);
  const target = petition.target || 1000;
  const progress = target > 0 ? Math.min((signatures / target) * 100, 100) : 0;
  const remaining = target - signatures;

  const graphData = {
    labels: ["Signed", "Remaining"],
    datasets: [{
      data: [signatures, remaining],
      backgroundColor: ["#667eea", "#e2e8f0"],
      borderWidth: 0,
    }]
  };

  const handleAddComment = async () => {
    // No comment endpoint in backend — responses are posted by officials via /petitions/:id/respond
    alert("Comments can only be posted by officials through the official response panel.");
    setComment("");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const createdDate = petition.createdAt ? new Date(petition.createdAt).toLocaleDateString() : "N/A";
    const updatedDate = petition.updatedAt ? new Date(petition.updatedAt).toLocaleDateString() : "N/A";
    const generatedDate = new Date().toLocaleDateString();
    const petitionId = petition._id;

    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(petition.title, 105, 22, { align: "center" });
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 50,
      head: [["Petition Info", "Details"]],
      body: [
        ["Petition ID", petitionId],
        ["Location", petition.location],
        ["Category", petition.category],
        ["Signatures", signatures],
        ["Target", target],
        ["Remaining", remaining],
        ["Created Date", createdDate],
        ["Official Updated Date", updatedDate],
        ["PDF Generated Date", generatedDate]
      ]
    });

    doc.save(`petition-${petitionId}.pdf`);
  };

  return (
    <div className="petition-detail-page">
      <div className="petition-detail-inner">

        {/* Back */}
        <button className="petition-back-btn" onClick={() => navigate("/petitions")}>
          ← Back to Petitions
        </button>

        {/* Main card */}
        <div className="petition-main-card">
          <h1>{petition.title}</h1>

          <div className="petition-meta-row">
            <div className="petition-meta-item">
              <MapPin size={15} />
              {petition.location}
            </div>
            <div className="petition-meta-item">
              <Users size={15} />
              {signatures} Signatures
            </div>
            <StatusBadge status={petition.status} />
          </div>

          <button className="petition-download-btn" onClick={handleDownloadPDF}>
            <Download size={15} />
            Download PDF
          </button>

          {/* Description */}
          <div className="petition-description-section">
            <div className="petition-section-title">Description</div>
            <p className="petition-description-text">{petition.description}</p>
          </div>

          {/* Progress */}
          <div className="petition-progress-section">
            <div className="petition-progress-header">
              <span className="petition-progress-label">Signature Progress</span>
              <span className="petition-progress-pct">{Math.round(progress)}%</span>
            </div>
            <div className="petition-progress-bar">
              <div className="petition-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="petition-progress-stats">
              <span>{signatures.toLocaleString()} signed</span>
              <span>{remaining > 0 ? `${remaining.toLocaleString()} more needed` : "Goal reached!"}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="petition-chart-wrap">
            <Doughnut data={graphData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        {/* Official Responses */}
        <div className="petition-comments-card">
          <h3>Official Responses ({responses.length})</h3>

          {responses.length === 0 && (
            <p className="petition-no-comments">No official responses yet.</p>
          )}

          {responses.map((r) => (
            <div key={r._id} className="petition-comment-item">
              <div className="petition-comment-author">{r.officialId?.name || "Official"}</div>
              <p className="petition-comment-text">{r.comment}</p>
            </div>
          ))}

          {role === "official" && (
            <div className="petition-comment-form">
              <textarea
                className="petition-comment-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write an official response..."
              />
              <button className="petition-comment-submit" onClick={handleAddComment}>
                <Send size={14} />
                Add Response
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PetitionDetail;
