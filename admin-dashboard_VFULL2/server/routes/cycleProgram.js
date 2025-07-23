const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require("jsonwebtoken");
const {
    createCycleProgram,
    updateCycleProgram,
    archiveCycleProgram,
    unarchiveCycleProgram,
    getAllCyclePrograms,
    getCycleProgramById,
    registerUserToCycleProgram,
    downloadRegistrations,
    deleteCycleProgram,
    getUserEnrolledModules,
    getRegistrationsByProgramId,
    getPendingRegistrations,
    updateRegistrationStatus,
    getModuleEvaluations,
    getModulePresence,
    updateModulePresence
} = require('../controllers/cycleProgramController');
const { CycleProgram, CycleProgramRegistration, CycleProgramUserModule } = require('../models');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token requis' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return res.status(401).json({ message: 'Token invalide ou expiré', details: error.message });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../Uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).fields([
    { name: 'training_sheet', maxCount: 1 },
    { name: 'support', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
    { name: 'evaluation', maxCount: 1 },
    { name: 'attendance_list', maxCount: 1 },
]);

if (!CycleProgram || !CycleProgramRegistration || !CycleProgramUserModule) {
    console.error('One or more models are undefined:', {
        CycleProgram: !!CycleProgram,
        CycleProgramRegistration: !!CycleProgramRegistration,
        CycleProgramUserModule: !!CycleProgramUserModule,
    });
    throw new Error('Required Sequelize models are not loaded');
}
router.get('/module/:module_id/presence', getModulePresence);
router.post('/module/:module_id/presence', updateModulePresence);
router.get('/module/:module_id/evaluations', getModuleEvaluations);

router.post('/', upload, createCycleProgram);

router.get('/registrations', authenticateToken, async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ message: 'user_id est requis' });
    }
    if (!req.user || user_id !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    try {
        const parsedUserId = parseInt(user_id, 10);
        if (isNaN(parsedUserId)) {
            return res.status(400).json({ message: 'user_id doit être un nombre valide' });
        }

        const registrations = await CycleProgramRegistration.findAll({
            where: { user_id: parsedUserId },
            include: [
                {
                    model: CycleProgram,
                    as: 'CycleProgram',
                    attributes: ['id', 'title', 'type'],
                },
                {
                    model: CycleProgramUserModule,
                    as: 'CycleProgramUserModules',
                    attributes: ['module_id'],
                },
            ],
        });

        res.status(200).json(registrations);
    } catch (error) {
        console.error('Erreur lors de la récupération des inscriptions:', error);
        res.status(500).json({ message: 'Erreur serveur', details: error.message });
    }
});

router.get('/pending-registrations', authenticateToken, getPendingRegistrations);
router.put('/registrations/:id/status', authenticateToken, updateRegistrationStatus);
router.get('/:id/registrations', authenticateToken, getRegistrationsByProgramId);
router.get('/user/:user_id/modules', getUserEnrolledModules);
router.get('/:id/registrations/download', downloadRegistrations);
router.post('/:id/register', authenticateToken, registerUserToCycleProgram);

router.put('/:id', upload, updateCycleProgram);
router.put('/:id/archive', archiveCycleProgram);
router.put('/:id/unarchive', unarchiveCycleProgram);
router.delete('/:id', deleteCycleProgram);
router.get('/', getAllCyclePrograms);
router.get('/:id', getCycleProgramById);

module.exports = router;