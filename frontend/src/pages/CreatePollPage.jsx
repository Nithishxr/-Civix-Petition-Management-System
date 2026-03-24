import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import { AuthContext } from '../context/AuthContext';
import './CreatePollPage.css';

const CATEGORIES = [
    'Environment', 'Healthcare', 'Education', 'Economy', 'Infrastructure',
    'Public Safety', 'Housing', 'Technology', 'Social Justice', 'Transport',
    'Energy', 'Foreign Policy', 'Agriculture', 'Employment', 'Immigration'
];

export default function CreatePollPage() {
    const navigate = useNavigate();
    const { createPoll } = usePoll();
    const { user } = useContext(AuthContext);
    const role = localStorage.getItem("role");

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        endDate: '',
    });
    const [options, setOptions] = useState(['', '']);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const createdBy = user?.name || user?.username || (role === 'official' ? 'Official' : 'Citizen');

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Poll title is required';
        if (!form.location.trim()) e.location = 'Location is required';
        const validOpts = options.filter(o => o.trim());
        if (validOpts.length < 2) e.options = 'At least 2 options required';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);

        // Calculate durationDays from endDate or default 7
        let durationDays = 7;
        if (form.endDate) {
            const diff = new Date(form.endDate) - new Date();
            if (diff > 0) durationDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        createPoll({
            title: form.title,
            description: form.description,
            issue: form.category,
            location: form.location,
            durationDays,
            options: options.filter(o => o.trim()),
            tags: [],
            createdBy,
        });

        navigate('/dashboard/polls');
    };

    const addOption = () => {
        if (options.length < 6) setOptions(prev => [...prev, '']);
    };

    const removeOption = (i) => {
        if (options.length <= 2) return;
        setOptions(prev => prev.filter((_, idx) => idx !== i));
    };

    const setOption = (i, val) => {
        setOptions(prev => prev.map((o, idx) => idx === i ? val : o));
    };

    const clearError = (key) => setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

    return (
        <div className="create-page">
            <div className="create-container">
                <div className="create-card">
                    {/* Title */}
                    <div className="create-card-header">
                        <span className="create-card-icon" />
                        <div>
                            <h1 className="create-card-title">Create New Poll</h1>
                            <p className="create-card-sub">Create a community poll to gather public opinion.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Poll Title */}
                        <div className="form-group">
                            <label className="form-label">POLL TITLE *</label>
                            <input
                                className={`form-input ${errors.title ? 'input-error' : ''}`}
                                placeholder="Enter poll title"
                                value={form.title}
                                onChange={e => { setForm(f => ({ ...f, title: e.target.value })); clearError('title'); }}
                            />
                            {errors.title && <span className="error-msg">{errors.title}</span>}
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">DESCRIPTION</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe the poll..."
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                rows={5}
                            />
                        </div>

                        {/* Category + Location */}
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">CATEGORY</label>
                                <select
                                    className="form-select"
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">LOCATION *</label>
                                <input
                                    className={`form-input ${errors.location ? 'input-error' : ''}`}
                                    placeholder="e.g. Downtown District"
                                    value={form.location}
                                    onChange={e => { setForm(f => ({ ...f, location: e.target.value })); clearError('location'); }}
                                />
                                {errors.location && <span className="error-msg">{errors.location}</span>}
                            </div>
                        </div>

                        {/* End Date + Created By */}
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">END DATE (OPTIONAL)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={form.endDate}
                                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">CREATED BY</label>
                                <input
                                    className="form-input"
                                    value={createdBy}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Poll Options */}
                        <div className="form-group">
                            <label className="form-label">
                                POLL OPTIONS * (MIN 2, MAX 6)
                                {errors.options && <span className="error-msg" style={{ marginLeft: 8, textTransform: 'none', fontWeight: 400 }}>{errors.options}</span>}
                            </label>
                            <div className="options-list">
                                {options.map((opt, i) => (
                                    <div key={i} className="option-row">
                                        <input
                                            className="form-input"
                                            placeholder={`Option ${i + 1}`}
                                            value={opt}
                                            onChange={e => setOption(i, e.target.value)}
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeOption(i)}
                                            >✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {options.length < 6 && (
                                <button type="button" className="add-option-btn" onClick={addOption}>
                                    + Add Option
                                </button>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard/polls')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Poll'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
