const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const userController = require('../controllers/userController');
const { authenticateUser } = require('../utils/auth');

// POST request to add a new vacation
router.post('/vacations', authenticateUser, async (req, res) => {
    const { vacations } = req.body;
    const userId = req.user.id; // Assuming you have middleware to get user ID

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Add multiple vacations
        vacations.forEach(vacation => {
            user.vacations.push({
                start: vacation.start,
                end: vacation.end
            });
        });
        await user.save();

        res.json(user.vacations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// DELETE request to remove a vacation
router.delete('/vacations/:vacation_id', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Remove the vacation by filtering out the vacation with the given ID
        user.vacations = user.vacations.filter(vacation => vacation._id.toString() !== req.params.vacation_id);
        await user.save();

        res.json(user.vacations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.get('/:user_id/vacations', authenticateUser, async (req, res) => {
    const userId = req.params.user_id;

    try {
        const user = await User.findById(userId).select('vacations');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user.vacations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Import users from Excel route
router.post('/import', authenticateUser, userController.importUsersFromExcel);

// Apply specific routes
const specificRoutes = [
    { method: 'get', path: '/notifications', middleware: [authenticateUser], handler: userController.getNotifications },
    { method: 'get', path: '/admin/notifications', middleware: [authenticateUser], handler: userController.getAdminNotifications },
    { method: 'post', path: '/mark-notification-read', handler: userController.markNotificationRead },
];

specificRoutes.forEach(({ method, path, middleware = [], handler }) => {
    router[method](path, ...middleware, handler);
});

// Apply generic routes
const genericRoutes = [
    { method: 'get', path: '/', middleware: [authenticateUser], handler: userController.getAllUsers },
    { method: 'get', path: '/:id', middleware: [authenticateUser], handler: userController.getUser },
    { method: 'post', path: '/', handler: userController.createUser },
    { method: 'put', path: '/:id', handler: userController.updateUser },
    { method: 'delete', path: '/:id', handler: userController.deleteUser },
];

genericRoutes.forEach(({ method, path, middleware = [], handler }) => {
    router[method](path, ...middleware, handler);
});

module.exports = router;
