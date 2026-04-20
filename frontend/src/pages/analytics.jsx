import {
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useNavigate } from "react-router-dom";
import { petitions, polls, monthlyPetitionTrend, categoryDistribution, locationEngagement } from "@/data/mockData";
import "../styles/Analytics.css";

const statusData = [
  { name: "Active", value: petitions.filter((p) => p.status === "active").length },
  { name: "Under Review", value: petitions.filter((p) => p.status === "under-review").length },
  { name: "Closed", value: petitions.filter((p) => p.status === "closed").length },
];

const pollParticipation = polls.map((p) => ({
  name: p.title.length > 25 ? p.title.slice(0, 25) + "..." : p.title,
  votes: p.totalVotes,
}));

const tooltipStyle = {
  backgroundColor: "#2d3748",
  border: "1px solid #4a5568",
  borderRadius: "8px",
  color: "#f8f9ff",
};

const Analytics = () => {
  const navigate = useNavigate();
  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div>
            <h1 className="analytics-title">📊 Reports & Analytics</h1>
            <p className="analytics-subtitle">Comprehensive civic engagement insights</p>
          </div>
          <button
            onClick={() => navigate("/official-dashboard")}
            style={{
              padding: "8px 18px",
              background: "#667eea",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Petition Analytics */}
      <h2 className="analytics-section-title">📈 Petition Analytics</h2>
      <div className="analytics-grid">
        {/* Status Breakdown */}
        <div className="analytics-card">
          <h3>Status Breakdown</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" fill="hsl(168, 76%, 42%)">
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="analytics-card">
          <h3>Monthly Petition Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyPetitionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} dot={{ fill: "#667eea" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="analytics-card">
          <h3>Category Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#718096" fontSize={12} />
                <YAxis type="category" dataKey="category" stroke="#718096" fontSize={11} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#667eea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Poll Analytics */}
      <h2 className="analytics-section-title">🗳 Poll Analytics</h2>
      <div className="responsive-grid-2">
        <div className="analytics-card">
          <h3>Total Votes per Poll</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pollParticipation}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#718096" fontSize={10} />
                <YAxis stroke="#718096" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="votes" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Most Selected Options</h3>
          <div className="insights-list">
            {polls.map((poll) => {
              const top = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
              return (
                <div key={poll.id} className="insight-item">
                  <div className="insight-label">{poll.title}</div>
                  <div className="insight-value">Winner: {top.label} ({top.votes.toLocaleString()} votes)</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location Insights */}
      <h2 className="analytics-section-title">📍 Location-Based Insights</h2>
      <div className="analytics-card full-width-card">
        <h3>Engagement Rate by Location</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={locationEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="location" stroke="#718096" fontSize={12} />
              <YAxis stroke="#718096" fontSize={12} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="engagement" radius={[4, 4, 0, 0]} fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="legend-container">
          <span className="legend-item">
            <span className="legend-color high" /> High (≥70%)
          </span>
          <span className="legend-item">
            <span className="legend-color medium" /> Medium (50-69%)
          </span>
          <span className="legend-item">
            <span className="legend-color low" /> Low (&lt;50%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
