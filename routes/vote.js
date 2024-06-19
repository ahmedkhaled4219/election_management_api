import express from "express";
import {
  addVote,
  getVotes,
  getSpecificVote,
} from "../controllers/vote.js";
const router = express.Router();

import { checkValidVote } from "../middlewares/vote.js";

router.post("/",checkValidVote, addVote);
router.get("/", getVotes);
router.get("/:id", getSpecificVote);

export default router;
