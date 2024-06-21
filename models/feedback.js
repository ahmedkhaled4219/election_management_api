import mongoose, { Schema } from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    citizenId: {
        type: Schema.Types.ObjectId,
        ref: 'Citizen',
        required: true
    },
    electionId: {
        type: Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    content: {
        type: String,
        required:true
    }
}, {
    timestamps: true
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
