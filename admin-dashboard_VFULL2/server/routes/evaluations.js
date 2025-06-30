const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Route groups
const evaluationRoutes = [
    { method: 'post', path: '/:courseId/', handler: courseController.createEvaluation },
    { method: 'get', path: '/:courseId/download', handler: courseController.downloadEvaluations },
];

// Apply routes
const applyRoutes = (routes) => {
    routes.forEach(({ method, path, middleware = [], handler }) => {
        router[method](path, ...middleware, handler);
    });
};

applyRoutes(evaluationRoutes);

module.exports = router;
