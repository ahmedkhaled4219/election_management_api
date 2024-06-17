import express from "express";
import {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
} from "../controllers/election.js";
const router = express.Router();

router.post("/", createElection);
router.get("/", getElections);
router.get("/:id", getElectionById);
router.put("/:id", updateElection);
router.delete("/:id", deleteElection);

export default router;
