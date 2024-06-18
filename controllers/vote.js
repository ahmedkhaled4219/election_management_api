import Vote from "../models/vote.js";
import Election from "../models/election.js";
import Result from "../models/result.js";
import { catchAsyncErr } from "../utilities/catchError.js";


export const getVotes = catchAsyncErr(async (req, res) => {
    let votes = await Vote.find();
    res.status(200).json({
        votes: votes
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

export const addVote = catchAsyncErr(async (req, res) => {
    const { electionId, citizenId, candidateId } = req.body;
    // Check if a vote already exists for the given electionId and citizenId
    const existingVote = await Vote.findOne({ electionId, citizenId });
    if (existingVote) {
        // If a vote exists, return an error message
        return res.status(400).json({ message: 'You have already voted in this election.' });
    }
    // If no vote exists, create a new vote
    const newVote = new Vote({ electionId, citizenId, candidateId });
    await newVote.save();
    // Increment total votes in the election
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });
    const updatedElection = await Election.findById(electionId);
    // Increment vote count for candidate in the election
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
        console.log("total votes = ",updatedElection.totalVotes);
        console.log("percentage = ",(1 / updatedElection.totalVotes) * 100);
        await newResult.save();
    }
    // Update percentages for all candidates
    const allResults = await Result.find({ electionId });
    for (const result of allResults) {
        const newPercentage = (result.voteCount / updatedElection.totalVotes) * 100;
        await Result.updateOne({ _id: result._id }, { percentage: newPercentage });
    }
    res.status(201).json({ message: 'Vote added successfully.' });
})
