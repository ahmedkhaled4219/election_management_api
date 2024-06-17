import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const electionSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    startdate: { type: Date, required: true },
    enddate: { type: Date, required: true },
    // candidates: [{ type: Schema.Types.ObjectId, ref: "Candidate" }], 
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
