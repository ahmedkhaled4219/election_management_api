import express from "express";
import * as candidateController from "../controllers/candidate.js";



const candidateRouter=express.Router();

candidateRouter.post('/createCandidate',candidateController.createCandidate);


export default candidateRouter;

