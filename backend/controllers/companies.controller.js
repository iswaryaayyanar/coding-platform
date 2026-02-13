import db from "../db.js";

// ===============================
// GET ALL COMPANIES
// ===============================
export const getAllCompanies = async (req, res) => {
  try {
    const [companies] = await db.query(
      "SELECT id, name, logo_url, description, created_at FROM companies ORDER BY name"
    );
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET PROGRAMS BY COMPANY
// (kept for backward compatibility)
// ===============================
export const getCompanyPrograms = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId } = req.query;

    const [programs] = await db.query(
      `
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
      WHERE p.company_id = ?
      ORDER BY p.title
      `,
      [userId || null, companyId]
    );

    res.json(programs);
  } catch (error) {
    console.error("Error fetching company programs:", error);
    res.status(500).json({ message: "Server error" });
  }
};
