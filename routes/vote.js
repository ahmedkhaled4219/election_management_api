import express from "express";
import { isAuthenticated } from "../middlewares/authentication.js";
import {
  addVote,
  getVotes,
  getSpecificVote,
} from "../controllers/vote.js";
const router = express.Router();

import { checkValidVote } from "../middlewares/vote.js";

router.post("/",isAuthenticated,checkValidVote, addVote);
router.get("/", getVotes);
router.get("/:id", getSpecificVote);

export default router;
