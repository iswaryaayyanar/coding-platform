import axios from "axios";
import db from "../db.js";

const PISTON_API = "https://emkc.org/api/v2/piston";

export const submitSolution = async (req, res) => {
  try {
    const { userId, programId, code, language } = req.body;

    // ============================
    // VALIDATION
    // ============================
    if (!userId || !programId || !code || !language) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const normalizedLanguage = language.toLowerCase();

    // ============================
    // FETCH HIDDEN TEST CASES
    // ============================
    const [testCases] = await db.query(
      `SELECT * FROM test_cases
       WHERE program_id = ? AND is_public = 0
       ORDER BY order_index ASC`,
      [programId]
    );

    if (!testCases.length) {
      return res.status(400).json({
        message: "No hidden test cases found",
      });
    }

    let passed = 0;
    let failed = 0;
    const results = [];

    // ============================
    // EXECUTE TESTS
    // ============================
    for (const tc of testCases) {
      const exec = await axios.post(`${PISTON_API}/execute`, {
        language: normalizedLanguage,
        version: "*",
        files: [{ content: code }],
        stdin: tc.input,
      });

      const run = exec.data.run;

      if (!run || run.code !== 0) {
        return res.status(400).json({
          message: "Compilation / Runtime Error",
          error: run?.stderr || "Unknown error",
        });
      }

      const normalize = (s) =>
        (s || "").replace(/\r\n/g, "\n").trim();

      const output = normalize(run.stdout);
      const expected = normalize(tc.expected_output);

      const ok = output === expected;

      results.push({
        testCaseId: tc.id,
        passed: ok,
        output,
        expected,
      });

      if (ok) passed++;
      else {
        failed++;
        break;
      }
    }

    const success = failed === 0;

    // ============================
    // RECORD SUBMISSION HISTORY
    // ============================
    await db.query(
      `INSERT INTO submissions
       (user_id, program_id, language, passed)
       VALUES (?, ?, ?, ?)`,
      [userId, programId, language, success]
    );

    // ============================
    // MARK AS SOLVED (ONLY ONCE)
    // ============================
    if (success) {
      await db.query(
        `INSERT IGNORE INTO solved
         (user_id, program_id, code, language)
         VALUES (?, ?, ?, ?)`,
        [userId, programId, code, language]
      );
    }

    // ============================
    // RESPONSE
    // ============================
    return res.json({
      success,
      passed,
      failed,
      total: testCases.length,
      results,
    });

  } catch (error) {
    console.error("Submit Controller Error:", error);

    return res.status(500).json({
      message: "Submission failed",
      error: error.message,
    });
  }
};
