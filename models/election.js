import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const candidateSchema = new Schema({
  candidateId: { type: Schema.Types.ObjectId, ref: "Candidate" },
  totalVotes: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
});

const electionSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 100 ,unique: true},
    description: { type: String, maxlength: 500,required:true },
    startdate: { type: Date, required: true },
    enddate: { type: Date, required: true },
    candidates: [candidateSchema], 
    totalVotes:{
      type:Number,
      default:0,
    },
  },
  {
    timestamps: true, 
  }
);

electionSchema.pre("save", function (next) {
  if (this.startdate > this.enddate) {
    next(new Error("Start date must be before end date"));
  } else {
    next();
  }
});

const Election = model("Election", electionSchema);

export default Election;
