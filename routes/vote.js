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
import { allowedTo } from "../middlewares/authorization.js";

router.post("/",isAuthenticated,allowedTo("citizen","candidate"),checkValidVote, addVote);
router.get("/", getVotes);
router.get("/voter-elections",isAuthenticated,allowedTo("citizen"),getVoterElections);
router.get("/toptwo",getTopTwoCandidates);
router.get("/last",isAuthenticated,allowedTo("admin"), getLastCitizenVote);
router.get("/:id", getSpecificVote);

export default router;
