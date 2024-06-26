import Vote from "../models/vote.js";
import Election from "../models/election.js";
import Result from "../models/result.js";
import { Citizen } from "../models/citizen.js";
import { catchAsyncErr } from "../utilities/catchError.js";
import { sendOTP } from "../emailing/confirmOPTForVote.js";
import crypto from 'crypto';


export const getVotes = catchAsyncErr(async (req, res) => {
    let votes = await Vote.find();
    let totalvotes = await Vote.find().countDocuments();
    res.status(200).json({
        "total":totalvotes,
        "votes": votes
    }); 
})

export const getVoterElections = catchAsyncErr(async (req,res) => {
    let votes = await Vote.find({ citizenId :req.citizen.citizen._id});
    
    let electionPromises = votes.map(async (vote) => {
        let electiondetails = await Election.findById(vote.electionId);
        return electiondetails;
    });

    let elections = await Promise.all(electionPromises);
    
    res.status(200).json({
        "elections": elections
    });
})

export const getTopTwoCandidates = catchAsyncErr(async (req,res) => {
    let currentElections = await Election.find({enddate : {$gt : Date.now()}});
    let electionTopTwo = currentElections.map(async (election) => {
        let toptwo = await Result.find({electionId:election._id}).sort({percentage:-1}).limit(2);
        return toptwo;
    });
    let toptwo = await Promise.all(electionTopTwo);
    
    res.status(200).json({
        "top2": toptwo
    });

})

export const getSpecificVote = catchAsyncErr(async (req, res) => {
    let vote = await Vote.findById(req.params.id);
    if (!vote) {
        return res.status(404).json({ message: 'The vote not found' });
    }
    res.status(200).json({
        vote: vote
    });
})

export const getLastCitizenVote = catchAsyncErr(async (req, res) => {
    const lastVote = await Vote.findOne().sort({ createdAt: -1 }).populate('citizenId electionId');
    res.status(200).json({
        message: 'Last citizen vote retrieved successfully',
        lastVote
    });
});

export const addVote = catchAsyncErr(async (req, res) => {
    const { electionId, candidateId , otp } = req.body;
    const citizenId = req.citizen.citizen._id;
    const email = req.citizen.citizen.email;

    // Check if the election exists
    const election = await Election.findById(electionId);
    if(!election){
        return res.status(400).json({ message: 'This election doesn\'t exist.' });
    }
    if(election.candidates.length < 2){
        return res.status(400).json({ message: 'This election doesn\'t contain enough candidates.' });
    }

    // Check if the candidate exists in the election
    const candidateExists = election.candidates.some(candidate => candidate._id == candidateId);
    if (!candidateExists) {
        return res.status(400).json({ message: 'This candidate doesn\'t exist in the election.' });
    }

    // Check if a vote already exists for the given electionId and citizenId
    const existingVote = await Vote.findOne({ electionId, citizenId });
    if (existingVote) {
        return res.status(400).json({ message: 'You have already voted in this election.' });
    }

    const citizen = await Citizen.findOne({ email: email });
    if (citizen.status === 'blocked') {
        return res.status(403).json({ message: 'You are blocked from voting.' });
    }

    // Check OTP
    if (!otp) {
        const generatedOTP = crypto.randomBytes(3).toString('hex'); 
        const otpExpiredDate = new Date(Date.now() + 10 * 60 * 1000);
        const localOtpExpiredDate = new Date(otpExpiredDate.getTime() - (otpExpiredDate.getTimezoneOffset() * 60000));

        // Update citizen with the generated OTP and expiration date
        citizen.otpkey = generatedOTP;
        citizen.otpExpiredDate = localOtpExpiredDate;
        await citizen.save();

        await sendOTP(email, generatedOTP);

        return res.status(200).json({ message: 'OTP sent to your email. Please verify to proceed.' });
    } else {
        // Verify OTP
        if (otp !== citizen.otpkey || Date.now() > new Date(citizen.otpExpiredDate)) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Clear the OTP fields after verification
        citizen.otpkey = null;
        citizen.otpExpiredDate = null;
        await citizen.save();
    }

    // If no vote exists, create a new vote
    const newVote = new Vote({ electionId, citizenId, candidateId });
    await newVote.save();

    // Increment total votes in the election
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });

    // Fetch the updated election to get the new totalVotes
    const updatedElection = await Election.findById(electionId);

    // Update vote count for all candidates in the election
    let candidateUpdated = false;
    for (let i = 0; i < updatedElection.candidates.length; i++) {
        if (updatedElection.candidates[i]._id == candidateId) {
            updatedElection.candidates[i].totalVotes += 1;
            candidateUpdated = true;
        }
        updatedElection.candidates[i].percentage = (updatedElection.candidates[i].totalVotes / updatedElection.totalVotes) * 100;
    }


    // for result model 
    const targetResult = await Result.findOne({ electionId, candidateId });
    if (targetResult) {
        const updatedVoteCount = targetResult.voteCount + 1;
        const newPercentage = (updatedVoteCount / updatedElection.totalVotes) * 100;
        await Result.updateOne({ electionId, candidateId }, { $inc: { voteCount: 1 }, $set: { percentage: newPercentage } });
    } else {
        const newResult = new Result({
            electionId,
            candidateId,
            voteCount: 1,
            percentage: ((1 / updatedElection.totalVotes) * 100) // Calculate the percentage for the first vote
        });
        await newResult.save();
    }
    // Update percentages for all candidates
    const allResults = await Result.find({ electionId });
    for (const result of allResults) {
        const newPercentage = (result.voteCount / updatedElection.totalVotes) * 100;
        await Result.updateOne({ _id: result._id }, { percentage: newPercentage });
    }

    // Save the updated election
    await updatedElection.save();

    res.status(201).json({ message: 'Vote added successfully.' });
});