import mongoose from 'mongoose';
import { validateSSN, extractSSNInfo } from '../utilities/ssnutils.js';

const citizenSchema = new mongoose.Schema({
    ssn: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                const { valid } = validateSSN(value);
                return valid;
            },
            message: props => `Invalid SSN: ${props.value}`
        }
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
        enum: ['citizen','admin','candidate'],
        required: true,
        default:"citizen"
    },
    password: {
        type: String,
        required: true,
        match: [
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$/,
            'Password does not meet the complexity requirements. It should be 8-32 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        ]
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
        unique: true,
        match: [/^\+20\d{10}$/, 'Please use a valid Egyptian phone number (+20 followed by 10 digits).']
    },
    emailConfirmation:{
        type:Boolean,
        default:false
    },
    birthDate: {
        type: Date,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    governorate: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    otpkey: {
        type: String,
        default: null
    },
    otpExpiredDate: {
        type: Date,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['blocked', 'unblocked'],
        default: 'unblocked'
    },
});

citizenSchema.pre('validate', function(next) {
    if (this.ssn) {
        const { birthDate, age, governorate, gender } = extractSSNInfo(this.ssn);
        this.birthDate = birthDate;
        this.age = age;
        this.governorate = governorate;
        this.gender = gender;
    }
    next();
});

export const Citizen = mongoose.model('Citizen', citizenSchema);
