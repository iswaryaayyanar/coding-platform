import db from "../db.js";

// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const [companies] = await db.query("SELECT * FROM companies");
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get programs for a specific company
export const getCompanyPrograms = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId } = req.query;

    const [programs] = await db.query(
      `SELECT p.*, 
              CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END as is_solved
       FROM programs p
       LEFT JOIN solved s ON p.id = s.program_id AND s.user_id = ?
       WHERE p.company_id = ?`,
      [userId, companyId]
    );

    res.json(programs);
  } catch (error) {
    console.error("Error fetching company programs:", error);
    res.status(500).json({ message: "Server error" });
  }
};
