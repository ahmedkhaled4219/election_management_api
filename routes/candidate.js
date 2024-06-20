import express from "express";
import * as candidateController from "../controllers/candidate.js";
import { isAuthenticated } from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";



const candidateRouter=express.Router();

candidateRouter.post('/createCandidate',isAuthenticated,candidateController.createCandidate);
candidateRouter.get('/getAllCandidates',candidateController.showAllCandidates);
candidateRouter.get('/showSpecificCandidate/:id',candidateController.showAllCandidates);


export default candidateRouter;

