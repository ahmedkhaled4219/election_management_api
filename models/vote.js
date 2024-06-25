import mongoose from "mongoose";
const {Schema} = mongoose;

const voteSchema = new Schema({
    electionId:{
        type: Schema.Types.ObjectId,
        ref:"Election",
        required:true
    },
    citizenId:{
        type: Schema.Types.ObjectId,
        ref:"Citizen",
        required:true
    },
    candidateId:{
        type: Schema.Types.ObjectId,
        ref:"Candidate",
        required:true
    }
},
{ timestamps: true });

const Vote = mongoose.model("Vote", voteSchema); 

export default Vote;
