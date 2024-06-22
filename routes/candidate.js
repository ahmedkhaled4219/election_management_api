import express from "express";
import * as candidateController from "../controllers/candidate.js";
import { isAuthenticated } from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";



const candidateRouter=express.Router();

// candidateRouter.post('/createCandidate',isAuthenticated,candidateController.createCandidate);
candidateRouter.get('/last-candidate', candidateController.getLastCandidateApplied);
candidateRouter.get('/:id',candidateController.showSpecificCandidate);
candidateRouter.get('',candidateController.showAllCandidates);
candidateRouter.post('/apply', isAuthenticated,candidateController.applyCandidate); 
candidateRouter.post('/review',candidateController.reviewCandidate); 


export default candidateRouter;

