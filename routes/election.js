import express from "express";
import {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  getLastElection,
  getElectionsByCandidate,
  getCandidateElections
} from "../controllers/election.js";
import {  allowedTo } from "../middlewares/authorization.js";
import { isAuthenticated } from "../middlewares/authentication.js";

const router = express.Router();

router.post("/",isAuthenticated,allowedTo('admin'), createElection);
router.get("/", getElections);
router.get("/last-election",isAuthenticated,getLastElection)
router.get("/:id", getElectionById);
router.get('/candidate/:id', getCandidateElections);
router.patch("/:id",isAuthenticated,allowedTo('admin'),updateElection);
router.delete("/:id",isAuthenticated,allowedTo('admin'), deleteElection);

export default router;
