const express = require('express');
const router = express.Router();
const indisponibiliteController = require('../controllers/indisponibiliteController');

// CRUD Routes
router.post('/', indisponibiliteController.createIndisponibilite);
router.get('/', indisponibiliteController.getAllIndisponibilites);
router.get('/:id', indisponibiliteController.getIndisponibiliteById);
router.put('/:id', indisponibiliteController.updateIndisponibilite);
router.delete('/:id', indisponibiliteController.deleteIndisponibilite);

// Employé-specific routes
router.get('/employe/:employeId', indisponibiliteController.getByEmployeId);

module.exports = router;