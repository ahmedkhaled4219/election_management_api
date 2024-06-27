import Election from "../models/election.js ";
import { catchAsyncErr } from "../utilities/catchError.js";

// Create a new election
export async function createElection(req, res) {
  const { title, description, startdate, enddate, candidates } = req.body;


  try {
    const currentDate = new Date();
    const minStartDate = new Date(currentDate);
    minStartDate.setDate(currentDate.getDate() + 1);

    const minEndDate = new Date(startdate);
    minEndDate.setDate(minEndDate.getDate() + 1);

    if (new Date(startdate) < minStartDate) {
      return res.status(400).json({
        message: "Start date must be at least one day after the current date."
      });
    }

    if (new Date(enddate) < minEndDate) {
      return res.status(400).json({
        message: "End date must be at least one day after the start date."
      });
    }
    const newElection = new Election({
      title,
      description,
      startdate,
      enddate,
      candidates,
    });

    await newElection.save();
    res.status(201).json(newElection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get all elections
export async function getElections(req, res) {
  try {
    const elections = await Election.find().populate("candidates");
    res.status(200).json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get a single election
export async function getElectionById(req, res) {
  try {
    const election = await Election.findById(req.params.id).populate(
      "candidates"
    );
    if (!election)
      return res.status(404).json({ message: "Election not found" });
    res.status(200).json(election);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Update an election
export async function updateElection(req, res) {
  const { title, description, startdate, enddate, candidates } = req.body;

  try {
    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { title, description, startdate, enddate, candidates },
      { new: true, runValidators: true }
    ).populate("candidates");

    if (!updatedElection)
      return res.status(404).json({ message: "Election not found" });
    res.status(200).json(updatedElection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Delete an election
export async function deleteElection(req, res) {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election)
      return res.status(404).json({ message: "Election not found" });
    res.status(204).json();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export const getLastElection = catchAsyncErr(async (req, res) => {
  const lastApplication = await Election.findOne().sort({ startdate: -1 });
  res.status(200).json({
      message: 'Last candidate application retrieved successfully',
      lastApplication
  });
});

export async function getElectionsByCandidate(req, res) {
  const candidateId = req.params.candidateId;

  try {
    const elections = await Election.find({ candidates: candidateId }).populate("candidates");

    if (elections.length === 0) {
      return res.status(404).json({ message: "No elections found for this candidate" });
    }

    res.status(200).json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
