import express from "express";
import * as candidateController from "../controllers/candidate.js";
import { isAuthenticated } from "../middlewares/authentication.js";



const candidateRouter=express.Router();

candidateRouter.post('/createCandidate',isAuthenticated,candidateController.createCandidate);
candidateRouter.get('/getAllCandidates',candidateController.showAllCandidates);
candidateRouter.get('/showSpecificCandidate/:id',candidateController.showAllCandidates);
candidateRouter.post('/apply', isAuthenticated,candidateController.applyCandidate); 
candidateRouter.post('/review',candidateController.reviewCandidate); 


export default candidateRouter;

