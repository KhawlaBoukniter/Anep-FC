const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

const migrateCourses = async () => {
    try {
        // Suppress deprecated warnings and isNew warning
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds timeout
        });

        const courses = await Course.find();
        for (const course of courses) {
            // Map assignedUsers
            const assignedProfileIds = [];
            // Ensure assignedUsers is an array
            const assignedUsers = Array.isArray(course.assignedUsers) ? course.assignedUsers : [];
            for (const userId of assignedUsers) {
                const user = await User.findById(userId).select('profileId');
                if (user && user.profileId) {
                    assignedProfileIds.push(user.profileId);
                } else {
                    console.warn(`User ${userId} not found or missing profileId for course ${course._id}`);
                }
            }

            // Map interestedUsers
            const interestedProfileIds = [];
            // Ensure interestedUsers is an array
            const interestedUsers = Array.isArray(course.interestedUsers) ? course.interestedUsers : [];
            for (const userId of interestedUsers) {
                const user = await User.findById(userId).select('profileId');
                if (user && user.profileId) {
                    interestedProfileIds.push(user.profileId);
                } else {
                    console.warn(`User ${userId} not found or missing profileId for course ${course._id}`);
                }
            }

            // Map presence.userId to presence.profileId
            const updatedPresence = [];
            // Ensure presence is an array
            const presenceArray = Array.isArray(course.presence) ? course.presence : [];
            for (const presence of presenceArray) {
                const user = await User.findById(presence.userId).select('profileId');
                if (user && user.profileId) {
                    updatedPresence.push({
                        ...presence.toObject(),
                        profileId: user.profileId,
                        userId: undefined, // Remove userId
                    });
                } else {
                    console.warn(`User ${presence.userId} not found or missing profileId for course ${course._id}`);
                }
            }

            // Update course
            await Course.updateOne(
                { _id: course._id },
                {
                    $set: {
                        assignedUsers: assignedProfileIds,
                        interestedUsers: interestedProfileIds,
                        presence: updatedPresence,
                    },
                }
            );
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Migration failed:', error);
        mongoose.disconnect();
    }
};

migrateCourses();
