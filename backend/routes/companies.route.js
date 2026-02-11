import express from "express";
import {
  getAllCompanies,
  getCompanyPrograms,
} from "../controllers/companies.controller.js";

const router = express.Router();

// GET /api/companies
router.get("/", getAllCompanies);

// GET /api/companies/:companyId/programs
router.get("/:companyId/programs", getCompanyPrograms);

export default router;
