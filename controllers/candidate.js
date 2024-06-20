import { Candidate } from "../models/candidate.js";
import Election from "../models/election.js";
import { catchAsyncErr } from "../utilities/catchError.js";

const createCandidate = catchAsyncErr(async (req, res) => {
    const {citizenId}=req.citizen.citizen._id;
    const {party, brief, criminalRecord, logoName, logoImage } = req.body;
    const newCandidate = await Candidate.create({
        citizenId,
        party,
        brief,
        criminalRecord,
        logoName,
        logoImage,
    });

    res.status(201).json({ message: "You are Candidate now ", candidate: newCandidate });
});

export const applyCandidate = catchAsyncErr(async (req, res) => {
    const { electionId, party, brief, criminalRecord, logoName, logoImage } = req.body;
    const citizenId = req.citizen.citizen._id;
  
    const election = await Election.findById(electionId);
    if (!election) {
        return res.status(404).json({ message: "Election not found." });
    }

    const existingApplication = await Candidate.findOne({
        citizenId,
        electionId,
    });
    if (existingApplication) {
        return res.status(400).json({ message: "You have already applied for this election." });
    }

    const newCandidate = await Candidate.create({
        citizenId,
        electionId,
        party,
        brief,
        criminalRecord,
        logoName,
        logoImage,
        status: 'pending',
    });

    res.status(201).json({ message: "Application submitted successfully", candidate: newCandidate });
});

export const reviewCandidate = catchAsyncErr(async (req, res) => {
    const { candidateId, status } = req.body; 

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        return res.status(404).json({ message: "Candidate not found." });
    }

    if (status === 'approved') {
        const election = await Election.findById(candidate.electionId);
        if (!election) {
            return res.status(404).json({ message: "Election not found." });
        }
        election.candidates.push(candidate._id);
        await election.save();
    }

    candidate.status = status;
    await candidate.save();

    res.status(200).json({ message: `Candidate has been ${status}.`, candidate });
});

const showSpecificCandidate=catchAsyncErr(async(req,res)=>{
    const {candidateId}=req.params;
    const candidate=await Candidate.findById({_id:candidateId})
    res.status(200).json({message:"candidate showd successfully",candidate})
})

const showAllCandidates=catchAsyncErr(async(req,res)=>{
    const candidates=await Candidate.find()
    res.status(200).json({message:"All candidates showd successfully",candidates})
})


export { createCandidate,showAllCandidates,showSpecificCandidate};
