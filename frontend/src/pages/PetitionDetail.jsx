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
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchPetition();
  }, []);

  const fetchPetition = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/petitions/${id}`);
      const data = await res.json();
      setPetition(data);
      setComments(data.comments || []);
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
    if (!comment.trim()) return;
    try {
      await fetch(`http://localhost:3000/api/petitions/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: role === "official" ? "Official" : "Citizen",
          text: comment,
          isOfficial: role === "official"
        })
      });
      setComment("");
      fetchPetition();
    } catch (error) {
      console.log(error);
    }
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

        {/* Comments */}
        <div className="petition-comments-card">
          <h3>Comments ({comments.length})</h3>

          {comments.length === 0 && (
            <p className="petition-no-comments">No comments yet. Be the first!</p>
          )}

          {comments.map((c) => (
            <div key={c._id} className="petition-comment-item">
              <div className="petition-comment-author">{c.author}</div>
              <p className="petition-comment-text">{c.text}</p>
            </div>
          ))}

          <div className="petition-comment-form">
            <textarea
              className="petition-comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <button className="petition-comment-submit" onClick={handleAddComment}>
              <Send size={14} />
              Add Comment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PetitionDetail;
