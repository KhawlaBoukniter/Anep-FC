const { syncProfilesWithEmployees } = require('../models/syncService');

const syncProfiles = async (req, res) => {
    try {
        const result = await syncProfilesWithEmployees();
        res.status(200).json({ message: 'Synchronisation terminée.', ...result });
    } catch (error) {
        console.error('Erreur dans la synchronisation:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la synchronisation.' });
    }
};

module.exports = { syncProfiles };