import db from "../db.js";

/**
 * @desc    Get user profile by ID
 * @route   GET /api/profile/:userId
 * @access  Public / Protected
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get basic user info
    const [users] = await db.query(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = users[0];

    // Count solved problems
    const [solvedData] = await db.query(
      "SELECT COUNT(*) AS solved_count FROM solved WHERE user_id = ?",
      [userId]
    );

    // Fetch solved programs details (optional)
    const [solvedPrograms] = await db.query(
      `SELECT p.id, p.title, p.difficulty, s.solved_at
       FROM solved s
       JOIN programs p ON s.program_id = p.id
       WHERE s.user_id = ?
       ORDER BY s.solved_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
        solved_count: solvedData[0].solved_count,
        solved_programs: solvedPrograms,
        score: solvedData[0].solved_count * 10
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/profile/:userId
 * @access  Protected
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, password } = req.body;

    // Validate input
    if (!username && !password) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }

    if (password) {
      updates.push("password = ?");
      values.push(password);
    }

    values.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
