import Election from "../models/election.js ";
import {Candidate} from '../models/candidate.js'; 
import { Citizen } from "../models/citizen.js";
import { catchAsyncErr } from "../utilities/catchError.js";
import { paginateArray } from "../utilities/pagination.js";

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


export async function getElections(req, res) {
  try {
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    let query = {};
    const currentDate = new Date();

    if (status) {
      if (status == 'pending') {
        query = { startdate: { $gt: currentDate } };
      } else if (status == 'in-progress') {
        query = { startdate: { $lt: currentDate }, enddate: { $gt: currentDate } };
      } else if (status == 'finished') {
        query = {
          $or: [
            { enddate: { $lt: currentDate } },
            {
              $and: [
                { startdate: { $lt: currentDate } },
                { enddate: { $gt: currentDate } },
                { candidates: { $size: 1 } }
              ]
            }
          ]
        };
      } else {
        return res.status(400).json({
          message: "Please provide a valid status."
        });
      }
    }

    const total = await Election.countDocuments(query);

    const elections = await Election.find(query)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .lean();

    // Process candidates for each election
    const updatedElections = [];
    for (const election of elections) {
      const updatedCandidates = [];

      for (const candidate of election.candidates) {
        const candidateDetails = await Candidate.findById(candidate._id).lean();
        if (candidateDetails) {
          const citizenDetails = await Citizen.findById(candidateDetails.citizenId).lean();
          if (citizenDetails) {
            updatedCandidates.push({
              ...candidate,
              candidateDetails,
              citizenDetails,
            });
          } else {
            updatedCandidates.push(candidate);
          }
        } else {
          updatedCandidates.push(candidate);
        }
      }

      updatedElections.push({
        ...election,
        candidates: updatedCandidates,
      });
    }

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      results: updatedElections,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}



// Get a single election
export async function getElectionById(req, res) {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Array to hold the updated candidates with details
    const updatedCandidates = [];

    // Iterate over each candidate in the election to fetch details
    for (const candidate of election.candidates) {
      // Fetch candidate details
      const candidateDetails = await Candidate.findById(candidate._id);

      if (candidateDetails) {
        // Fetch citizen details if candidate details are found
        const citizenDetails = await Citizen.findById(candidateDetails.citizenId);

        // Append candidate with details to updatedCandidates array
        updatedCandidates.push({
          ...candidate.toObject(),
          candidateDetails: candidateDetails.toObject(),
          citizenDetails: citizenDetails ? citizenDetails.toObject() : {}, // Include citizen details if found
        });
      } else {
        // If candidate details are not found, push the original candidate object
        updatedCandidates.push(candidate.toObject());
      }
    }

    // Create a copy of the election object with updated candidates
    const updatedElection = {
      ...election.toObject(),
      candidates: updatedCandidates,
    };

    res.status(200).json(updatedElection); // Send the updated election object with detailed candidates
  } catch (err) {
    console.error(err);
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


// ahmed nasser dashboard
// Get all elections
export async function getCandidateElections(req, res) {
  try {
    const citizenId = req.params.id;

    if (!citizenId) {
      return res.status(400).json({ message: "Citizen ID is required" });
    }

    // Retrieve all elections
    let elections = await Election.find({});

    // Array to hold the updated elections
    const updatedElections = [];

    // Iterate over each election to fetch candidate and citizen details
    for (const election of elections) {
      let updatedCandidates = [];
      let includeElection = false;

      for (const candidate of election.candidates) {
        // Fetch candidate details
        const candidateDetails = await Candidate.findById(candidate._id);

        if (candidateDetails) {
          // Check if the candidate's citizenId matches the provided citizenId
          if (candidateDetails.citizenId.toString() == citizenId) {
            includeElection = true; // Mark this election to be included in the result

            // Fetch citizen details
            const citizenDetails = await Citizen.findById(candidateDetails.citizenId);

            // Append candidate and citizen details to the candidate object
            updatedCandidates.push({
              ...candidate.toObject(),
              candidateDetails: candidateDetails.toObject(),
              citizenDetails: citizenDetails ? citizenDetails.toObject() : {},
            });
          }
        }
      }

      // Add the updated candidates array to the election if it includes the candidate with the given citizenId
      if (includeElection) {
        updatedElections.push({
          ...election.toObject(),
          candidates: updatedCandidates
        });
      }
    }

    res.status(200).json(updatedElections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
