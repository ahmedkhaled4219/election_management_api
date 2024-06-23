import express from "express";
import electionRoutes from "./election.js";
import votingRoutes from './vote.js';
import citizenRouter from "./citizen.js";
import candidateRouter from "./candidate.js";
import resultRoutes from './result.js';
import testimonialRouter from "./testimonial.js";

const router = express.Router();

router.use("/elections", electionRoutes);
router.use("/votes", votingRoutes);
router.use("/citizens", citizenRouter);
router.use("/candidates", candidateRouter);
router.use("/results",resultRoutes);
router.use("/testimonials",testimonialRouter);


export default router;
