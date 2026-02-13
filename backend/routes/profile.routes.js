import express from "express";
import { getUserProfile } from "../controllers/profile.controller.js";

const router = express.Router();

/**
 * GET user profile by ID
 * Example:
 * /api/profile/5
 */
router.get("/:id", async (req, res) => {
  try {
    // Inject id into req.user so controller works
    req.user = { id: req.params.id };

    await getUserProfile(req, res);
  } catch (err) {
    console.error("Profile route error:", err);
    res.status(500).json({ message: "Route failure" });
  }
});

export default router;
