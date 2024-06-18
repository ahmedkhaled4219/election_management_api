import express from "express";
import * as citizenController from "../controllers/citizen.js";



const citizenRouter=express.Router();

citizenRouter.post('/signup',citizenController.signUp);
citizenRouter.post('/signin',citizenController.signin);


export default citizenRouter;

