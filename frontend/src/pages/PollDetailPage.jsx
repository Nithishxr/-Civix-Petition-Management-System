import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import './PollDetailPage.css';

const OPTION_COLORS = [
    'rgba(139,92,246,0.85)', 'rgba(99,102,241,0.85)',
    'rgba(6,182,212,0.85)', 'rgba(236,72,153,0.85)',
    'rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)',
];

export default function PollDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const role = localStorage.getItem("role");

    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [votedOption, setVotedOption] = useState(() => {
        const saved = localStorage.getItem('civic_voted');
        const voted = saved ? JSON.parse(saved) : {};
        return voted[id] || null;
    });
    const [selectedOption, setSelectedOption] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => { fetchPoll(); }, [id]);

    const fetchPoll = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await API.get(`/polls/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPoll(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedOption || votedOption) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await API.post(`/polls/${id}/vote`, { selectedOption }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Persist vote locally
            const saved = localStorage.getItem('civic_voted');
            const voted = saved ? JSON.parse(saved) : {};
            voted[id] = selectedOption;
            localStorage.setItem('civic_voted', JSON.stringify(voted));
            setVotedOption(selectedOption);
            setMsg('Vote cast successfully!');
            fetchPoll();
        } catch (e) {
            setMsg(e.response?.data?.message || 'Failed to cast vote.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="poll-not-found container"><p>Loading poll…</p></div>;
    }

    if (!poll) {
        return (
            <div className="poll-not-found container">
                <h2>Poll not found</h2>
                <Link to="/dashboard/polls" className="btn btn-primary">← Back to Polls</Link>
            </div>
        );
    }

    const total = poll.options.reduce((s, o) => s + (o.voteCount || 0), 0);
    const canVote = role === 'citizen' && !votedOption;

    return (
        <div className="poll-detail-page">
            <div className="container">
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
                                {poll.targetLocation && (
                                    <span className="badge badge-purple">📍 {poll.targetLocation}</span>
                                )}
                                <span className="badge badge-green">
                                    <span className="live-dot" />Active
                                </span>
                                <span className="poll-date">
                                    {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <h1 className="poll-detail-title">{poll.title}</h1>
                            {poll.createdBy?.name && (
                                <p className="poll-detail-desc">Created by {poll.createdBy.name}</p>
                            )}
                        </div>

                        {/* Voting */}
                        <div className="poll-vote-section card animate-fade" style={{ animationDelay: '80ms' }}>
                            <div className="section-header">
                                <h2 className="section-title">Cast Your Vote</h2>
                                <span className="total-votes">{total.toLocaleString()} votes</span>
                            </div>

                            {msg && (
                                <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: msg.includes('success') ? '#dcfce7' : '#fee2e2', color: msg.includes('success') ? '#16a34a' : '#dc2626', fontSize: 14 }}>
                                    {msg}
                                </div>
                            )}

                            <div className="options-list">
                                {poll.options.map((opt, i) => {
                                    const pct = total > 0 ? Math.round(((opt.voteCount || 0) / total) * 100) : 0;
                                    const isVoted = votedOption === opt.text;
                                    const isSelected = selectedOption === opt.text;
                                    return (
                                        <div
                                            key={opt._id}
                                            className={`option-item ${isSelected ? 'selected' : ''} ${votedOption ? 'reveal' : ''} ${isVoted ? 'user-voted' : ''}`}
                                            onClick={() => canVote && setSelectedOption(opt.text)}
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
                                                {(votedOption || !canVote) && (
                                                    <span className="option-pct">{pct}%</span>
                                                )}
                                            </div>
                                            {(votedOption || !canVote) && (
                                                <div className="option-bar-bg">
                                                    <div
                                                        className="option-bar-fill"
                                                        style={{ width: `${pct}%`, background: OPTION_COLORS[i % OPTION_COLORS.length] }}
                                                    />
                                                </div>
                                            )}
                                            <div className="option-votes-count">
                                                {(votedOption || !canVote) ? `${(opt.voteCount || 0).toLocaleString()} votes` : ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {canVote && (
                                <button
                                    className="btn btn-primary btn-lg vote-btn"
                                    onClick={handleVote}
                                    disabled={!selectedOption || submitting}
                                >
                                    {submitting ? 'Submitting…' : 'Submit Vote'}
                                </button>
                            )}
                            {!canVote && role === 'citizen' && (
                                <div className="already-voted">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                                    You already voted
                                </div>
                            )}
                            {role === 'official' && (
                                <div className="poll-closed-notice">Officials cannot vote on polls</div>
                            )}
                        </div>
                    </div>

                    {/* Right column — Vote Distribution */}
                    <div className="poll-detail-right">
                        <div className="card animate-fade" style={{ animationDelay: '100ms' }}>
                            <h3 className="section-title" style={{ marginBottom: 16 }}>Vote Distribution</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    layout="vertical"
                                    data={poll.options.map((o, i) => ({
                                        name: o.text.length > 18 ? o.text.slice(0, 18) + '…' : o.text,
                                        votes: o.voteCount || 0,
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

                        {/* Poll info */}
                        <div className="card animate-fade" style={{ animationDelay: '150ms', padding: 20 }}>
                            <h3 className="section-title" style={{ marginBottom: 12 }}>Poll Info</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#64748b' }}>
                                <div><strong>Total Votes:</strong> {total}</div>
                                <div><strong>Options:</strong> {poll.options.length}</div>
                                {poll.targetLocation && <div><strong>Location:</strong> {poll.targetLocation}</div>}
                                {poll.createdBy?.name && <div><strong>Created by:</strong> {poll.createdBy.name}</div>}
                                <div><strong>Created:</strong> {new Date(poll.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
