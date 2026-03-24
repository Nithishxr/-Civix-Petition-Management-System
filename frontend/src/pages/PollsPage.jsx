import { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import { AuthContext } from '../context/AuthContext';
import './PollsPage.css';

const totalVotes = (poll) => poll.options.reduce((s, o) => s + o.votes, 0);

export default function PollsPage() {
    const { polls, votedPolls, vote, ISSUES } = usePoll();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const backPath = role === "official" ? "/official-dashboard" : "/dashboard";

    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        if (filter === 'all') return polls;
        return polls.filter(p => p.status === filter);
    }, [polls, filter]);

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
                    <button className="btn-create" onClick={() => navigate('/dashboard/polls/create')}>
                        + Create Poll
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
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗳️</div>
                        <p>No polls found</p>
                    </div>
                ) : (
                    filtered.map(poll => (
                        <PollCard key={poll.id} poll={poll} votedPolls={votedPolls} vote={vote} />
                    ))
                )}
            </div>
        </div>
    );
}

function PollCard({ poll, votedPolls, vote }) {
    const total = totalVotes(poll);
    const votedOptionId = votedPolls[poll.id];
    const hasVoted = !!votedOptionId;

    const handleVote = (optionId) => {
        if (!hasVoted && poll.status === 'active') {
            vote(poll.id, optionId);
        }
    };

    return (
        <div className="poll-card">
            <div className="poll-card-top">
                <h2 className="poll-card-title">{poll.title}</h2>
                <span className={`status-badge ${poll.status === 'active' ? 'badge-active' : 'badge-closed'}`}>
                    {poll.status === 'active' ? 'Active' : 'Closed'}
                </span>
            </div>

            {poll.description && (
                <p className="poll-card-desc">{poll.description}</p>
            )}

            <div className="poll-card-meta">
                {poll.issue && <span className="issue-badge">{poll.issue}</span>}
                {poll.location && (
                    <span className="location-tag">
                        <span className="location-dot" />
                        {poll.location}
                    </span>
                )}
            </div>

            {/* Options with vote bars */}
            <div className="poll-options">
                {poll.options.map(opt => {
                    const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                    const isVoted = votedOptionId === opt.id;
                    return (
                        <div
                            key={opt.id}
                            className={`poll-option ${isVoted ? 'voted' : ''} ${!hasVoted && poll.status === 'active' ? 'clickable' : ''}`}
                            onClick={() => handleVote(opt.id)}
                        >
                            <div className="option-label-row">
                                <span className="option-text">
                                    {isVoted && <span className="check-mark">✓ </span>}
                                    {opt.text}
                                </span>
                                <span className="option-votes">{opt.votes} votes ({pct}%)</span>
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

            {/* Voted notice */}
            {hasVoted && (
                <div className="voted-notice">
                    ✅ You have voted on this poll
                </div>
            )}

            <div className="poll-card-footer">
                <span className="total-votes">Total votes: {total}</span>
                {poll.createdBy && <span className="created-by">By: {poll.createdBy}</span>}
            </div>
        </div>
    );
}
