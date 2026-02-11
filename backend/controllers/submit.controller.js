import axios from "axios";
import db from "../db.js";

const PISTON_API = "https://emkc.org/api/v2/piston";

export const submitSolution = async (req, res) => {
  try {
    const { userId, programId, code, language } = req.body;

    // 🔎 Basic validation
    if (!userId || !programId || !code || !language) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const normalizedLanguage = language.toLowerCase();

    // 🔹 Fetch hidden test cases in order
    const [testCases] = await db.query(
      `SELECT * FROM test_cases 
       WHERE program_id = ? AND is_public = 0 
       ORDER BY order_index ASC`,
      [programId]
    );

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        message: "No hidden test cases found",
      });
    }

    let passed = 0;
    let failed = 0;
    const results = [];

    // 🔁 Execute test cases sequentially
    for (const tc of testCases) {
      let executionResponse;

      try {
        executionResponse = await axios.post(
          `${PISTON_API}/execute`,
          {
            language: normalizedLanguage,
            version: "*",
            files: [{ content: code }],
            stdin: tc.input,
          },
          {
            timeout: 10000,
          }
        );
      } catch (apiError) {
        console.error("Piston API Error:", apiError.message);

        return res.status(500).json({
          message: "Code execution failed",
          error: apiError.response?.data || apiError.message,
        });
      }

      const run = executionResponse.data.run;

      // 🚨 Compilation / Runtime error handling
      if (!run || run.code !== 0) {
        return res.status(400).json({
          message: "Compilation or Runtime Error",
          error: run?.stderr || "Unknown error",
        });
      }

      // 🔹 Normalize output (handle Windows/Linux newline)
      const normalize = (str) =>
        (str || "").replace(/\r\n/g, "\n").trim();

      const output = normalize(run.stdout);
      const expected = normalize(tc.expected_output);

      const isPassed = output === expected;

      results.push({
        testCaseId: tc.id,
        passed: isPassed,
        output,
        expected,
      });

      if (isPassed) {
        passed++;
      } else {
        failed++;
        break; // stop early on first failure
      }
    }

    const success = failed === 0;

    // ✅ If all hidden tests passed → mark as solved
    if (success) {
  try {
    console.log("Attempting to insert into solved");

    const [result] = await db.query(
      "INSERT INTO solved (user_id, program_id) VALUES (?, ?)",
      [userId, programId]
    );

    console.log("Insert success:", result);
  } catch (err) {
    console.error("Insert failed:", err);
  }
}


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
