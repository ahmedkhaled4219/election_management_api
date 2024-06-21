import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
     citizenId:{
        type: Schema.Types.ObjectId,
        ref:"Citizen",
        required:true
    },
    electionId:{
        type: Schema.Types.ObjectId,
        ref:"Election",
        required:true
    },
    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
