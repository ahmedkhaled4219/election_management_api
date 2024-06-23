import express from "express";
import * as citizenController from "../controllers/citizen.js";
import { upload } from '../config/cloudinary.js'; 



const citizenRouter=express.Router();

citizenRouter.post('/signup', upload.single('image'),citizenController.signUp);
citizenRouter.post('/signin',citizenController.signin);
citizenRouter.get("/confirmationOfEmail/:token",citizenController.confirmationOfEmail);
citizenRouter.post('/forgot-password', citizenController.forgotPassword);
citizenRouter.post('/reset-password', citizenController.resetPassword);
citizenRouter.put('/status', citizenController.updateCitizenStatus);
  

export default citizenRouter;

