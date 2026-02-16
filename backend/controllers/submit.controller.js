import axios from "axios";
import db from "../db.js";

export const submitSolution = async (req, res) => {
  try {
    const { userId, programId, code, language } = req.body;

    if (!userId || !programId || !code || !language) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // =========================
    // Language Map for JDoodle
    // =========================
    const langMap = {
      python: { language: "python3", versionIndex: "4" },
      javascript: { language: "nodejs", versionIndex: "4" },
      java: { language: "java", versionIndex: "4" },
      cpp: { language: "cpp", versionIndex: "5" },
      c: { language: "c", versionIndex: "5" }
    };

    const selected = langMap[language.toLowerCase()];

    if (!selected) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    // =========================
    // Fetch Hidden Test Cases
    // =========================
    const [testCases] = await db.query(
      `SELECT * FROM test_cases
       WHERE program_id = ? AND is_public = 0
       ORDER BY order_index`,
      [programId]
    );

    if (!testCases.length) {
      return res.status(400).json({
        message: "No hidden test cases"
      });
    }

    let passed = 0;
    let failed = 0;
    const results = [];

    // =========================
    // Run Each Test Case
    // =========================
    for (const tc of testCases) {

      const response = await axios.post(
        "https://api.jdoodle.com/v1/execute",
        {
          script: code,
          stdin: tc.input,
          language: selected.language,
          versionIndex: selected.versionIndex,
          clientId: process.env.JDOODLE_CLIENT_ID,
          clientSecret: process.env.JDOODLE_CLIENT_SECRET
        }
      );

      const output = (response.data.output || "").trim();
      const expected = (tc.expected_output || "").trim();

      const ok = output === expected;

      results.push({
        testCaseId: tc.id,
        passed: ok,
        output,
        expected
      });

      if (ok) passed++;
      else {
        failed++;
        break;
      }
    }

    const success = failed === 0;

    console.log("SUCCESS:", success);
   console.log("PASSED:", passed);
  console.log("FAILED:", failed);
console.log("USER:", userId);
console.log("PROGRAM:", programId);
    // =========================
    // Store Submission
    // =========================
    await db.query(
      `INSERT INTO submissions
       (user_id, program_id, language, passed)
       VALUES (?, ?, ?, ?)`,
      [userId, programId, language, success]
    );

    // =========================
    // Mark Solved
    // =========================
    if (success) {
      await db.query(
        `INSERT IGNORE INTO solved
         (user_id, program_id, code, language)
         VALUES (?, ?, ?, ?)`,
        [userId, programId, code, language]
      );
    }

    return res.json({
      success,
      passed,
      failed,
      total: testCases.length,
      results
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      message: "Submission failed",
      error: err.response?.data || err.message
    });
  }
};
