import express from 'express';
import * as testimonialController from '../controllers/testimonial.js';

const testimonialRouter = express.Router();

testimonialRouter.post('/', testimonialController.createTestimonial);
testimonialRouter.get('/', testimonialController.getAllTestimonials);


export default testimonialRouter;
