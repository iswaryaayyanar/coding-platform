import express from "express";
import { submitSolution } from "../controllers/submit.controller.js";

const router = express.Router();

router.post("/", submitSolution);

export default router;
