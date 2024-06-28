import Election from "../models/election.js";
import { catchAsyncErr } from "../utilities/catchError.js";


export const checkValidVote = catchAsyncErr(async (req, res,next) => {
    const { electionId, citizenId, candidateId } = req.body;
    const targetElection = await Election.findById(electionId);
    const currentDate = Date.now();
    if (!targetElection) {
        return res.status(404).json({ message: "Election not found" });
    }
    if(targetElection.enddate < currentDate){
        return res.status(400).json({
            "message":"Invalid date to vote. The election has ended."
        });
    }
    if(targetElection.startdate > currentDate){
        return res.status(400).json({
            "message":"Invalid date to vote. The election hasn't started yet."
    });
    }
    next();
})