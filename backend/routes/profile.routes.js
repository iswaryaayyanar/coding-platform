const express = require("express");
const router = express.Router();

const {
  getUserProfile
} = require("../controllers/profile.controller");

const authenticate = require("../middleware/auth.middleware");

/**
 * @route   GET /api/profile
 * @desc    Get logged-in user's profile & stats
 * @access  Private
 */
router.get("/", authenticate, getUserProfile);

module.exports = router;
