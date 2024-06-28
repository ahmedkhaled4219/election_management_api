import Result from "../models/result.js";
import Vote from "../models/vote.js";
import Election from "../models/election.js";
import { Citizen } from "../models/citizen.js";
import { Candidate } from "../models/candidate.js";
import mongoose from "mongoose";

export const getElectionResult = async (req, res) => {
  const electionId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const results = await Vote.aggregate([
      {
        $match: { electionId },
      },
      {
        $group: {
          _id: { electionId: "$electionId", candidateId: "$candidateId" },
          voteCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.electionId",
          candidates: {
            $push: {
              candidateId: "$_id.candidateId",
              voteCount: "$voteCount",
            },
          },
          totalVotes: { $sum: "$voteCount" },
        },
      },
    ]);

    // Flatten the results for populating
    const flattenedResults = results.flatMap((result) =>
      result.candidates.map((candidate) => ({
        electionId: result?._id,
        candidateId: candidate?.candidateId,
        voteCount: candidate?.voteCount,
        totalVotes: result?.totalVotes,
        percentage: (candidate?.voteCount / result?.totalVotes) * 100,
      }))
    );

    // Populate the electionId with election details, and candidateId with candidate and citizen details
    const populatedResults = await Election.populate(flattenedResults, {
      path: "electionId",
    }).then((electionPopulatedResults) => {
      return Candidate.populate(electionPopulatedResults, {
        path: "candidateId",
        populate: {
          path: "citizenId",
          model: "Citizen",
        },
      });
    });

    // Format the final response
    const formattedResults = populatedResults.reduce((acc, result) => {
      const election = acc.find((e) =>
        e?.electionId?.equals(result?.electionId)
      );
      const candidateInfo = {
        candidateId: result?.candidateId?._id,
        candidateName: `${result?.candidateId?.citizenId?.firstName} ${result?.candidateId?.citizenId?.lastName}`,
        voteCount: result?.voteCount,
        percentage: result?.percentage.toFixed(2),
        candidateDetails: result?.candidateId,
        citizenDetails: result?.candidateId?.citizenId,
      };
      if (election) {
        election.candidates.push(candidateInfo);
      } else {
        acc.push({
          electionId: result?.electionId,
          electionName: result?.electionId?.name,
          startDate: result?.electionId?.startDate,
          candidates: [candidateInfo],
        });
      }
      return acc;
    }, []);

    res.status(200).json({ results: formattedResults });
  } catch (error) {
    res.status(500).json({
      message: `Server error occurred while loading the results: ${error}`,
    });
  }
};

export const getspecificResult = async (req, res) => {
  const result = await Result.findById(req.params.id);
  try {
    res.status(200).json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: `server error occured while loading the result ${error}`,
    });
  }
};

export const getCandidateResult = async (req, res) => {
  const result = await Result.find({
    electionId: req.params.electionId,
    candidateId: req.params.candidateId,
  });
  try {
    res.status(200).json({
      result,
    });
  } catch (error) {
    res.status(500).json({
      message: `server error occured while loading the result ${error}`,
    });
  }
};

export const getElectionsResult = async (req, res) => {
  try {
    const results = await Vote.aggregate([
      {
        $match: { electionId: { $ne: null } }, // Filter out documents where electionId is null
      },
      {
        $group: {
          _id: { electionId: "$electionId", candidateId: "$candidateId" },
          voteCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.electionId",
          candidates: {
            $push: {
              candidateId: "$_id.candidateId",
              voteCount: "$voteCount",
            },
          },
          totalVotes: { $sum: "$voteCount" },
        },
      },
    ]);

    // Filter out any results where electionId is null (extra safety)
    const filteredResults = results.filter((result) => result._id !== null);

    // Flatten the results for populating
    const flattenedResults = filteredResults.flatMap((result) =>
      result?.candidates.map((candidate) => ({
        electionId: result?._id,
        candidateId: candidate?.candidateId,
        voteCount: candidate?.voteCount,
        totalVotes: result?.totalVotes,
        percentage: (candidate?.voteCount / result?.totalVotes) * 100,
      }))
    );

    // Populate the electionId with election details, and candidateId with candidate and citizen details
    const populatedResults = await Election.populate(flattenedResults, {
      path: "electionId",
    }).then((electionPopulatedResults) => {
      return Candidate.populate(electionPopulatedResults, {
        path: "candidateId",
        populate: {
          path: "citizenId",
          model: "Citizen",
        },
      });
    });

    // Format the final response
    const formattedResults = populatedResults.reduce((acc, result) => {
      const election = acc.find((e) => e.electionId?.equals(result.electionId));
      const candidateInfo = {
        candidateId: result?.candidateId?._id,
        candidateName: `${result.candidateId?.citizenId?.firstName} ${result.candidateId?.citizenId?.lastName}`,
        voteCount: result?.voteCount,
        percentage: result?.percentage.toFixed(2),
      };
      if (election) {
        election?.candidates.push(candidateInfo);
      } else {
        acc.push({
          electionId: result?.electionId,
          electionName: result.electionId?.name, // Assuming 'name' is the field for election name
          candidates: [candidateInfo],
        });
      }
      return acc;
    }, []);

    formattedResults.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
    let formatresult2 = formattedResults.filter((a) => {
      console.log(a.electionId);
      return a.electionId !== null;
    });

    res.status(200).json({ results: formatresult2 });
  } catch (error) {
    res.status(500).json({
      message: `Server error occurred while loading the results: ${error}`,
    });
  }
};

