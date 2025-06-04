const Job = require('./models/job');

// Controller to add a new job
exports.addJob = async (req, res) => {
  try {
    const { nom_emploi, entite, formation, experience, codeEmploi, poidEmploi, requiredSkills } = req.body;

    // Validate required fields
    if (!nom_emploi || !entite || !formation || !experience || !codeEmploi) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Create a new job instance
    const newJob = new Job({
      nom_emploi,
      entite,
      formation,
      experience: parseInt(experience), // Ensure experience is a number
      codeEmploi,
      poidEmploi: poidEmploi || '', // Default to empty string if not provided
      requiredSkills: requiredSkills || [], // Default to empty array if not provided
    });

    // Save the job to the database
    await newJob.save();

    return res.status(201).json({ message: 'Job added successfully', job: newJob });
  } catch (error) {
    console.error('Error adding job:', error);
    return res.status(500).json({ message: 'Server error while adding job' });
  }
};