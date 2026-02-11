import axios from "axios";

const PISTON_API = "https://emkc.org/api/v2/piston";

/**
 * Execute code using Piston API
 * @param {string} code - The code to run
 * @param {string} language - Programming language
 * @param {string} input - Input for the program (optional)
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
export const runCode = async (code, language, input = "") => {
  try {
    const response = await axios.post(`${PISTON_API}/execute`, {
      language,
      version: "*",
      files: [{ content: code }],
      stdin: input,
    });

    const { stdout, stderr } = response.data.run;
    return { stdout, stderr };
  } catch (error) {
    console.error("Piston API error:", error);
    return { stdout: "", stderr: "Error executing code" };
  }
};

/**
 * Get available languages from Piston API
 * @returns {Promise<Array>}
 */
export const getLanguages = async () => {
  try {
    const response = await axios.get(`${PISTON_API}/runtimes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching languages:", error);
    return [];
  }
};
