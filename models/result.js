import mongoose from "mongoose";
const {Schema} = mongoose;

const resultSchema = new Schema({
    electionId:{
        type: Schema.Types.ObjectId,
        ref:"Election",
    },
    candidateId:{
        type: Schema.Types.ObjectId,
        ref:"Candidate",
    },
    voteCount:{
        type:Number,
        default:0,
    },
    percentage:{
        type:Number,
        default:0,
    }
},
{ timestamps: true });

const Result = mongoose.model("Result", resultSchema); 

export default Result;
