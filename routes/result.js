import express from "express";
import {
  getspecificResult,
  getElectionResult,
  getElectionsResult,
  getCandidateResult
} from "../controllers/result.js";
const router = express.Router();

router.get("/election", getElectionsResult);
router.get("/:id", getspecificResult);
router.get("/election/:id", getElectionResult);
router.get("/candidate/:electionId/:candidateId", getCandidateResult);

export default router;