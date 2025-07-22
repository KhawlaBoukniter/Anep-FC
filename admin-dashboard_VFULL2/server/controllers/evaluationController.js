const evaluationModel = require("../models/Evaluation");
const { CycleProgramRegistration, CycleProgramUserModule } = require("../models");

const createEvaluation = async (req, res) => {
  try {
    const evaluationData = req.body;

    // Validation des données
    if (
      !evaluationData.registration_id ||
      !evaluationData.module_id ||
      !Number.isInteger(evaluationData.apports) ||
      !Number.isInteger(evaluationData.reponse) ||
      !Number.isInteger(evaluationData.condition) ||
      !Number.isInteger(evaluationData.conception) ||
      !Number.isInteger(evaluationData.qualite) ||
      evaluationData.apports < 0 ||
      evaluationData.apports > 5 ||
      evaluationData.reponse < 0 ||
      evaluationData.reponse > 5 ||
      evaluationData.condition < 0 ||
      evaluationData.condition > 5 ||
      evaluationData.conception < 0 ||
      evaluationData.conception > 5 ||
      evaluationData.qualite < 0 ||
      evaluationData.qualite > 5
    ) {
      return res.status(400).json({ error: "Données d'évaluation invalides" });
    }

    // Vérifier si la registration_id est valide et associée au module_id
    const registration = await CycleProgramRegistration.findOne({
      where: { id: evaluationData.registration_id },
      include: [
        {
          model: CycleProgramUserModule,
          as: "CycleProgramUserModules",
          where: { module_id: evaluationData.module_id },
        },
      ],
    });

    if (!registration) {
      return res.status(404).json({
        error: "Aucune inscription trouvée pour ce module et ce cycle/programme",
      });
    }

    // Vérification si une évaluation existe déjà pour cette combinaison
    const existingEvaluations = await evaluationModel.getByRegistrationId(evaluationData.registration_id);
    if (existingEvaluations.some((eval) => eval.module_id === evaluationData.module_id)) {
      return res.status(409).json({
        error: "Une évaluation existe déjà pour ce module et cette inscription",
      });
    }

    const evaluation = await evaluationModel.create(evaluationData);
    res.status(201).json(evaluation);
  } catch (error) {
    console.error("Erreur lors de la création de l'évaluation:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création de l'évaluation" });
  }
};

const getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await evaluationModel.getAll();
    res.json(evaluations);
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des évaluations" });
  }
};

const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await evaluationModel.getById(id);
    if (!evaluation) {
      return res.status(404).json({ error: "Évaluation non trouvée" });
    }
    res.json(evaluation);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'évaluation:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de l'évaluation" });
  }
};

const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluationData = req.body;

    // Validation des données
    if (
      !Number.isInteger(evaluationData.apports) ||
      !Number.isInteger(evaluationData.reponse) ||
      !Number.isInteger(evaluationData.condition) ||
      !Number.isInteger(evaluationData.conception) ||
      !Number.isInteger(evaluationData.qualite) ||
      evaluationData.apports < 0 ||
      evaluationData.apports > 5 ||
      evaluationData.reponse < 0 ||
      evaluationData.reponse > 5 ||
      evaluationData.condition < 0 ||
      evaluationData.condition > 5 ||
      evaluationData.conception < 0 ||
      evaluationData.conception > 5 ||
      evaluationData.qualite < 0 ||
      evaluationData.qualite > 5
    ) {
      return res.status(400).json({ error: "Données d'évaluation invalides" });
    }

    const evaluation = await evaluationModel.update(id, evaluationData);
    if (!evaluation) {
      return res.status(404).json({ error: "Évaluation non trouvée" });
    }
    res.json(evaluation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évaluation:", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'évaluation" });
  }
};

const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await evaluationModel.remove(id);
    if (!evaluation) {
      return res.status(404).json({ error: "Évaluation non trouvée" });
    }
    res.json({ message: "Évaluation supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'évaluation:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression de l'évaluation" });
  }
};

const getEvaluationsByRegistrationId = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const evaluations = await evaluationModel.getByRegistrationId(registrationId);
    res.json(evaluations);
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations par registration_id:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des évaluations" });
  }
};

module.exports = {
  createEvaluation,
  getAllEvaluations,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationsByRegistrationId,
};