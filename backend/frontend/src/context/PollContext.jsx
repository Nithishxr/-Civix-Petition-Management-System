import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const PollContext = createContext(null);

const ISSUES = [
  'Environment', 'Healthcare', 'Education', 'Economy', 'Infrastructure',
  'Public Safety', 'Housing', 'Technology', 'Social Justice', 'Transport',
  'Energy', 'Foreign Policy', 'Agriculture', 'Employment', 'Immigration'
];

const SENTIMENT_KEYWORDS = {
  positive: ['great', 'excellent', 'agree', 'good', 'support', 'yes', 'approve', 'love', 'best', 'helpful', 'effective', 'needed'],
  negative: ['bad', 'terrible', 'disagree', 'oppose', 'no', 'worst', 'harmful', 'useless', 'ineffective', 'waste', 'fail', 'reject'],
};

const computeSentiment = (text) => {
  const lower = text.toLowerCase();
  let score = 0;
  SENTIMENT_KEYWORDS.positive.forEach(w => { if (lower.includes(w)) score += 1; });
  SENTIMENT_KEYWORDS.negative.forEach(w => { if (lower.includes(w)) score -= 1; });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};

const SAMPLE_POLLS = [
  {
    id: uuidv4(),
    title: 'Should cities invest more in renewable energy infrastructure?',
    description: 'This poll covers investments in solar, wind and other green energy projects to reduce carbon emissions.',
    issue: 'Environment',
    options: [
      { id: uuidv4(), text: 'Strongly Support', votes: 312 },
      { id: uuidv4(), text: 'Support with conditions', votes: 189 },
      { id: uuidv4(), text: 'Neutral', votes: 74 },
      { id: uuidv4(), text: 'Oppose', votes: 43 },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    comments: [
      { id: uuidv4(), text: 'This is great for the future!', author: 'Alex M.', time: new Date(Date.now() - 3600000).toISOString(), sentiment: 'positive' },
      { id: uuidv4(), text: 'We need to be careful about costs', author: 'Jamie L.', time: new Date(Date.now() - 7200000).toISOString(), sentiment: 'neutral' },
    ],
    sentimentTimeline: [
      { time: '6h ago', positive: 40, neutral: 30, negative: 30 },
      { time: '5h ago', positive: 55, neutral: 25, negative: 20 },
      { time: '4h ago', positive: 60, neutral: 22, negative: 18 },
      { time: '3h ago', positive: 58, neutral: 25, negative: 17 },
      { time: '2h ago', positive: 65, neutral: 20, negative: 15 },
      { time: '1h ago', positive: 70, neutral: 18, negative: 12 },
      { time: 'Now', positive: 72, neutral: 18, negative: 10 },
    ],
    tags: ['climate', 'green energy', 'urban planning'],
  },
  {
    id: uuidv4(),
    title: 'Universal basic income: Worth implementing?',
    description: 'Debate on whether a monthly stipend to all citizens regardless of employment is economically viable.',
    issue: 'Economy',
    options: [
      { id: uuidv4(), text: 'Absolutely Yes', votes: 208 },
      { id: uuidv4(), text: 'Yes, with reforms', votes: 145 },
      { id: uuidv4(), text: 'Not sure', votes: 92 },
      { id: uuidv4(), text: 'No', votes: 167 },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    comments: [
      { id: uuidv4(), text: 'Excellent idea for poverty reduction!', author: 'Sam T.', time: new Date(Date.now() - 5000000).toISOString(), sentiment: 'positive' },
      { id: uuidv4(), text: 'This will be terrible for inflation', author: 'Chris P.', time: new Date(Date.now() - 9000000).toISOString(), sentiment: 'negative' },
    ],
    sentimentTimeline: [
      { time: '6h ago', positive: 35, neutral: 30, negative: 35 },
      { time: '5h ago', positive: 40, neutral: 28, negative: 32 },
      { time: '4h ago', positive: 45, neutral: 30, negative: 25 },
      { time: '3h ago', positive: 42, neutral: 30, negative: 28 },
      { time: '2h ago', positive: 48, neutral: 27, negative: 25 },
      { time: '1h ago', positive: 50, neutral: 25, negative: 25 },
      { time: 'Now', positive: 52, neutral: 24, negative: 24 },
    ],
    tags: ['economy', 'welfare', 'policy'],
  },
  {
    id: uuidv4(),
    title: 'Should public schools provide free mental health support?',
    description: 'Proposal to include licensed counselors in all public schools at no cost to students and families.',
    issue: 'Education',
    options: [
      { id: uuidv4(), text: 'Strongly agree', votes: 451 },
      { id: uuidv4(), text: 'Agree', votes: 213 },
      { id: uuidv4(), text: 'Neutral', votes: 56 },
      { id: uuidv4(), text: 'Disagree', votes: 38 },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    comments: [
      { id: uuidv4(), text: 'Absolutely needed! Students are struggling', author: 'Morgan K.', time: new Date(Date.now() - 1800000).toISOString(), sentiment: 'positive' },
    ],
    sentimentTimeline: [
      { time: '6h ago', positive: 60, neutral: 25, negative: 15 },
      { time: '5h ago', positive: 65, neutral: 22, negative: 13 },
      { time: '4h ago', positive: 70, neutral: 20, negative: 10 },
      { time: '3h ago', positive: 72, neutral: 18, negative: 10 },
      { time: '2h ago', positive: 75, neutral: 16, negative: 9 },
      { time: '1h ago', positive: 78, neutral: 15, negative: 7 },
      { time: 'Now', positive: 80, neutral: 14, negative: 6 },
    ],
    tags: ['education', 'mental health', 'students'],
  },
];

export const PollProvider = ({ children }) => {
  const [polls, setPolls] = useState(() => {
    const saved = localStorage.getItem('civic_polls');
    return saved ? JSON.parse(saved) : SAMPLE_POLLS;
  });
  const [votedPolls, setVotedPolls] = useState(() => {
    const saved = localStorage.getItem('civic_voted');
    return saved ? JSON.parse(saved) : {};
  });

  // Simulate live updates every 8s
  useEffect(() => {
    const interval = setInterval(() => {
      setPolls(prev => prev.map(poll => {
        if (poll.status !== 'active') return poll;
        const updatedOptions = poll.options.map(opt => ({
          ...opt,
          votes: opt.votes + Math.floor(Math.random() * 3)
        }));
        const last = poll.sentimentTimeline[poll.sentimentTimeline.length - 1];
        const newPositive = Math.min(95, Math.max(5, last.positive + (Math.random() * 6 - 3)));
        const newNegative = Math.min(90, Math.max(5, last.negative + (Math.random() * 6 - 3)));
        const newNeutral = Math.max(5, 100 - newPositive - newNegative);
        const newTimeline = [
          ...poll.sentimentTimeline.slice(-6),
          {
            time: 'Now',
            positive: Math.round(newPositive),
            neutral: Math.round(newNeutral),
            negative: Math.round(newNegative),
          }
        ].map((t, i, arr) => ({
          ...t,
          time: i === arr.length - 1 ? 'Now' : `${arr.length - 1 - i}h ago`
        }));
        return { ...poll, options: updatedOptions, sentimentTimeline: newTimeline };
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('civic_polls', JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem('civic_voted', JSON.stringify(votedPolls));
  }, [votedPolls]);

  const createPoll = useCallback((data) => {
    const newPoll = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      issue: data.issue,
      location: data.location || '',
      createdBy: data.createdBy || '',
      options: data.options.map(text => ({ id: uuidv4(), text, votes: 0 })),
      createdAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      comments: [],
      tags: data.tags || [],
      sentimentTimeline: [
        { time: '6h ago', positive: 33, neutral: 34, negative: 33 },
        { time: '5h ago', positive: 33, neutral: 34, negative: 33 },
        { time: '4h ago', positive: 33, neutral: 34, negative: 33 },
        { time: '3h ago', positive: 33, neutral: 34, negative: 33 },
        { time: '2h ago', positive: 33, neutral: 34, negative: 33 },
        { time: '1h ago', positive: 33, neutral: 34, negative: 33 },
        { time: 'Now', positive: 33, neutral: 34, negative: 33 },
      ],
    };
    setPolls(prev => [newPoll, ...prev]);
    return newPoll.id;
  }, []);

  const vote = useCallback((pollId, optionId) => {
    if (votedPolls[pollId]) return false;
    setPolls(prev => prev.map(p => p.id === pollId
      ? { ...p, options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) }
      : p
    ));
    setVotedPolls(prev => ({ ...prev, [pollId]: optionId }));
    return true;
  }, [votedPolls]);

  const addComment = useCallback((pollId, text, author) => {
    const sentiment = computeSentiment(text);
    const comment = { id: uuidv4(), text, author: author || 'Anonymous', time: new Date().toISOString(), sentiment };
    setPolls(prev => prev.map(p => p.id === pollId
      ? { ...p, comments: [comment, ...p.comments] }
      : p
    ));
  }, []);

  const closePoll = useCallback((pollId) => {
    setPolls(prev => prev.map(p => p.id === pollId ? { ...p, status: 'closed' } : p));
  }, []);

  const deletePoll = useCallback((pollId) => {
    setPolls(prev => prev.filter(p => p.id !== pollId));
  }, []);

  const getTotalVotes = (poll) => poll.options.reduce((s, o) => s + o.votes, 0);

  return (
    <PollContext.Provider value={{
      polls, votedPolls, vote, createPoll, addComment, closePoll, deletePoll,
      getTotalVotes, ISSUES
    }}>
      {children}
    </PollContext.Provider>
  );
};

export const usePoll = () => {
  const ctx = useContext(PollContext);
  if (!ctx) throw new Error('usePoll must be used inside PollProvider');
  return ctx;
};
