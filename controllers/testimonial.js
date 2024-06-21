import { Testimonial } from '../models/testimonial.js';
import {catchAsyncErr} from '../utilities/catchError.js';
import { paginate } from '../utilities/pagination.js';

export const createTestimonial = catchAsyncErr(async (req, res) => {
    const { citizenId, electionId, message } = req.body;
    const testimonial = await Testimonial.create({ citizenId, electionId, message });
    res.status(201).json({ message: "Testimonial created successfully", testimonial });
});

export const getAllTestimonials = catchAsyncErr(async (req, res) => {
    const { page, limit } = req.query;
    const paginationResults = await paginate(Testimonial, page, limit);
    res.status(200).json({ message: "All testimonials retrieved successfully", paginationResults });
});

