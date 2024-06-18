import express from "express";
import * as candidateController from "../controllers/candidate.js";
import { isAuthenticated } from "../middlewares/authentication.js";



const candidateRouter=express.Router();

candidateRouter.post('/createCandidate',isAuthenticated,candidateController.createCandidate);


export default candidateRouter;

