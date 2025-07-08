const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createCycleProgram,
    updateCycleProgram,
    archiveCycleProgram,
    unarchiveCycleProgram,
    getAllCyclePrograms,
    getCycleProgramById,
    registerUserToCycleProgram,
    downloadRegistrations,
} = require('../controllers/cycleProgramController');

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

router.post('/', upload, createCycleProgram);
router.put('/:id', upload, updateCycleProgram);
router.put('/:id/archive', archiveCycleProgram);
router.put('/:id/unarchive', unarchiveCycleProgram);
router.get('/', getAllCyclePrograms);
router.get('/:id', getCycleProgramById);
router.post('/:id/register', registerUserToCycleProgram);
router.get('/:id/registrations/download', downloadRegistrations);

module.exports = router;