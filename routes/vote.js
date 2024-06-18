import express from "express";
import {
  addVote,
  getVotes,
  getSpecificVote,
} from "../controllers/vote.js";
const router = express.Router();

router.post("/", addVote);
router.get("/", getVotes);
router.get("/:id", getSpecificVote);

export default router;
