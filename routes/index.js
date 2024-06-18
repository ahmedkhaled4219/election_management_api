import express from "express";
import electionRoutes from "./election.js";
import votingRoutes from './vote.js';
import citizenRouter from "./citizen.js";
import candidateRouter from "./candidate.js";

const router = express.Router();

router.use("/elections", electionRoutes);
router.use("/votes", votingRoutes);
router.use("/citizens", citizenRouter);
router.use("/candidates", candidateRouter);


export default router;
