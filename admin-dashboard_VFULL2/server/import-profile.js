const express = require('express');
const multer = require('multer');
const path = require('path');
const cleanCsvFile = require('./cleanCsvFile');
const { exec } = require('child_process');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/import-profile', upload.single('file'), async (req, res) => {
    try {
        const inputPath = req.file.path;
        const cleanedPath = await cleanCsvFile(inputPath);

        // ici tu peux importer avec \copy
        const copyCommand = `psql -U postgres -d anep_fc -c "\\copy profile(\\"CIN\\", \\"NOM PRENOM\\", \\"DATE NAISS\\", \\"DETACHE\\", \\"SEXE\\", \\"SIT_F_AG\\", \\"DAT_REC\\", \\"STATUT\\", \\"DAT_POS\\", \\"LIBELLE GRADE\\", \\"GRADE ASSIMILE\\", \\"LIBELLE FONCTION\\", \\"DAT_FCT\\", \\"LIBELLE LOC\\", \\"LIBELLE REGION\\", \\"ADRESSE\\") FROM '${path.resolve(cleanedPath)}' DELIMITER ';' CSV HEADER;"`;

        exec(copyCommand, (error, stdout, stderr) => {
            if (error) return res.status(500).json({ error: stderr });
            return res.json({ message: '✅ Fichier nettoyé et importé avec succès !' });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors du traitement du fichier' });
    }
});

module.exports = router;
