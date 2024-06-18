import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    citizenId: {
        type: String,
        required: true,
        unique: true
    },
    party: {
        type: String,
        default: null
    },
    brief: {
        type: String,
        default: null
    },
    criminalRecord: {
        type: String,
        default: null
    },
    logoName: {
        type: String,
        required: true,
        unique: true
    },
    logoImage: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['approved', 'pending'],
        default: 'pending'
    }
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
