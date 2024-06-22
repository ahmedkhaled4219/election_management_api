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

export const getTestimonialsByElection = catchAsyncErr(async (req, res) => {
    const { electionId } = req.params;
    const testimonials = await Testimonial.find({ electionId }).populate('citizenId electionId');
    res.status(200).json({ message: "Testimonials for election retrieved successfully", testimonials });
});

export const getTestimonialsByCitizen = catchAsyncErr(async (req, res) => {
    const { citizenId } = req.params;
    const testimonials = await Testimonial.find({ citizenId }).populate('citizenId electionId');
    res.status(200).json({ message: "Testimonials for citizen retrieved successfully", testimonials });
});
export const updateTestimonial = catchAsyncErr(async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(id, { message }, { new: true }).populate('citizenId electionId');
    if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
    }
    res.status(200).json({ message: "Testimonial updated successfully", testimonial });
});

export const deleteTestimonial = catchAsyncErr(async (req, res) => {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
    }
    res.status(200).json({ message: "Testimonial deleted successfully" });
});