import express from "express";
import * as citizenController from "../controllers/citizen.js";
import { isAuthenticated } from "../middlewares/authentication.js";
import { allowedTo } from "../middlewares/authorization.js";
import { upload } from '../config/cloudinary.js'; 



const citizenRouter=express.Router();

citizenRouter.post('/signup', upload.single('image'),citizenController.signUp);
citizenRouter.post('/newAdmin',isAuthenticated,allowedTo("admin") ,upload.single('image'),citizenController.addAdmin);
citizenRouter.post('/signin',citizenController.signin);
citizenRouter.get('/reject-comments',isAuthenticated,citizenController.getRejectedComments);
citizenRouter.get("/confirmationOfEmail/:token",citizenController.confirmationOfEmail);
citizenRouter.post('/forgot-password', citizenController.forgotPassword);
citizenRouter.post('/reset-password', citizenController.resetPassword);
citizenRouter.put('/status',isAuthenticated,allowedTo("admin"), citizenController.updateCitizenStatus);
citizenRouter.get('',isAuthenticated,citizenController.showAllCitizens);
citizenRouter.put('', isAuthenticated,allowedTo("citizen"), citizenController.updatedCitizenProfile);
citizenRouter.get('/:id',isAuthenticated,citizenController.showSpecificCitizen);
citizenRouter.patch('/:id',isAuthenticated,citizenController.updateCitizen);



export default citizenRouter;

