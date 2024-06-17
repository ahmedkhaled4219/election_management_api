import express from "express";
import electionRoutes from "./election.js";

const router = express.Router();

router.use("/elections", electionRoutes);

export default router;
