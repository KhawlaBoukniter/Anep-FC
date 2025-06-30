const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const multer = require('multer');
const path = require('path');
const { authenticateUser } = require('../utils/auth');
const Course = require('../models/Course');
// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Route groups
const commentRoutes = [
    { method: 'get', path: '/:id/comments', handler: courseController.getAllComments },
    { method: 'post', path: '/:id/comments', handler: courseController.handleComments },
    { method: 'get', path: '/latest-comments', handler: courseController.getLastestComments },
    { method: 'delete', path: '/:id/comments/:commentId', handler: courseController.deleteComment },
];

const courseRoutes = [
    { method: 'get', path: '/', handler: courseController.getAllCourses },
    { method: 'get', path: '/latest-courses', handler: courseController.getLastestComments },
    { method: 'post', path: '/', handler: courseController.createCourse },
    { method: 'get', path: '/:id', middleware: [authenticateUser], handler: courseController.getCourseById },
    { method: 'put', path: '/:id', handler: courseController.updateCourse },
    { method: 'delete', path: '/:id', handler: courseController.deleteCourse },
    { method: 'get', path: '/user/:userId', handler: courseController.getCoursesByUserId },
];

const fileRoutes = [
    { method: 'post', path: '/uploadImage', middleware: [upload.single('image')], handler: courseController.uploadImage },
    { method: 'get', path: '/:id/resources', handler: courseController.fetchFiles },
    { method: 'post', path: '/:id/resources', middleware: [upload.single('file')], handler: courseController.filesUpload },
];

const userRoutes = [
    { method: 'get', path: '/:courseId/assignedUsers/download', handler: courseController.userAssignedDownload },
    { method: 'get', path: '/:id/assignedUsers', handler: courseController.getAssignedUsers },
    { method: 'post', path: '/:id/updatePresence', handler: courseController.updateCoursePresence },
    { method: 'post', path: '/:id/request-join', handler: courseController.requestJoin },
    { method: 'post', path: '/:id/assign-interseted-user', handler: courseController.assignInterestedUser },
];

const notificationRoutes = [
    { method: 'post', path: '/:id/notify', handler: courseController.sendCourseNotification },
];
// Route to fetch statistics
router.get('/statistics', async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const onlineCourses = await Course.countDocuments({ type: 'online' });
        const offlineCourses = await Course.countDocuments({ type: 'offline' });
        const hybridCourses = await Course.countDocuments({ type: 'hybrid' });

        // Example response structure
        const statistics = {
            totalCourses,
            online: onlineCourses,
            offline: offlineCourses,
            hybrid: hybridCourses
        };

        res.json(statistics);
    } catch (err) {
        console.error('Failed to fetch statistics:', err);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
});

// Apply routes
const applyRoutes = (routes) => {
    routes.forEach(({ method, path, middleware = [], handler }) => {
        router[method](path, ...middleware, handler);
    });
};

[commentRoutes, courseRoutes, fileRoutes, userRoutes, notificationRoutes].forEach(applyRoutes);

module.exports = router;