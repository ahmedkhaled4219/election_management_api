import express from 'express';
import * as testimonialController from '../controllers/testimonial.js';
import { isAuthenticated } from '../middlewares/authentication.js';
import { allowedTo } from '../middlewares/authorization.js';

const testimonialRouter = express.Router();

testimonialRouter.post('/',isAuthenticated,allowedTo("citizen","candidate"), testimonialController.createTestimonial);
testimonialRouter.get('/', testimonialController.getAllTestimonials);
testimonialRouter.get('/election/:electionId', testimonialController.getTestimonialsByElection);
testimonialRouter.get('/citizen/:citizenId',isAuthenticated, testimonialController.getTestimonialsByCitizen);
testimonialRouter.put('/:id',isAuthenticated,allowedTo("citizen"), testimonialController.updateTestimonial);
testimonialRouter.delete('/:id',isAuthenticated,allowedTo("citizen"), testimonialController.deleteTestimonial);
export default testimonialRouter;
