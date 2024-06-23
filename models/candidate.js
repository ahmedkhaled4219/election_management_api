import mongoose, { Schema } from 'mongoose';

const candidateSchema = new mongoose.Schema({
    citizenId: {
        type: Schema.Types.ObjectId,
        ref: 'Citizen',
    },
    electionId: {
        type: Schema.Types.ObjectId,
        ref: 'Election',
        required: true,
    },
    party: {
        type: String,
        required: true,
    },
    brief: {
        type: String,
        required: true,
    },
    criminalRecord: {
        type: String,
        required: true,
    },
    logoName: {
        type: String,
        required: true,
        unique: true
    },
    logoImage: {
        type: String,
        required: true,
        unique: true
        },
    status: {
        type: String,
        enum: ['approved', 'pending','rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: Date,
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
