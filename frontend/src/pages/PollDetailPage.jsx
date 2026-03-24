import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { usePoll } from '../context/PollContext';
import './PollDetailPage.css';

const SENTIMENT_COLORS = {
    positive: '#10b981',
    neutral: '#f59e0b',
    negative: '#ef4444',
};

const OPTION_COLORS = [
    'rgba(139,92,246,0.85)', 'rgba(99,102,241,0.85)',
    'rgba(6,182,212,0.85)', 'rgba(236,72,153,0.85)',
    'rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)',
];

const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

export default function PollDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { polls, votedPolls, vote, addComment, closePoll, deletePoll } = usePoll();
    const poll = polls.find(p => p.id === id);
    const [selectedOption, setSelectedOption] = useState(null);
    const [comment, setComment] = useState('');
    const [commenterName, setCommenterName] = useState('');
    const [voteSubmitted, setVoteSubmitted] = useState(false);
    const [activeChart, setActiveChart] = useState('line');

    if (!poll) {
        return (
            <div className="poll-not-found container">
                <h2>Poll not found</h2>
                <Link to="/dashboard/polls" className="btn btn-primary">← Back to Polls</Link>
            </div>
        );
    }

    const total = poll.options.reduce((s, o) => s + o.votes, 0);
    const voted = votedPolls[poll.id];
    const canVote = poll.status === 'active' && !voted;
    const lastSent = poll.sentimentTimeline[poll.sentimentTimeline.length - 1] || {};
    const domSentiment = lastSent.positive > lastSent.negative
        ? lastSent.positive > lastSent.neutral ? 'positive' : 'neutral'
        : lastSent.negative > lastSent.neutral ? 'negative' : 'neutral';

    const pieData = [
        { name: 'Positive', value: lastSent.positive || 0 },
        { name: 'Neutral', value: lastSent.neutral || 0 },
        { name: 'Negative', value: lastSent.negative || 0 },
    ];
    const pieColors = ['#10b981', '#f59e0b', '#ef4444'];

    const handleVote = () => {
        if (!selectedOption) return;
        const success = vote(poll.id, selectedOption);
        if (success) setVoteSubmitted(true);
    };

    const handleComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        addComment(poll.id, comment.trim(), commenterName.trim() || 'Anonymous');
        setComment('');
        setCommenterName('');
    };

    const handleDelete = () => {
        if (window.confirm('Delete this poll permanently?')) {
            deletePoll(poll.id);
            navigate('/dashboard/polls');
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="chart-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map(p => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {p.name}: {p.value}%
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="poll-detail-page">
            <div className="container">
                {/* Back */}
                <Link to="/dashboard/polls" className="back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back to Polls
                </Link>

                <div className="poll-detail-grid">
                    {/* Left column */}
                    <div className="poll-detail-left">
                        {/* Header */}
                        <div className="poll-detail-header card animate-fade">
                            <div className="poll-detail-meta">
                                <span className="badge badge-purple">{poll.issue}</span>
                                <span className={`badge ${poll.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                                    {poll.status === 'active' ? (
                                        <><span className="live-dot" />Active</>
                                    ) : 'Closed'}
                                </span>
                                <span className="poll-date">
                                    {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <h1 className="poll-detail-title">{poll.title}</h1>
                            <p className="poll-detail-desc">{poll.description}</p>
                            <div className="poll-tags">
                                {poll.tags.map(t => <span key={t} className="tag">{t}</span>)}
                            </div>
                            <div className="poll-admin-actions">
                                {poll.status === 'active' && (
                                    <button className="btn btn-ghost btn-sm" onClick={() => closePoll(poll.id)}>Close Poll</button>
                                )}
                                <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                            </div>
                        </div>

                        {/* Voting */}
                        <div className="poll-vote-section card animate-fade" style={{ animationDelay: '80ms' }}>
                            <div className="section-header">
                                <h2 className="section-title">Cast Your Vote</h2>
                                <span className="total-votes">{total.toLocaleString()} votes</span>
                            </div>

                            <div className="options-list">
                                {poll.options.map((opt, i) => {
                                    const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                                    const isVoted = voted === opt.id;
                                    const isSelected = selectedOption === opt.id;
                                    return (
                                        <div
                                            key={opt.id}
                                            className={`option-item ${isSelected ? 'selected' : ''} ${voted ? 'reveal' : ''} ${isVoted ? 'user-voted' : ''}`}
                                            onClick={() => canVote && setSelectedOption(opt.id)}
                                            id={`option-${opt.id}`}
                                        >
                                            <div className="option-content">
                                                <div className="option-left">
                                                    <div className={`option-radio ${isSelected ? 'checked' : ''} ${isVoted ? 'voted' : ''}`}>
                                                        {(isSelected || isVoted) && (
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4" /></svg>
                                                        )}
                                                    </div>
                                                    <span className="option-text">{opt.text}</span>
                                                </div>
                                                {(voted || !canVote) && (
                                                    <span className="option-pct">{pct}%</span>
                                                )}
                                            </div>
                                            {(voted || !canVote) && (
                                                <div className="option-bar-bg">
                                                    <div
                                                        className="option-bar-fill"
                                                        style={{
                                                            width: `${pct}%`,
                                                            background: OPTION_COLORS[i % OPTION_COLORS.length],
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <div className="option-votes-count">
                                                {voted || !canVote ? `${opt.votes.toLocaleString()} votes` : ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {canVote && (
                                <button
                                    className="btn btn-primary btn-lg vote-btn"
                                    onClick={handleVote}
                                    disabled={!selectedOption}
                                    id="submit-vote-btn"
                                >
                                    {voteSubmitted ? (
                                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>Vote Cast!</>
                                    ) : 'Submit Vote'}
                                </button>
                            )}
                            {!canVote && poll.status === 'active' && (
                                <div className="already-voted">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                                    You already voted
                                </div>
                            )}
                            {poll.status === 'closed' && (
                                <div className="poll-closed-notice">This poll is closed</div>
                            )}
                        </div>

                        {/* Comments */}
                        <div className="poll-comments card animate-fade" style={{ animationDelay: '160ms' }}>
                            <h2 className="section-title">Discussion ({poll.comments.length})</h2>

                            <form className="comment-form" onSubmit={handleComment}>
                                <input
                                    className="form-input"
                                    placeholder="Your name (optional)"
                                    value={commenterName}
                                    onChange={e => setCommenterName(e.target.value)}
                                    id="commenter-name"
                                />
                                <textarea
                                    className="form-textarea"
                                    placeholder="Share your perspective on this issue..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    id="comment-input"
                                    style={{ minHeight: 80 }}
                                />
                                <button type="submit" className="btn btn-secondary" disabled={!comment.trim()} id="submit-comment-btn">
                                    Post Comment
                                </button>
                            </form>

                            <div className="comments-list">
                                {poll.comments.length === 0 && (
                                    <p className="no-comments">Be the first to comment on this poll.</p>
                                )}
                                {poll.comments.map(c => (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-header">
                                            <div className="comment-avatar">{c.author.charAt(0).toUpperCase()}</div>
                                            <span className="comment-author">{c.author}</span>
                                            <span className={`badge badge-${c.sentiment === 'positive' ? 'green' : c.sentiment === 'negative' ? 'red' : 'amber'} badge-sm`}>
                                                {c.sentiment}
                                            </span>
                                            <span className="comment-time">{timeAgo(c.time)}</span>
                                        </div>
                                        <p className="comment-text">{c.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column — Charts */}
                    <div className="poll-detail-right">
                        {/* Current sentiment */}
                        <div className="card animate-fade" style={{ animationDelay: '100ms' }}>
                            <h3 className="section-title" style={{ marginBottom: 16 }}>Live Sentiment</h3>
                            <div className={`dom-sentiment dom-${domSentiment}`}>
                                <span className="dom-emoji">
                                    {domSentiment === 'positive' ? '👍' : domSentiment === 'negative' ? '👎' : '😐'}
                                </span>
                                <div>
                                    <div className="dom-label">{domSentiment.charAt(0).toUpperCase() + domSentiment.slice(1)}</div>
                                    <div className="dom-sub">Dominant Mood</div>
                                </div>
                            </div>

                            <div className="sentiment-meters">
                                {[
                                    { key: 'positive', label: 'Positive', value: lastSent.positive || 0, color: '#10b981' },
                                    { key: 'neutral', label: 'Neutral', value: lastSent.neutral || 0, color: '#f59e0b' },
                                    { key: 'negative', label: 'Negative', value: lastSent.negative || 0, color: '#ef4444' },
                                ].map(s => (
                                    <div key={s.key} className="sentiment-meter">
                                        <div className="sm-labels">
                                            <span>{s.label}</span>
                                            <span style={{ color: s.color, fontWeight: 700 }}>{s.value}%</span>
                                        </div>
                                        <div className="sm-bar-bg">
                                            <div className="sm-bar-fill" style={{ width: `${s.value}%`, background: s.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chart tabs */}
                        <div className="card animate-fade" style={{ animationDelay: '150ms' }}>
                            <div className="chart-tab-header">
                                <h3 className="section-title">Sentiment Over Time</h3>
                                <div className="chart-tabs">
                                    {[
                                        { key: 'line', label: 'Line' },
                                        { key: 'bar', label: 'Bar' },
                                        { key: 'pie', label: 'Pie' },
                                    ].map(t => (
                                        <button
                                            key={t.key}
                                            className={`chart-tab ${activeChart === t.key ? 'active' : ''}`}
                                            onClick={() => setActiveChart(t.key)}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="chart-container">
                                {activeChart === 'line' && (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={poll.sentimentTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="time" tick={{ fill: '#4a496a', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#4a496a', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 12, color: '#8b8aa0' }} />
                                            <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} name="Positive" />
                                            <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} name="Neutral" />
                                            <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} name="Negative" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                                {activeChart === 'bar' && (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={poll.sentimentTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="time" tick={{ fill: '#4a496a', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#4a496a', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 12, color: '#8b8aa0' }} />
                                            <Bar dataKey="positive" fill="#10b981" radius={[3, 3, 0, 0]} name="Positive" />
                                            <Bar dataKey="neutral" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Neutral" />
                                            <Bar dataKey="negative" fill="#ef4444" radius={[3, 3, 0, 0]} name="Negative" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                                {activeChart === 'pie' && (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#f1f0ff', fontSize: 12 }} />
                                            <Legend wrapperStyle={{ fontSize: 12, color: '#8b8aa0' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Votes by option */}
                        <div className="card animate-fade" style={{ animationDelay: '200ms' }}>
                            <h3 className="section-title" style={{ marginBottom: 12 }}>Vote Distribution</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart
                                    layout="vertical"
                                    data={poll.options.map((o, i) => ({
                                        name: o.text.length > 18 ? o.text.slice(0, 18) + '…' : o.text,
                                        votes: o.votes,
                                        fill: OPTION_COLORS[i % OPTION_COLORS.length],
                                    }))}
                                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis type="number" tick={{ fill: '#4a496a', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fill: '#8b8aa0', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                                    <Tooltip contentStyle={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#f1f0ff', fontSize: 12 }} />
                                    <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                                        {poll.options.map((_, i) => (
                                            <Cell key={i} fill={OPTION_COLORS[i % OPTION_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
