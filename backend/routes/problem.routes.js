const express = require("express");
const router = express.Router();

const {
  getAllProblems,
  getProblemById,
  submitSolution
} = require("../controllers/problems.controller");

const authenticate = require("../middleware/auth.middleware");

/**
 * @route   GET /api/problems
 * @desc    Get all problems (with filters, solved status)
 * @access  Private
 */
router.get("/", authenticate, getAllProblems);

/**
 * @route   GET /api/problems/:id
 * @desc    Get single problem by ID (details + public test cases)
 * @access  Private
 */
router.get("/:id", authenticate, getProblemById);

/**
 * @route   POST /api/problems/:id/submit
 * @desc    Submit solution for a problem
 * @access  Private
 */
router.post("/:id/submit", authenticate, submitSolution);

module.exports = router;
