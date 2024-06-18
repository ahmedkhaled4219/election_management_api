import { Candidate } from "../models/candidate.js";
import { catchAsyncErr } from "../utilities/catchError.js";

const createCandidate = catchAsyncErr(async (req, res) => {
    const {citizenId}=req.user._id;
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



export { createCandidate};
