const express = require('express');
const router = express.Router();
const UserNeedController = require('../controllers/UserNeedController');
const { authenticateUser } = require('../utils/auth');

// Route groups
const userNeedRoutes = [
    { method: 'post', path: '/', handler: UserNeedController.createUserNeed },
    { method: 'get', path: '/', middleware: [authenticateUser], handler: UserNeedController.getUserNeeds },
    { method: 'delete', path: '/:id', middleware: [authenticateUser], handler: UserNeedController.deleteUserNeeds }, // Changed 'get' to 'delete' for deletion
];

// Apply routes
const applyRoutes = (routes) => {
    routes.forEach(({ method, path, middleware = [], handler }) => {
        router[method](path, ...middleware, handler);
    });
};

applyRoutes(userNeedRoutes);

module.exports = router;
