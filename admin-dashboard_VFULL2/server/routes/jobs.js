const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// GET /api/jobs - Récupérer tous les emplois
router.get("/", jobController.getAllJobs);

// GET /api/jobs/:id - Récupérer un emploi par ID
router.get("/:id", jobController.getJob);

// POST /api/jobs - Créer un nouvel emploi
router.post("/", jobController.createJob);

// PUT /api/jobs/:id - Mettre à jour un emploi
router.put("/:id", jobController.updateJob);

// DELETE /api/jobs/:id - Supprimer un emploi
router.delete("/:id", jobController.deleteJob);

// PUT /api/jobs/:id/archive - Archiver un emploi
router.put("/:id/archive", jobController.archiveJob);

// PUT /api/jobs/:id/unarchive - Désarchiver un emploi
router.put("/:id/unarchive", jobController.unarchiveJob);

module.exports = router;