import User from "../models/user.model.js";

/**
 * @desc    Get global leaderboard
 * @route   GET /api/leaderboard
 * @access  Public
 */
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({})
      .select("username score problemsSolved")
      .sort({ score: -1, problemsSolved: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message,
    });
  }
};

/**
 * @desc    Get leaderboard position for logged-in user
 * @route   GET /api/leaderboard/me
 * @access  Protected
 */
export const getMyLeaderboardPosition = async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id score problemsSolved")
      .sort({ score: -1, problemsSolved: -1 });

    const position =
      users.findIndex(user => user._id.toString() === req.user.id) + 1;

    if (position === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in leaderboard",
      });
    }

    res.status(200).json({
      success: true,
      position,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard position",
      error: error.message,
    });
  }
};
