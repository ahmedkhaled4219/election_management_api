import express from "express";
import electionRoutes from "./election.js";
import votingRoutes from './vote.js';

const router = express.Router();

router.use("/elections", electionRoutes);
router.use("/votes", votingRoutes);


export default router;
