import React, { useEffect, useState } from "react";
import api from "../services/api";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          console.error("No userId found in localStorage");
          setLoading(false);
          return;
        }

        // ✅ FIX — send id
        const res = await api.get(`/profile/${userId}`);

        setProfile(res.data);
      } catch (error) {
        console.error("Profile Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return <div style={styles.loading}>Loading profile...</div>;

  if (!profile)
    return <div style={styles.loading}>Profile not found</div>;

  // Safe destructuring
  const {
    username = "User",
    created_at,
    stats = {},
    recentActivity = [],
  } = profile;

  const {
    solved = 0,
    score = 0,
    streak = 0,
    easy = 0,
    medium = 0,
    hard = 0,
  } = stats;

  const achievements = [
    { icon: "🏆", title: "First Solve", unlocked: solved >= 1 },
    { icon: "🔥", title: "5 Day Streak", unlocked: streak >= 5 },
    { icon: "⭐", title: "Rising Star", unlocked: score >= 100 },
    { icon: "💎", title: "Problem Master", unlocked: solved >= 50 },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 style={styles.username}>{username}</h2>
            <p style={styles.memberSince}>
              Member since{" "}
              {created_at
                ? new Date(created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsContainer}>
          <Stat label="Solved" value={solved} />
          <Stat label="Score" value={score} />
          <Stat label="Streak 🔥" value={streak} />
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["overview", "achievements", "activity"].map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === "overview" && (
            <div style={styles.breakdown}>
              <h3>Difficulty Breakdown</h3>
              <p>Easy: {easy}</p>
              <p>Medium: {medium}</p>
              <p>Hard: {hard}</p>
            </div>
          )}

          {activeTab === "achievements" && (
            <div style={styles.achievements}>
              {achievements.map((a, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.achievementCard,
                    opacity: a.unlocked ? 1 : 0.4,
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{a.icon}</span>
                  <span>{a.title}</span>
                  <span>{a.unlocked ? "✅" : "🔒"}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h3>Recent Activity</h3>

              {recentActivity.length === 0 ? (
                <p>No activity yet.</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} style={styles.activityItem}>
                    <strong>{item.title}</strong>
                    <span>{item.difficulty}</span>
                    <span>
                      {new Date(item.solved_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Stat Component */
const Stat = ({ label, value }) => (
  <div style={styles.statCard}>
    <h3>{value}</h3>
    <p>{label}</p>
  </div>
);

/* Styles (unchanged) */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "25px",
  },
  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#667eea",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    fontWeight: "bold",
    marginRight: "20px",
  },
  username: { margin: 0 },
  memberSince: { margin: 0, color: "gray" },
  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "25px",
  },
  statCard: {
    background: "#f5f7ff",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    width: "30%",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  tabButton: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "#eee",
    fontWeight: "bold",
  },
  activeTab: {
    background: "#667eea",
    color: "#fff",
  },
  content: { marginTop: "10px" },
  breakdown: { lineHeight: "1.8" },
  achievements: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  achievementCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8f8f8",
    padding: "10px 15px",
    borderRadius: "8px",
  },
  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#f8f8f8",
    padding: "8px 12px",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
  },
};

export default ProfilePage;
