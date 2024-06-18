import { Candidate } from "../models/candidate.js";
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
