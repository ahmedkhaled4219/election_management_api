import Election from "../models/election.js ";

// Create a new election
export async function createElection(req, res) {
  const { title, description, startdate, enddate, candidates } = req.body;

  try {
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
