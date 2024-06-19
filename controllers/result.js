import Result from "../models/result.js";

export const getElectionResult = async(req,res) => {
    const results = await Result.find({electionId:req.params.id});
    try {
        res.status(200).json({
            results
        })
    } catch (error) {
        res.status(500).json({
            "message" : `server error occured while loading the results ${error}`
        })
    }
}

export const getspecificResult = async(req,res) => {
    const result = await Result.findById(req.params.id);
    try {
        res.status(200).json({
            result
        })
    } catch (error) {
        res.status(500).json({
            "message" : `server error occured while loading the result ${error}`
        })
    }
}

export const getCandidateResult = async(req,res) => {
    const result = await Result.find({electionId:req.params.electionId , candidateId : req.params.candidateId});
    try {
        res.status(200).json({
            result
        })
    } catch (error) {
        res.status(500).json({
            "message" : `server error occured while loading the result ${error}`
        })
    }
}