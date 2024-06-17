import mongoose from "mongoose";
const {Schema} = mongoose;

const voteSchema = new Schema({
    electionId:{
        type: Schema.Types.ObjectId,
        ref:"Election",
    },
    citizenId:{
        type: Schema.Types.ObjectId,
        ref:"Citizen",
    },
    candidateId:{
        type: Schema.Types.ObjectId,
        ref:"Candidate",
    },
},
{ timestamps: true });

const Vote = mongoose.model("Vote", voteSchema); 

export default Vote;
