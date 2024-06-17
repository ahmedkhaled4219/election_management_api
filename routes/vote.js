import express from "express";
import {
  addVote,
  getVotes,
  getSpecificVote,
  deleteVote
} from "../controllers/vote.js";
const router = express.Router();

router.post("/", addVote);
router.get("/", getVotes);
router.get("/:id", getSpecificVote);
router.delete("/:id", deleteVote);

export default router;
