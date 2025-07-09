const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const multer = require("multer");
const path = require("path");

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

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

// POST /api/jobs/import - Importer un fichier commun
router.post("/import", upload.single("file"), jobController.importFile);

module.exports = router;