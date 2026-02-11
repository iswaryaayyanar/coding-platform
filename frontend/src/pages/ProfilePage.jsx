import React, { useEffect, useState } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

const ProfilePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    api.get(`/users/${user.id}/stats`).then(res => setStats(res.data));
    setRecentActivity([
      { id: 1, problem: "Two Sum", difficulty: "Easy", date: "2 hours ago", status: "solved" },
      { id: 2, problem: "Binary Search", difficulty: "Medium", date: "1 day ago", status: "solved" },
      { id: 3, problem: "Merge Sort", difficulty: "Hard", date: "2 days ago", status: "attempted" },
    ]);
  }, [user]);

  if (!stats) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading your profile...</p>
    </div>
  );

  const achievements = [
    { icon: "🏆", title: "First Solve", unlocked: true },
    { icon: "🔥", title: "5 Day Streak", unlocked: stats.solved >= 5 },
    { icon: "⭐", title: "Rising Star", unlocked: stats.score >= 100 },
    { icon: "💎", title: "Problem Master", unlocked: stats.solved >= 50 },
  ];

  return (
    <div className="profile-page">
      <style>{`
        .profile-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          color: #4a5568;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .profile-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          padding: 3rem;
          color: white;
          box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }

        .profile-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="white" opacity="0.05"/></svg>');
          opacity: 0.3;
        }

        .profile-content {
          position: relative;
          z-index: 1;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          border: 4px solid white;
        }

        .user-info h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .user-meta {
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-left: 4px solid #667eea;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
        }

        .stat-label {
          color: #718096;
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: white;
          padding: 0.5rem;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .tab {
          flex: 1;
          padding: 1rem;
          border: none;
          background: transparent;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: #718096;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .tab:hover:not(.active) {
          background: #f7fafc;
          color: #667eea;
        }

        .content-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .achievement-card {
          text-align: center;
          padding: 2rem 1rem;
          border-radius: 16px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          transition: transform 0.3s ease;
          opacity: 1;
        }

        .achievement-card.locked {
          background: #e2e8f0;
          color: #a0aec0;
          opacity: 0.6;
        }

        .achievement-card:hover {
          transform: scale(1.05);
        }

        .achievement-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          filter: grayscale(0);
        }

        .achievement-card.locked .achievement-icon {
          filter: grayscale(1);
        }

        .achievement-title {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-radius: 12px;
          background: #f7fafc;
          border-left: 4px solid #667eea;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          background: #edf2f7;
          transform: translateX(5px);
        }

        .activity-info {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .activity-problem {
          font-weight: 600;
          color: #2d3748;
          font-size: 1.1rem;
        }

        .activity-meta {
          color: #718096;
          font-size: 0.9rem;
        }

        .difficulty-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .difficulty-easy {
          background: #c6f6d5;
          color: #22543d;
        }

        .difficulty-medium {
          background: #feebc8;
          color: #7c2d12;
        }

        .difficulty-hard {
          background: #fed7d7;
          color: #742a2a;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-solved {
          background: #c6f6d5;
          color: #22543d;
        }

        .status-attempted {
          background: #feebc8;
          color: #7c2d12;
        }

        .progress-section {
          margin-top: 2rem;
        }

        .progress-bar-container {
          margin-bottom: 1.5rem;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: #4a5568;
          font-weight: 600;
        }

        .progress-bar {
          height: 12px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: width 0.5s ease;
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 1rem;
          }

          .profile-header {
            padding: 2rem 1.5rem;
          }

          .avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .user-info h1 {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="profile-header">
        <div className="profile-content">
          <div className="avatar-section">
            <div className="avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h1>{user.username}</h1>
              <div className="user-meta">
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Problems Solved</div>
          <div className="stat-value">{stats.solved}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Score</div>
          <div className="stat-value">{stats.score}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ranking</div>
          <div className="stat-value">#{Math.floor(Math.random() * 1000) + 1}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Streak</div>
          <div className="stat-value">{Math.floor(stats.solved / 2)} 🔥</div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === "achievements" ? "active" : ""}`}
          onClick={() => setActiveTab("achievements")}
        >
          Achievements
        </button>
        <button 
          className={`tab ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Recent Activity
        </button>
      </div>

      <div className="content-section">
        {activeTab === "overview" && (
          <div className="progress-section">
            <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Progress Overview</h2>
            <div className="progress-bar-container">
              <div className="progress-label">
                <span>Easy Problems</span>
                <span>{Math.floor(stats.solved * 0.5)}/100</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(stats.solved * 0.5) % 100}%` }}></div>
              </div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-label">
                <span>Medium Problems</span>
                <span>{Math.floor(stats.solved * 0.3)}/100</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(stats.solved * 0.3) % 100}%` }}></div>
              </div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-label">
                <span>Hard Problems</span>
                <span>{Math.floor(stats.solved * 0.2)}/100</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(stats.solved * 0.2) % 100}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`achievement-card ${!achievement.unlocked ? 'locked' : ''}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-title">{achievement.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-info">
                    <div className="activity-problem">{activity.problem}</div>
                    <div className="activity-meta">
                      <span className={`difficulty-badge difficulty-${activity.difficulty.toLowerCase()}`}>
                        {activity.difficulty}
                      </span>
                      <span style={{ marginLeft: '1rem' }}>{activity.date}</span>
                    </div>
                  </div>
                  <div className={`status-badge status-${activity.status}`}>
                    {activity.status === 'solved' ? '✓ Solved' : '○ Attempted'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;