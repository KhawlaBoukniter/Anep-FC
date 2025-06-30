const express = require("express");
const multer = require("multer");
const router = express.Router();
const { importProfiles, undoLastImport } = require("../controllers/profileImportController");

const upload = multer({ dest: "uploads/" });

router.post("/import", upload.single("file"), (req, res, next) => {
    console.log("✅ Route /api/profiles/import bien appelée");
    console.log("Fichier reçu :", req.file);
    console.log("Corps de la requête :", req.body);
    next();
}, importProfiles);

router.post("/undo-last-import", undoLastImport);

module.exports = router;