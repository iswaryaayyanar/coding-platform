const express = require("express");
const router = express.Router();

const {
  getLeaderboard
} = require("../controllers/leaderboard.controller");

const authenticate = require("../middleware/auth.middleware");

/**
 * @route   GET /api/leaderboard
 * @desc    Get leaderboard (sorted, ranked users)
 * @access  Private
 */
router.get("/", authenticate, getLeaderboard);

module.exports = router;
