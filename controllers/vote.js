import Vote from "../models/vote.js";

export const getVotes = async (req, res) => {
    try {
        let votes = await Vote.find();
        res.status(200).json({
            votes: votes
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error occurred while receiving the votes.', error });
    }
}

export const getSpecificVote = async (req, res) => {
    try {
        let vote = await Vote.findById(req.params.id);
        if (!vote) {
            return res.status(404).json({ message: 'The vote not found' });
        }
        res.status(200).json({
            vote: vote
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error occurred while receiving the vote.', error });
    }
}

export const addVote = async (req, res) => {
    const { electionId, citizenId, candidateId } = req.body;

    try {
        // Check if a vote already exists for the given electionId and citizenId
        const existingVote = await Vote.findOne({ electionId, citizenId });
        if (existingVote) {
            // If a vote exists, return an error message
            return res.status(400).json({ message: 'You have already voted in this election.' });
        }
        // If no vote exists, create a new vote
        const newVote = new Vote({ electionId, citizenId, candidateId });
        await newVote.save();

        res.status(201).json({ message: 'Vote added successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error occurred while adding the vote.', error });
    }
}

export const deleteVote = async (req, res) => {
    try {
        const targetVote = await Vote.findById(req.params.id);
        if (!targetVote) {
            return res.status(404).json({ message: 'The vote not found' });
        }
        
        await Vote.findByIdAndDelete(req.params.id);
        res.status(204).json({ message: 'The vote is deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error occurred while removing the vote.', error });
    }
}
