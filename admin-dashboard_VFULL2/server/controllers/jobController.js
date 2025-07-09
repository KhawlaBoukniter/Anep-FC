const jobModel = require("../models/jobModel");

exports.getAllJobs = async (req, res) => {
  try {
    const { search, archived } = req.query;
    const jobs = await jobModel.getAllJobs(search, archived === "true");
    res.json(jobs);
  } catch (error) {
    console.error("Erreur lors de la récupération des emplois:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des emplois" });
  }
};

exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await jobModel.getJobById(id);

    if (!job) {
      return res.status(404).json({ error: "Emploi non trouvé" });
    }

    res.json(job);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'emploi:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'emploi" });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { error, value } = jobModel.jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { required_skills, ...jobData } = value;
    const newJob = await jobModel.createJob(jobData, required_skills);
    const completeJob = await jobModel.getCompleteJob(newJob.id_emploi);

    res.status(201).json(completeJob);
  } catch (error) {
    console.error("Erreur lors de la création de l'emploi:", error);

    if (error.code === "23505") {
      res.status(409).json({ error: "Un emploi avec ce code existe déjà" });
    } else {
      res.status(500).json({ error: "Erreur lors de la création de l'emploi" });
    }
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = jobModel.jobSchema.validate(req.body);

    if (error) {
      console.error("Validation error:", error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { required_skills, ...jobData } = value;
    await jobModel.updateJob(id, jobData, required_skills);
    const completeJob = await jobModel.getCompleteJob(id);

    res.json(completeJob);
  } catch (error) {
    console.error("Error during job update:", error.stack || error);

    if (error.message === "Emploi non trouvé") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'emploi" });
    }
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedJob = await jobModel.deleteJob(id);

    if (!deletedJob) {
      return res.status(404).json({ error: "Emploi non trouvé" });
    }

    res.json({
      message: "Emploi supprimé avec succès",
      job: { id: deletedJob.id_emploi.toString() },
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'emploi:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'emploi" });
  }
};

exports.archiveJob = async (req, res) => {
  try {
    console.log("Archive job request for id:", req.params.id);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

    await jobModel.archiveJob(id);
    res.status(204).json({ message: "Emploi archivé avec succès." });
  } catch (error) {
    console.error("Controller error in archiveJob:", error.stack);
    if (error.message === "Emploi non trouvé") {
      return res.status(404).json({ message: "Emploi non trouvé." });
    }
    res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
};

exports.unarchiveJob = async (req, res) => {
  try {
    console.log("Unarchive job request for id:", req.params.id);
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

    await jobModel.unarchiveJob(id);
    res.status(204).json({ message: "Emploi désarchivé avec succès." });
  } catch (error) {
    console.error("Controller error in unarchiveJob:", error.stack);
    if (error.message === "Emploi non trouvé") {
      return res.status(404).json({ message: "Emploi non trouvé." });
    }
    res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
};

exports.importFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }
    const filePath = `/uploads/${req.file.filename}`;
    await jobModel.saveCommonFile(filePath);
    res.status(201).json({ message: "Fichier importé avec succès", filePath });
  } catch (error) {
    console.error("Erreur lors de l'importation du fichier:", error);
    res.status(500).json({ error: "Erreur lors de l'importation du fichier" });
  }
};