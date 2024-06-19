import mongoose from 'mongoose';

const citizenSchema = new mongoose.Schema({
    ssn: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+20\d{10}$/, 'Please use a valid Egyptian phone number (+20 followed by 10 digits).']
    },
    emailConfirmation:{
        type:Boolean,
        default:0
    }
});

export const Citizen = mongoose.model('Citizen', citizenSchema);
