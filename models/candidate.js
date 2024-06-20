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
        enum: ['approved', 'pending','rejected'],
        default: 'pending'
    }
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
