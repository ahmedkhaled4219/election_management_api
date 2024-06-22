import express from "express";
import * as candidateController from "../controllers/candidate.js";
import { isAuthenticated } from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";



const candidateRouter=express.Router();

// candidateRouter.post('/createCandidate',isAuthenticated,candidateController.createCandidate);
candidateRouter.get('/last-candidate',isAuthenticated,candidateController.getLastCandidateApplied);
candidateRouter.get('/:id',isAuthenticated,candidateController.showSpecificCandidate);
candidateRouter.get('',isAuthenticated,candidateController.showAllCandidates);
candidateRouter.post('/apply', isAuthenticated,candidateController.applyCandidate); 
candidateRouter.post('/review',isAuthenticated,allowedTo("admin"),candidateController.reviewCandidate); 


export default candidateRouter;

