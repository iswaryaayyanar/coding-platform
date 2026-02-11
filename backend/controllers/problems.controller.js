import Problem from "../models/problem.model.js";

/**
 * @desc    Create a new problem
 * @route   POST /api/problems
 * @access  Admin / Protected
 */
export const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);

    res.status(201).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create problem",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all problems
 * @route   GET /api/problems
 * @access  Public
 */
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      data: problems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single problem by ID
 * @route   GET /api/problems/:id
 * @access  Public
 */
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
};

/**
 * @desc    Update problem
 * @route   PUT /api/problems/:id
 * @access  Admin / Protected
 */
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update problem",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete problem
 * @route   DELETE /api/problems/:id
 * @access  Admin / Protected
 */
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    await problem.deleteOne();

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete problem",
      error: error.message,
    });
  }
};
