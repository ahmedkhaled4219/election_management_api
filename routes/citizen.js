import express from "express";
import * as citizenController from "../controllers/citizen.js";



const citizenRouter=express.Router();

citizenRouter.post('/signup',citizenController.signUp);


export default citizenRouter;

