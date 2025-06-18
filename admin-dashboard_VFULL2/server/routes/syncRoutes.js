const express = require('express');
const router = express.Router();
const { syncProfiles } = require('../controllers/syncController');

// POST /api/sync-profiles
router.post('/sync-profiles', syncProfiles);

module.exports = router;
