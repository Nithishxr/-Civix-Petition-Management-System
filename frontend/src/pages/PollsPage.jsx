import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import './PollsPage.css';


export default function PollsPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const backPath = role === "official" ? "/official-dashboard" : "/dashboard";

    const [polls, setPolls] = useState([]);
    const [votedPolls, setVotedPolls] = useState(() => {
        const saved = localStorage.getItem('civic_voted');
        return saved ? JSON.parse(saved) : {};
    });
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await API.get("/polls", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns array of polls
            const data = Array.isArray(res.data) ? res.data : [];
            setPolls(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (pollId, optionText) => {
        if (votedPolls[pollId]) return;
        try {
            const token = localStorage.getItem("token");
            await API.post(`/polls/${pollId}/vote`, { selectedOption: optionText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const updated = { ...votedPolls, [pollId]: optionText };
            setVotedPolls(updated);
            localStorage.setItem('civic_voted', JSON.stringify(updated));
            fetchPolls();
        } catch (e) {
            console.error(e);
        }
    };

    // Backend Poll model has no status field — treat all as active
    const filtered = filter === 'all' ? polls : polls.filter(p => (p.status || 'active') === filter);

    return (
        <div className="polls-page">
            {/* Header */}
            <div className="polls-header">
                <div className="polls-header-left">
                    <div className="polls-title-row">
                        <span className="polls-icon">🗳️</span>
                        <h1 className="polls-title">Community Polls</h1>
                    </div>
                    <p className="polls-subtitle">Vote on issues that matter to your community</p>
                </div>
                <div className="polls-header-actions">
                    <button className="btn-back" onClick={() => navigate(backPath)}>
                        ← Back
                    </button>
                    <button className="btn-create" onClick={() => {
                        if (role !== "official") {
                            alert("Only officials can create polls.");
                            return;
                        }
                        navigate('/dashboard/polls/create');
                    }}>
                        Create Poll
                    </button>
                </div>
            </div>

            {/* Filter pills */}
            <div className="polls-filter-bar">
                {['all', 'active', 'closed'].map(f => (
                    <button
                        key={f}
                        className={`filter-pill ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Poll list */}
            <div className="polls-list">
                {loading ? (
                    <div className="empty-state"><p>Loading polls…</p></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗳️</div>
                        <p>No polls found</p>
                    </div>
                ) : (
                    filtered.map(poll => (
                        <PollCard
                            key={poll._id}
                            poll={poll}
                            votedOption={votedPolls[poll._id]}
                            onVote={handleVote}
                            role={role}
                            onNavigate={(pollId) => navigate(`/poll/${pollId}`)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function PollCard({ poll, votedOption, onVote, role, onNavigate }) {
    const total = poll.options.reduce((s, o) => s + (o.voteCount || 0), 0);
    const hasVoted = !!votedOption;

    return (
        <div className="poll-card" onClick={() => onNavigate(poll._id)} style={{ cursor: 'pointer' }}>
            <div className="poll-card-top">
                <h2 className="poll-card-title">{poll.title}</h2>
                <span className="status-badge badge-active">Active</span>
            </div>

            <div className="poll-card-meta">
                {poll.targetLocation && (
                    <span className="location-tag">
                        <span className="location-dot" />
                        {poll.targetLocation}
                    </span>
                )}
                {poll.createdBy?.name && (
                    <span className="created-by">By: {poll.createdBy.name}</span>
                )}
            </div>

            {/* Options with vote bars */}
            <div className="poll-options">
                {poll.options.map(opt => {
                    const pct = total > 0 ? Math.round(((opt.voteCount || 0) / total) * 100) : 0;
                    const isVoted = votedOption === opt.text;
                    return (
                        <div
                            key={opt._id}
                            className={`poll-option ${isVoted ? 'voted' : ''} ${!hasVoted && role === 'citizen' ? 'clickable' : ''}`}
                            onClick={e => {
                                e.stopPropagation();
                                if (!hasVoted && role === 'citizen') onVote(poll._id, opt.text);
                            }}
                        >
                            <div className="option-label-row">
                                <span className="option-text">
                                    {isVoted && <span className="check-mark">✓ </span>}
                                    {opt.text}
                                </span>
                                <span className="option-votes">{opt.voteCount || 0} votes ({pct}%)</span>
                            </div>
                            <div className="option-bar-track">
                                <div
                                    className={`option-bar-fill ${isVoted ? 'fill-voted' : ''}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasVoted && (
                <div className="voted-notice">
                    ✅ You have voted on this poll
                </div>
            )}

            <div className="poll-card-footer">
                <span className="total-votes">Total votes: {total}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Click to view details →</span>
            </div>
        </div>
    );
}
