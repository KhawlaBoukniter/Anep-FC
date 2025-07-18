const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

// Créer ou mettre à jour une évaluation
router.post('/', evaluationController.createOrUpdate);

// Obtenir les évaluations par inscription
router.get('/registration/:registrationId', evaluationController.getByRegistration);

// Obtenir les évaluations par module
router.get('/module/:moduleId', evaluationController.getByModule);

// Calculer la moyenne des évaluations pour un module
router.get('/stats/module/:moduleId', evaluationController.calculateAverage);

module.exports = router;