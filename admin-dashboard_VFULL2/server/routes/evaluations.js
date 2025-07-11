const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const Course = require("../models/Course");

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

router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).select("evaluations");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json(course.evaluations || []);
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
