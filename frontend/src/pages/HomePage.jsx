import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Homepage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [activity, setActivity] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [lastProblem, setLastProblem] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch all API data in parallel
        const [
          statsRes,
          streakRes,
          activityRes,
          lastProblemRes,
          recommendedRes,
          badgesRes,
          leaderboardRes,
        ] = await Promise.all([
          api.get(`/users/${user.id}/stats`),
          api.get(`/users/${user.id}/streak`),
          api.get(`/users/${user.id}/activity`),
          api.get(`/users/${user.id}/last-problem`),
          api.get(`/users/${user.id}/recommended`),
          api.get(`/users/${user.id}/badges`),
          api.get("/leaderboard"),
        ]);

        // Stats
        setStats(statsRes.data);

        // Streak
        setStreak({
          current: streakRes.data.streak,
          best: streakRes.data.streak,
        });

        // Activity for charts
        setActivity(activityRes.data);

        // Last problem
        setLastProblem(lastProblemRes.data);

        // Recommended
        setRecommended(recommendedRes.data);

        // Badges
        setBadges(badgesRes.data);

        // Leaderboard
        const rankedLeaderboard = leaderboardRes.data
          .sort((a, b) => b.score - a.score)
          .map((u, index) => ({ ...u, rank: index + 1 }));
        setLeaderboard(rankedLeaderboard);
      } catch (err) {
        console.error("Homepage API Error:", err);
      }
    };

    fetchData();
  }, [user]);

  if (!stats) return null;

  const progressPercent = stats.total
    ? Math.round((stats.solved / stats.total) * 100)
    : 0;

  // Difficulty counts for chart
  const difficultyData = [
    { name: "Easy", value: stats.easySolved || 0, color: "#10b981" },
    { name: "Medium", value: stats.mediumSolved || 0, color: "#f59e0b" },
    { name: "Hard", value: stats.hardSolved || 0, color: "#ef4444" },
  ];

  return (
    <div className="homepage-container">
      {/* ===== Hero Header ===== */}
      <div className="hero-header">
        <div className="hero-content">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {user.username}
              <span className="wave-emoji">👋</span>
            </h1>
            <p className="welcome-subtitle">
              Stay consistent. Results will follow.
            </p>
          </div>

          <div className="stats-grid">
            <StatCard
              label="Problems Solved"
              value={stats.solved}
              icon={
                <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatCard
              label="Total Score"
              value={stats.score}
              icon={
                <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              color="blue"
            />
            <StatCard
              label="Global Rank"
              value={`#${leaderboard.find((u) => u.id === user.id)?.rank || "-"}`}
              icon={
                <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              }
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* ===== Main Content Grid ===== */}
      <div className="main-grid">
        {/* Progress Section */}
        <div className="progress-card">
          <div className="card-header">
            <h2 className="card-title">Your Progress</h2>
            <span className="progress-count">
              {stats.solved}/{stats.total || 0} problems
            </span>
          </div>

          <div className="progress-visual">
            <div className="progress-circle">
              <svg viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(progressPercent / 100) * 339.292} 339.292`}
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-text">
                <span className="progress-percent">{progressPercent}%</span>
                <span className="progress-label">Complete</span>
              </div>
            </div>

            <div className="difficulty-breakdown">
              <DifficultyItem label="Easy" count={stats.easySolved || 0} color="green" />
              <DifficultyItem label="Medium" count={stats.mediumSolved || 0} color="yellow" />
              <DifficultyItem label="Hard" count={stats.hardSolved || 0} color="red" />
            </div>
          </div>
        </div>

        {/* Resume Card */}
        {lastProblem && (
          <div className="resume-card">
            <div className="resume-icon">
              <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="resume-title">Continue Learning</h2>
            <p className="resume-problem">{lastProblem.title}</p>
            <button
              onClick={() => navigate(`/problems/${lastProblem.id}`)}
              className="resume-button"
            >
              Resume Problem
              <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* Streak Tracker */}
        <div className="streak-card">
          <h2 className="card-title">Streak Tracker</h2>
          <div className="streak-content">
            <div className="streak-item current">
              <div className="streak-icon">🔥</div>
              <div className="streak-info">
                <span className="streak-label">Current Streak</span>
                <span className="streak-value">{streak.current} days</span>
              </div>
            </div>
            <div className="streak-divider"></div>
            <div className="streak-item best">
              <div className="streak-icon">🏆</div>
              <div className="streak-info">
                <span className="streak-label">Best Streak</span>
                <span className="streak-value">{streak.best} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-card">
          <h2 className="card-title">Problems by Difficulty</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={difficultyData}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recommended Problems */}
        <div className="recommended-card">
          <div className="card-header">
            <h2 className="card-title">Recommended for You</h2>
            <svg className="card-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>

          <ul className="problem-list">
            {recommended.map((p) => (
              <li key={p.id} className="problem-item">
                <div className="problem-info">
                  <h3 className="problem-title">{p.title}</h3>
                  <span className={`difficulty-badge ${p.difficulty.toLowerCase()}`}>
                    {p.difficulty}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/problems/${p.id}`)}
                  className="solve-button"
                >
                  Start
                  <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-card">
          <div className="card-header">
            <h2 className="card-title">Top Performers</h2>
            <svg className="card-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <ul className="leaderboard-list">
            {leaderboard.slice(0, 5).map((u) => (
              <li
                key={u.id}
                className={`leaderboard-item ${u.id === user.id ? "current-user" : ""}`}
              >
                <div className="leaderboard-rank">
                  {u.rank <= 3 ? (
                    <span className={`medal rank-${u.rank}`}>
                      {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span className="rank-number">#{u.rank}</span>
                  )}
                </div>
                <div className="leaderboard-user">
                  <span className="user-name">{u.username}</span>
                  {u.id === user.id && <span className="you-badge">You</span>}
                </div>
                <span className="user-score">{u.score}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Achievements */}
        <div className="achievements-card">
          <div className="card-header">
            <h2 className="card-title">Achievements</h2>
            <svg className="card-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div className="badges-grid">
            {badges.length > 0 ? (
              badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  <span className="badge-icon">🏅</span>
                  <span className="badge-name">{badge}</span>
                </div>
              ))
            ) : (
              <p className="no-badges">
                Keep solving problems to earn achievements!
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .homepage-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Hero Header */
        .hero-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 3rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .welcome-section {
          color: white;
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .wave-emoji {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }

        .welcome-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        /* Main Grid */
        .main-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
        }

        .progress-card {
          grid-column: span 4;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .resume-card {
          grid-column: span 4;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .streak-card {
          grid-column: span 4;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-card {
          grid-column: span 7;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .recommended-card {
          grid-column: span 5;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .leaderboard-card {
          grid-column: span 5;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .achievements-card {
          grid-column: span 7;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 1200px) {
          .progress-card,
          .resume-card,
          .streak-card,
          .chart-card,
          .recommended-card,
          .leaderboard-card,
          .achievements-card {
            grid-column: span 12;
          }
        }

        @media (max-width: 768px) {
          .homepage-container {
            padding: 1rem;
          }

          .hero-header {
            padding: 2rem;
          }

          .welcome-title {
            font-size: 1.75rem;
          }
        }

        /* Card Components */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .card-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #9ca3af;
        }

        /* Progress Circle */
        .progress-visual {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .progress-circle {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .progress-circle svg {
          width: 100%;
          height: 100%;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .progress-percent {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #6366f1;
        }

        .progress-label {
          display: block;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .progress-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .difficulty-breakdown {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Resume Card */
        .resume-icon {
          width: 3rem;
          height: 3rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .resume-icon svg {
          width: 1.5rem;
          height: 1.5rem;
        }

        .resume-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .resume-problem {
          font-size: 0.95rem;
          opacity: 0.9;
          margin: 0 0 1.5rem 0;
        }

        .resume-button {
          background: white;
          color: #f5576c;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .resume-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .resume-button svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Streak Card */
        .streak-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .streak-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .streak-item.current {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .streak-item.best {
          background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
        }

        .streak-icon {
          font-size: 2rem;
        }

        .streak-info {
          display: flex;
          flex-direction: column;
        }

        .streak-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .streak-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .streak-divider {
          height: 1px;
          background: #e5e7eb;
        }

        /* Problem List */
        .problem-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .problem-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .problem-item:hover {
          background: #f3f4f6;
          transform: translateX(4px);
        }

        .problem-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .problem-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .difficulty-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
        }

        .difficulty-badge.easy {
          background: #dcfce7;
          color: #15803d;
        }

        .difficulty-badge.medium {
          background: #fef3c7;
          color: #a16207;
        }

        .difficulty-badge.hard {
          background: #fee2e2;
          color: #b91c1c;
        }

        .solve-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .solve-button:hover {
          background: #4f46e5;
          transform: scale(1.05);
        }

        .solve-button svg {
          width: 1rem;
          height: 1rem;
        }

        /* Leaderboard */
        .leaderboard-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .leaderboard-item:hover {
          background: #f3f4f6;
        }

        .leaderboard-item.current-user {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 2px solid #3b82f6;
        }

        .leaderboard-rank {
          width: 2.5rem;
          display: flex;
          justify-content: center;
        }

        .medal {
          font-size: 1.5rem;
        }

        .rank-number {
          font-weight: 600;
          color: #6b7280;
        }

        .leaderboard-user {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-name {
          font-weight: 600;
          color: #1a1a1a;
        }

        .you-badge {
          padding: 0.125rem 0.5rem;
          background: #3b82f6;
          color: white;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .user-score {
          font-weight: 700;
          color: #6366f1;
        }

        /* Achievements */
        .badges-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .badge-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 12px;
          border: 2px solid #fbbf24;
        }

        .badge-icon {
          font-size: 1.25rem;
        }

        .badge-name {
          font-weight: 600;
          color: #92400e;
        }

        .no-badges {
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

/* ===== Helper Components ===== */
const StatCard = ({ label, value, icon, color }) => {
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClasses[color]}`}>{icon}</div>
      <div className="stat-details">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>

      <style >{`
        .stat-card {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.25);
        }

        .stat-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.bg-green-500 {
          background: #10b981;
        }

        .stat-icon.bg-blue-500 {
          background: #3b82f6;
        }

        .stat-icon.bg-purple-500 {
          background: #8b5cf6;
        }

        .stat-icon svg {
          width: 1.5rem;
          height: 1.5rem;
        }

        .stat-details {
          color: white;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
          margin: 0 0 0.25rem 0;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

const DifficultyItem = ({ label, count, color }) => {
  const colors = {
    green: { bg: "#dcfce7", text: "#15803d", bar: "#10b981" },
    yellow: { bg: "#fef3c7", text: "#a16207", bar: "#f59e0b" },
    red: { bg: "#fee2e2", text: "#b91c1c", bar: "#ef4444" },
  };

  return (
    <div className="difficulty-item">
      <div className="difficulty-header">
        <span className="difficulty-label">{label}</span>
        <span className="difficulty-count">{count}</span>
      </div>
      <div className="difficulty-bar-bg">
        <div
          className="difficulty-bar"
          style={{ width: `${Math.min(count * 10, 100)}%` }}
        />
      </div>

      <style >{`
        .difficulty-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .difficulty-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .difficulty-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: ${colors[color].text};
        }

        .difficulty-count {
          font-size: 0.875rem;
          font-weight: 700;
          color: ${colors[color].text};
        }

        .difficulty-bar-bg {
          height: 8px;
          background: ${colors[color].bg};
          border-radius: 4px;
          overflow: hidden;
        }

        .difficulty-bar {
          height: 100%;
          background: ${colors[color].bar};
          border-radius: 4px;
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default Homepage;