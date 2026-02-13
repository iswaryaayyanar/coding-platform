import db from "../db.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    // ==============================
    // USER INFO
    // ==============================
    const [userRows] = await db.query(
      `
      SELECT id, username, created_at
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    // ==============================
    // STATS FROM solved + programs
    // ==============================
    const [statsRows] = await db.query(
      `
      SELECT
        COUNT(*) AS solved,

        SUM(CASE WHEN p.difficulty='Easy' THEN 1 ELSE 0 END) AS easy,
        SUM(CASE WHEN p.difficulty='Medium' THEN 1 ELSE 0 END) AS medium,
        SUM(CASE WHEN p.difficulty='Hard' THEN 1 ELSE 0 END) AS hard,

        SUM(
          CASE
            WHEN p.difficulty='Easy' THEN 10
            WHEN p.difficulty='Medium' THEN 20
            WHEN p.difficulty='Hard' THEN 30
            ELSE 0
          END
        ) AS score

      FROM solved s
      JOIN programs p ON s.program_id = p.id
      WHERE s.user_id = ?
      `,
      [userId]
    );

    const stats = statsRows[0] || {};

    // ==============================
    // RECENT ACTIVITY
    // ==============================
    const [activityRows] = await db.query(
      `
      SELECT
        p.title,
        p.difficulty,
        s.solved_at
      FROM solved s
      JOIN programs p ON s.program_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.solved_at DESC
      LIMIT 5
      `,
      [userId]
    );

    // ==============================
    // RESPONSE
    // ==============================
    res.json({
      ...user,
      stats: {
        solved: Number(stats.solved || 0),
        score: Number(stats.score || 0),
        easy: Number(stats.easy || 0),
        medium: Number(stats.medium || 0),
        hard: Number(stats.hard || 0),
        streak: 0,
      },
      recentActivity: activityRows,
    });

  } catch (err) {
    console.error("PROFILE CONTROLLER ERROR:", err);
    res.status(500).json({ message: "Server crash in profile controller" });
  }
};
