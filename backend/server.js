import express from "express";
import cors from "cors";
import axios from "axios";
import db from "./db.js";
import dotenv from "dotenv";
import submitRoutes from "./routes/submit.route.js";
import companiesRoutes from "./routes/companies.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PISTON_API = "https://emkc.org/api/v2/piston";

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// =======================
// ROUTES
// =======================
app.use("/api/submit", submitRoutes);
app.use("/api/companies", companiesRoutes);

// =======================
// AUTH ROUTES
// =======================
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "All fields required" });

    const [existingUser] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) return res.status(409).json({ message: "Username already exists" });

    await db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, "Student"]);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
    if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];
    const [[solvedData]] = await db.query("SELECT COUNT(*) as solved_count FROM solved WHERE user_id = ?", [user.id]);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        solved_count: solvedData.solved_count,
        score: solvedData.solved_count * 10,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// PROBLEMS ROUTES
// =======================
app.get("/api/problems", async (req, res) => {
  try {
    const { userId } = req.query;

    const [problems] = await db.query(
      `
      SELECT p.*, CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS is_solved
      FROM programs p
      LEFT JOIN solved s ON p.id = s.program_id AND s.user_id = ?
      ORDER BY p.difficulty, p.title
      `,
      [userId || null]
    );

    res.json(problems);
  } catch (error) {
    console.error("Problems Error:", error);
    res.status(500).json({ message: "Failed to fetch problems" });
  }
});

app.get("/api/problems/:programId", async (req, res) => {
  try {
    const { programId } = req.params;

    const [programs] = await db.query("SELECT * FROM programs WHERE id = ?", [programId]);
    if (programs.length === 0) return res.status(404).json({ message: "Problem not found" });

    const [testCases] = await db.query("SELECT * FROM test_cases WHERE program_id = ? AND is_public = 1", [programId]);

    res.json({
      problem: programs[0],
      publicTestCases: testCases,
    });
  } catch (error) {
    console.error("Problem Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// USER STATS
// =======================
app.get("/api/users/:id/stats", async (req, res) => {
  try {
    const userId = req.params.id;
    const [[stats]] = await db.query(
      `
      SELECT COUNT(s.id) AS solved,
             COUNT(s.id) * 10 AS score
      FROM solved s
      WHERE s.user_id = ?
      `,
      [userId]
    );
    res.json(stats);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// =======================
// USER STREAK
// =======================
app.get("/api/users/:id/streak", async (req, res) => {
  try {
    const userId = req.params.id;
    const [rows] = await db.query(
      `SELECT DISTINCT DATE(solved_at) as day FROM solved WHERE user_id = ? ORDER BY day DESC`,
      [userId]
    );

    let streak = 0;
    let today = new Date();

    for (let row of rows) {
      const solvedDay = new Date(row.day);
      if (Math.floor((today - solvedDay) / (1000 * 60 * 60 * 24)) === streak) streak++;
      else break;
    }

    res.json({ streak });
  } catch (err) {
    console.error("Streak Error:", err);
    res.status(500).json({ message: "Failed to fetch streak" });
  }
});

// =======================
// USER ACTIVITY (DAILY SOLVES FOR CHART)
// =======================
app.get("/api/users/:id/activity", async (req, res) => {
  try {
    const userId = req.params.id;

    const [data] = await db.query(
      `
      SELECT DATE(solved_at) as day, COUNT(*) as problems
      FROM solved
      WHERE user_id = ?
      GROUP BY day
      ORDER BY day
      `,
      [userId]
    );

    res.json(data);
  } catch (err) {
    console.error("Activity Error:", err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

// =======================
// LAST SOLVED PROBLEM
// =======================
app.get("/api/users/:id/last-problem", async (req, res) => {
  try {
    const userId = req.params.id;

    const [[last]] = await db.query(
      `
      SELECT p.id, p.title, p.difficulty, s.solved_at
      FROM solved s
      JOIN programs p ON p.id = s.program_id
      WHERE s.user_id = ?
      ORDER BY s.solved_at DESC
      LIMIT 1
      `,
      [userId]
    );

    res.json(last || null);
  } catch (err) {
    console.error("Last Problem Error:", err);
    res.status(500).json({ message: "Failed to fetch last problem" });
  }
});

// =======================
// RECOMMENDED PROBLEMS
// =======================
app.get("/api/users/:id/recommended", async (req, res) => {
  try {
    const userId = req.params.id;

    const [recommendations] = await db.query(
      `
      SELECT *
      FROM programs
      WHERE id NOT IN (
        SELECT program_id FROM solved WHERE user_id = ?
      )
      ORDER BY RAND()
      LIMIT 5
      `,
      [userId]
    );

    res.json(recommendations);
  } catch (err) {
    console.error("Recommendations Error:", err);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

// =======================
// USER BADGES
// =======================
app.get("/api/users/:id/badges", async (req, res) => {
  try {
    const userId = req.params.id;

    const [[{ solved }]] = await db.query(
      "SELECT COUNT(*) as solved FROM solved WHERE user_id = ?",
      [userId]
    );

    const badges = [];
    if (solved >= 1) badges.push("First Solve");
    if (solved >= 10) badges.push("Problem Solver");
    if (solved >= 50) badges.push("Code Warrior");
    if (solved >= 100) badges.push("Algorithm Master");

    res.json(badges);
  } catch (err) {
    console.error("Badges Error:", err);
    res.status(500).json({ message: "Failed to fetch badges" });
  }
});

// =======================
// LEADERBOARD
// =======================
app.get("/api/leaderboard", async (req, res) => {
  try {
    const [leaderboard] = await db.query(
      `
      SELECT u.id, u.username, COUNT(s.id) AS solved, COUNT(s.id) * 10 AS score
      FROM users u
      LEFT JOIN solved s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY score DESC
      `
    );

    res.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
});

// =======================
// RUN CODE (PISTON)
// =======================
app.post("/api/run", async (req, res) => {
  try {
    const { code, language, input } = req.body;

    const response = await axios.post(`${PISTON_API}/execute`, {
      language,
      version: "*",
      files: [{ content: code }],
      stdin: input || "",
    });

    res.json({
      output: response.data.run.stdout || response.data.run.stderr,
      success: !response.data.run.stderr,
    });
  } catch (error) {
    console.error("Run Code Error:", error.message);
    res.status(500).json({ message: "Code execution failed" });
  }
});

// =======================
// FALLBACK 404
// =======================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
