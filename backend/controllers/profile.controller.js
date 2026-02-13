import db from "../db.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    console.log("PROFILE HIT:", userId);

    // =====================================================
    // USER INFO
    // =====================================================
    const [userRows] = await db.query(
      `SELECT id, username, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (!userRows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    // =====================================================
    // BASIC STATS + SCORE
    // =====================================================
    const [[stats]] = await db.query(
      `
      SELECT
        COUNT(*) AS solved,

        SUM(CASE WHEN p.difficulty='Easy' THEN 1 ELSE 0 END) easy,
        SUM(CASE WHEN p.difficulty='Medium' THEN 1 ELSE 0 END) medium,
        SUM(CASE WHEN p.difficulty='Hard' THEN 1 ELSE 0 END) hard,

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

    const solved = Number(stats?.solved || 0);
    const easy = Number(stats?.easy || 0);
    const medium = Number(stats?.medium || 0);
    const hard = Number(stats?.hard || 0);
    const score = Number(stats?.score || 0);

    // =====================================================
    // GLOBAL RANK
    // =====================================================
    const [rankRows] = await db.query(`
      SELECT user_id,
      SUM(
        CASE
          WHEN p.difficulty='Easy' THEN 10
          WHEN p.difficulty='Medium' THEN 20
          WHEN p.difficulty='Hard' THEN 30
          ELSE 0
        END
      ) AS score
      FROM solved s
      JOIN programs p ON s.program_id=p.id
      GROUP BY user_id
      ORDER BY score DESC
    `);

    let rank = "-";
    rankRows.forEach((r, i) => {
      if (String(r.user_id) === String(userId)) rank = i + 1;
    });

    // =====================================================
    // COMPANY PROGRESS
    // =====================================================
    const [companyRows] = await db.query(
      `
      SELECT
        c.name,
        COUNT(s.id) solved
      FROM companies c
      LEFT JOIN programs p ON p.company_id=c.id
      LEFT JOIN solved s
        ON s.program_id=p.id AND s.user_id=?
      GROUP BY c.id
      ORDER BY solved DESC
      `,
      [userId]
    );

    // =====================================================
    // HEATMAP DATA (FIXED)
    // =====================================================
    const [heatmapRows] = await db.query(
      `
      SELECT
        DATE(solved_at) AS date,
        COUNT(*) AS count
      FROM solved
      WHERE user_id=?
      AND solved_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY DATE(solved_at)
      `,
      [userId]
    );

    // =====================================================
    // STREAK CALCULATION (FIXED)
    // =====================================================
    const [daysRows] = await db.query(
      `
      SELECT DISTINCT DATE(solved_at) AS day
      FROM solved
      WHERE user_id=?
      ORDER BY day DESC
      `,
      [userId]
    );

    let streak = 0;
    let current = new Date();

    for (let d of daysRows) {
      const day = new Date(d.day);

      if (current.toDateString() === day.toDateString()) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else break;
    }

    // =====================================================
    // RECENT ACTIVITY
    // =====================================================
    const [activityRows] = await db.query(
      `
      SELECT
        p.title,
        p.difficulty,
        s.solved_at
      FROM solved s
      JOIN programs p ON s.program_id=p.id
      WHERE s.user_id=?
      ORDER BY s.solved_at DESC
      LIMIT 5
      `,
      [userId]
    );

    // =====================================================
    // ACHIEVEMENTS ENGINE
    // =====================================================
    const achievements = [
      { title: "First Solve", unlocked: solved >= 1 },
      { title: "10 Solves", unlocked: solved >= 10 },
      { title: "Score 100", unlocked: score >= 100 },
      { title: "7 Day Streak", unlocked: streak >= 7 },
      { title: "Company Explorer", unlocked: companyRows.filter(c=>c.solved>0).length >= 3 }
    ];

    // =====================================================
    // FINAL RESPONSE
    // =====================================================
    res.json({
      ...user,

      stats: {
        solved,
        score,
        easy,
        medium,
        hard,
        streak,
        rank
      },

      companyProgress: companyRows,
      heatmap: heatmapRows,
      achievements,
      recentActivity: activityRows
    });

  } catch (err) {
    console.error("PROFILE CONTROLLER ERROR:", err);
    res.status(500).json({
      message: "Server crash in profile controller"
    });
  }
};
