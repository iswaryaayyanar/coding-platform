import express from "express";
import cors from "cors";
import axios from "axios";
import db from "./db.js";
import dotenv from "dotenv";
import submitRoutes from "./routes/submit.route.js";
import companiesRoutes from "./routes/companies.route.js";
import profileRoutes from "./routes/profile.routes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PISTON_API = "https://emkc.org/api/v2/piston";



// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

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

    if (!username || !password)
      return res.status(400).json({ message: "All fields required" });

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0)
      return res.status(409).json({ message: "Username already exists" });

    await db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, password, "Student"]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (users.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = users[0];

    const [[solvedData]] = await db.query(
      "SELECT COUNT(*) as solved_count FROM solved WHERE user_id = ?",
      [user.id]
    );

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
// PROBLEMS (UPDATED)
// =======================
app.get("/api/problems", async (req, res) => {
  try {
    const { userId, company } = req.query;

    let query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.difficulty,
        p.function_signature,
        p.created_at,
        c.name AS company_name,
        CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS is_solved
      FROM programs p
      JOIN companies c ON p.company_id = c.id
      LEFT JOIN solved s 
        ON p.id = s.program_id AND s.user_id = ?
    `;

    const params = [userId || null];

    if (company) {
      query += " WHERE c.name LIKE ? ";
      params.push(`%${company}%`);
    }

    query += " ORDER BY p.difficulty, p.title";

    const [problems] = await db.query(query, params);

    res.json(problems);
  } catch (error) {
    console.error("Problems Error:", error);
    res.status(500).json({ message: "Failed to fetch problems" });
  }
});

app.get("/api/problems/:programId", async (req, res) => {
  try {
    const { programId } = req.params;

    const [programs] = await db.query(
      `
      SELECT p.*, c.name AS company_name
      FROM programs p
      JOIN companies c ON p.company_id = c.id
      WHERE p.id = ?
      `,
      [programId]
    );

    if (programs.length === 0)
      return res.status(404).json({ message: "Problem not found" });

    const [testCases] = await db.query(
      "SELECT * FROM test_cases WHERE program_id = ? AND is_public = 1",
      [programId]
    );

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
    const [[stats]] = await db.query(
      `
      SELECT COUNT(id) AS solved,
             COUNT(id) * 10 AS score
      FROM solved
      WHERE user_id = ?
      `,
      [req.params.id]
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
    const [rows] = await db.query(
      `SELECT DISTINCT DATE(solved_at) as day 
       FROM solved 
       WHERE user_id = ? 
       ORDER BY day DESC`,
      [req.params.id]
    );

    let streak = 0;
    let today = new Date();

    for (let row of rows) {
      const solvedDay = new Date(row.day);
      if (
        Math.floor((today - solvedDay) / (1000 * 60 * 60 * 24)) === streak
      )
        streak++;
      else break;
    }

    res.json({ streak });
  } catch (err) {
    console.error("Streak Error:", err);
    res.status(500).json({ message: "Failed to fetch streak" });
  }
});

// =======================
// USER ACTIVITY
// =======================
app.get("/api/users/:id/activity", async (req, res) => {
  try {
    const [data] = await db.query(
      `
      SELECT DATE(solved_at) as day, COUNT(*) as problems
      FROM solved
      WHERE user_id = ?
      GROUP BY day
      ORDER BY day
      `,
      [req.params.id]
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
    const [[last]] = await db.query(
      `
      SELECT p.id, p.title, p.difficulty, s.solved_at
      FROM solved s
      JOIN programs p ON p.id = s.program_id
      WHERE s.user_id = ?
      ORDER BY s.solved_at DESC
      LIMIT 1
      `,
      [req.params.id]
    );

    res.json(last || null);
  } catch (err) {
    console.error("Last Problem Error:", err);
    res.status(500).json({ message: "Failed to fetch last problem" });
  }
});

app.use("/api/profile", profileRoutes);


// =======================
// RECOMMENDED PROBLEMS
// =======================
app.get("/api/users/:id/recommended", async (req, res) => {
  try {
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
      [req.params.id]
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
    const [[{ solved }]] = await db.query(
      "SELECT COUNT(*) as solved FROM solved WHERE user_id = ?",
      [req.params.id]
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
// RUN CODE
// =======================
app.post("/api/run", async (req, res) => {
  try {
    const { code, language } = req.body;

    // Map your frontend language names to JDoodle format
    const langMap = {
      python: { language: "python3", versionIndex: "4" },
      javascript: { language: "nodejs", versionIndex: "4" },
      java: { language: "java", versionIndex: "4" },
      cpp: { language: "cpp", versionIndex: "5" },
      c: { language: "c", versionIndex: "5" }
    };

    const selected = langMap[language];

    if (!selected) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        script: code,
        language: selected.language,
        versionIndex: selected.versionIndex,
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: "Execution failed",
      details: err.response?.data || err.message
    });
  }
});


// =======================
// 404 FALLBACK
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
