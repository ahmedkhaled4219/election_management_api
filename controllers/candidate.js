import { Candidate } from "../models/candidate.js";
import { Citizen } from "../models/citizen.js";
import Election from "../models/election.js";
import { catchAsyncErr } from "../utilities/catchError.js";
import { paginate } from "../utilities/pagination.js";
import { upload } from "../config/cloudinary.js";

const createCandidate = catchAsyncErr(async (req, res) => {
  const citizenId = req.citizen.citizen._id;
  const { party, brief, criminalRecord, logoName, logoImage, electionId } =
    req.body;

  const newCandidate = await Candidate.create({
    citizenId,
    party,
    brief,
    criminalRecord,
    logoName,
    logoImage,
    electionId,
  });

  await Citizen.findByIdAndUpdate(citizenId, { role: "candidate" });

  res
    .status(201)
    .json({ message: "You are a candidate now", candidate: newCandidate });
});

export const applyCandidate =[
  upload.fields([
    { name: 'criminalRecord', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 },
  ]), catchAsyncErr(async (req, res) => {

  const { electionId, party, brief,logoName} =
    req.body;
  const citizenId = req.citizen.citizen._id;
 
  const citizen = await Citizen.findById(citizenId);
  if (citizen.status === 'blocked') {
    return res.status(403).json({ message: 'You are blocked from applying as a candidate.' });
  }

  const election = await Election.findById(electionId);
  if (!election) {
    return res.status(404).json({ message: "Election not found." });
  }
  const currentDate = new Date();
  if(election.startdate<currentDate && election.enddate>currentDate){
    return res.status(404).json({ message: "Invalid request .. the Election in progress" });
  }
  if(election.enddate<currentDate){
    return res.status(404).json({ message: "Invalid request .. the Election is finished" });
  }
  const existingApplication = await Candidate.findOne({
    citizenId,
    electionId,
  });
  if (existingApplication) {
    return res
      .status(400)
      .json({ message: "You have already applied for this election." });
  }
  const criminalRecord = req.files['criminalRecord'] ? req.files['criminalRecord'][0].path : null;
  const logoImage = req.files['logoImage'] ? req.files['logoImage'][0].path : null;
  const newCandidate = await Candidate.create({
    citizenId,
    electionId,
    party,
    brief,
    criminalRecord,
    logoName,
    logoImage,
    status: "pending",
  });
  
  await Citizen.findByIdAndUpdate(citizenId, {
    $push: {
      applicationStatus: {
        electionId,
        comment: 'Application submitted',
        status: 'pending',
        timestamp: new Date()
      }
    }
  });
  
  res
    .status(201)
    .json({
      message: "Application submitted successfully",
      candidate: newCandidate,
    });
})];

export const reviewCandidate = catchAsyncErr(async (req, res) => {
  const { candidateId, status,comment: providedComment  } = req.body;
  let comment = providedComment;
  const citizenId = req.citizen.citizen._id;
  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
  }

  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found." });
  }

  if (status === "approved") {
    const election = await Election.findById(candidate.electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }
    election.candidates.push(candidate._id);
    await election.save();
    if (candidate.citizenId && candidate.citizenId._id) {
      // Update the role of the citizen to "candidate" if approved
      await Citizen.findByIdAndUpdate(candidate.citizenId._id, { role: "candidate" }); 
    }
    comment="application approved"
    await Citizen.findByIdAndUpdate(candidate.citizenId, {
      $set: {
        "applicationStatus.$[elem].status": status,
        "applicationStatus.$[elem].comment": comment
      }
    }, {
      arrayFilters: [{ "elem.electionId": candidate.electionId }]
    }); 
  }
    else if(status==="rejected"){
      if (!comment) {
        return res.status(400).json({ message: 'Comment is required for rejection.' });
      }
      await Citizen.findByIdAndUpdate(candidate.citizenId, {
        $set: {
          "applicationStatus.$[elem].status": status,
          "applicationStatus.$[elem].comment": comment
        }
      }, {
        arrayFilters: [{ "elem.electionId": candidate.electionId }]
      });
    }

  candidate.status = status;
  await candidate.save();

  res.status(200).json({ message: `Candidate has been ${status}.`, candidate });
});

const showSpecificCandidate = catchAsyncErr(async (req, res) => {
    const candidateId = req.params.id;
  const candidate = await Candidate.findById({ _id: candidateId }).populate('citizenId').populate('electionId');
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found.' });
  }
  res.status(200).json({ message: "candidate showd successfully", candidate });
});

const showAllCandidates = catchAsyncErr(async (req, res) => {
  const { page, limit, status } = req.query;
  const paginationResults = await paginate(Candidate, { status }, page, limit);
  res.status(200).json({
    message: `Candidates with status '${status}' retrieved successfully`,
    paginationResults,
  });

});

 const getLastCandidateApplied = catchAsyncErr(async (req, res) => {
    const lastApplication = await Candidate.findOne().sort({ requestedAt: -1 }).populate('citizenId electionId');
    res.status(200).json({
        message: 'Last candidate application retrieved successfully',
        lastApplication
    });
});

const updateCandidate = [
  upload.fields([
    { name: 'criminalRecord', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]), catchAsyncErr(async (req, res) => {
    const  candidateId  = req.params.id;
    const { party, brief, logoName, electionId,firstName, lastName, image, phoneNumber } = req.body;
   
    const candidate = await Candidate.findById(candidateId).populate('citizenId');
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    if (party) candidate.party = party;
    if (brief) candidate.brief = brief;
    if (logoName) candidate.logoName = logoName;
    if (electionId) candidate.electionId = electionId;
    if (req.files['criminalRecord']) candidate.criminalRecord = req.files['criminalRecord'][0].path;
    if (req.files['logoImage']) candidate.logoImage = req.files['logoImage'][0].path;
    
    const citizen = candidate.citizenId;
    if (citizen) {
      if (firstName) citizen.firstName = firstName;
      if (lastName) citizen.lastName = lastName;
      if (req.files['image']) citizen.image = req.files['image'][0].path; 
      if (phoneNumber) citizen.phoneNumber = phoneNumber;
      await citizen.save();
    }
    await candidate.save();

    res.status(200).json({ message: 'Candidate updated successfully', candidate });
  })
];


export const getApprovedCandidates = catchAsyncErr(async(req,res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page-1) * limit;
  let count = await Candidate.find({status:"approved"}).count();
  let candiates = await Candidate.find({status : "approved"}).populate('citizenId electionId').skip(skip).limit(limit);
  res.status(200).json({
    count,
    candiates
  });
})

export { createCandidate, showAllCandidates, showSpecificCandidate ,getLastCandidateApplied,updateCandidate};
