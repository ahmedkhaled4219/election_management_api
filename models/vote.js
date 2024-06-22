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
    voteDate: {
        type: Date,
        default: Date.now
    }
},
{ timestamps: true });

const Vote = mongoose.model("Vote", voteSchema); 

export default Vote;
