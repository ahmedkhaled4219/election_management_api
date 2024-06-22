import express from "express";
import { isAuthenticated } from "../middlewares/authentication.js";
import {
  addVote,
  getVotes,
  getVoterElections,
  getTopTwoCandidates,
  getSpecificVote,
  getLastCitizenVote,
} from "../controllers/vote.js";
const router = express.Router();

import { checkValidVote } from "../middlewares/vote.js";

router.post("/",isAuthenticated,checkValidVote, addVote);
router.get("/", getVotes);
router.get("/voter-elections/:id",getVoterElections);
router.get("/toptwo",getTopTwoCandidates);
router.get("/:id", getSpecificVote);
router.get("/last-vote", getLastCitizenVote);

export default router;
