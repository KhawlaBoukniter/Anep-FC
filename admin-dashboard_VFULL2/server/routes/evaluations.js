const express = require("express");
const router = express.Router();
const evaluationController = require("../controllers/evaluationController");

// Créer une évaluation
router.post("/", evaluationController.createEvaluation);

// Récupérer toutes les évaluations
router.get("/", evaluationController.getAllEvaluations);

// Récupérer une évaluation par ID
router.get("/:id", evaluationController.getEvaluationById);

// Mettre à jour une évaluation
router.put("/:id", evaluationController.updateEvaluation);

// Supprimer une évaluation
router.delete("/:id", evaluationController.deleteEvaluation);

// Récupérer les évaluations par registration_id
router.get("/registration/:registrationId", evaluationController.getEvaluationsByRegistrationId);

module.exports = router;