// courseController.js
const { CycleProgram, CycleProgramModule, CycleProgramRegistration, CycleProgramUserModule } = require('../models/index');
const Course = require('../models/Course');
const User = require('../models/User');
const XLSX = require('xlsx');
const path = require('path')
const fs = require('fs').promises
const mongoose = require('mongoose');
const { pool } = require('../config/database');

const calculateModuleDuration = (times) => {
    // Set to store unique dates (ignoring time)
    const uniqueDates = new Set();

    for (const session of times) {
        for (const dateRange of session.dateRanges) {
            const start = new Date(dateRange.startTime);
            const end = new Date(dateRange.endTime);

            // Get the start date (ignoring time)
            const startDate = new Date(start.toDateString());
            uniqueDates.add(startDate.toISOString().split('T')[0]);

            // Iterate over each day in the range
            const currentDate = new Date(start);
            while (currentDate <= end) {
                uniqueDates.add(new Date(currentDate.toDateString()).toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    // Return the number of unique days
    return uniqueDates.size;
};

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const { hidden, archived } = req.query;
        const query = {};

        if (hidden) {
            query.hidden = hidden;
        }
        if (archived !== undefined) {
            query.archived = archived === 'true';
        }

        const courses = await Course.find(query);

        const cycleProgramModules = await CycleProgramModule.findAll({
            include: [
                {
                    model: CycleProgram,
                    as: 'CycleProgram',
                    attributes: ['id', 'title'],
                }
            ]
        })

        const coursesWithCycleProgram = courses.map((course) => {
            const moduleAssociation = cycleProgramModules.find(
                (cpm) => cpm.module_id === course._id.toString()
            );
            const cycleProgramTitle = moduleAssociation
                ? moduleAssociation.CycleProgram.title
                : null;
            return {
                ...course.toObject(),
                cycleProgramTitle,
            };
        });

        res.status(200).json(coursesWithCycleProgram);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single course by ID
// const getCourseNameById = async (req, res) => {
//     const { courseId } = req.params;

//     try {
//         const course = await Course.findById(courseId);
//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }

//         res.status(200).json(course);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

// Get a single course by ID
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            // .populate('interestedUsers', '_id name profileId')
            .populate('assignedUsers', '_id name profileId')
            .exec();

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const assignedUsers = await User.find({ profileId: { $in: course.assignedUsers } }).select('_id name profileId');
        // const interestedUsers = await User.find({ profileId: { $in: course.interestedUsers } }).select('_id name profileId');

        const courseWithUsers = {
            ...course.toObject(),
            assignedUsers: course.assignedUsers.map((profileId) => {
                const user = assignedUsers.find((u) => u.profileId === profileId);
                return {
                    profileId,
                    name: user ? user.name : `Unknown User (${profileId})`,
                    userId: user ? user._id.toString() : null,
                };
            }),
            // interestedUsers: course.interestedUsers.map((profileId) => {
            //     const user = interestedUsers.find((u) => u.profileId === profileId);
            //     return {
            //         profileId,
            //         name: user ? user.name : `Unknown User (${profileId})`,
            //         userId: user ? user._id.toString() : null,
            //     };
            // }),
            duration: calculateModuleDuration(course.times),
        };

        // course.assignedUsers.forEach((user) => {
        //     if (!user.name || !user.profileId) {
        //         console.warn(`Incomplete user data for _id: ${user._id}, name: ${user.name}, profileId: ${user.profileId}`);
        //     }
        // });

        // const duration = calculateModuleDuration(course.times);
        res.status(200).json(courseWithUsers);
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
    }
};

// Create a new course
const createCourse = async (req, res) => {
    console.log('Received data for new course:', req.body);
    try {
        const { times, support, cycleProgramTitle, ...courseData } = req.body;

        if (support) {
            if (!['file', 'link'].includes(support.type)) {
                return res.status(400).json({ message: 'Invalid support type. Must be "file" or "link".' });
            }
            if (!support.value) {
                return res.status(400).json({ message: 'Support value is required.' });
            }
            if (support.type === 'link' && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(support.value)) {
                return res.status(400).json({ message: 'Invalid link format.' });
            }
        }

        for (const session of times) {
            for (const dateRange of session.dateRanges) {
                const start = new Date(dateRange.startTime);
                const end = new Date(dateRange.endTime);
                if (isNaN(start) || isNaN(end)) {
                    return res.status(400).json({ message: 'Invalid date format in dateRanges' });
                }
                if (start >= end) {
                    return res.status(400).json({ message: 'startTime must be before endTime in dateRanges' });
                }
            }
        }

        const course = new Course(courseData);
        await course.save();

        // Sync assignedUsers with CycleProgram if associated
        if (cycleProgramTitle) {
            const cycleProgram = await CycleProgram.findOne({ where: { title: cycleProgramTitle } });
            if (cycleProgram) {
                await syncAssignedUsersToCycleProgram(course._id.toString(), course.assignedUsers, cycleProgram.id);
            }
        }

        res.status(201).json(course);
    } catch (error) {
        console.error('Error saving course:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update an existing course
const updateCourse = async (req, res) => {
    const { assignedUsers, times, photos = [], link, support, cycleProgramTitle, ...updateData } = req.body;
    try {
        const courseToUpdate = await Course.findById(req.params.id);
        if (!courseToUpdate) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (times) {
            for (const session of times) {
                for (const dateRange of session.dateRanges) {
                    const start = new Date(dateRange.startTime);
                    const end = new Date(dateRange.endTime);
                    if (isNaN(start) || isNaN(end)) {
                        return res.status(400).json({ message: 'Invalid date format in dateRanges' });
                    }
                    if (start >= end) {
                        return res.status(400).json({ message: 'startTime must be before endTime in dateRanges' });
                    }
                }

                session.dateRanges = session.dateRanges.map(range => ({
                    startTime: range.startTime,
                    endTime: range.endTime,
                    _id: range._id || undefined
                }));
            }

            updateData.times = times;
        }

        if (support) {
            if (!['file', 'link'].includes(support.type)) {
                return res.status(400).json({ message: 'Invalid support type. Must be "file" or "link".' });
            }
            if (!support.value) {
                return res.status(400).json({ message: 'Support value is required.' });
            }
            if (support.type === 'link' && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(support.value)) {
                return res.status(400).json({ message: 'Invalid link format.' });
            }
            updateData.support = support;
        }

        // Handle assigned users
        if (assignedUsers) {
            const newlyAssignedUsers = assignedUsers.filter(
                (profileId) => !courseToUpdate.assignedUsers.includes(Number(profileId))
            );

            for (const profileId of newlyAssignedUsers) {
                const userCourses = await Course.find({ assignedUsers: Number(profileId) });
                for (const course of userCourses) {
                    if (course._id.toString() !== courseToUpdate._id.toString() && hasTimeConflict(courseToUpdate, course)) {
                        await Course.findByIdAndUpdate(course._id, {
                            $pull: { assignedUsers: Number(profileId) },
                        });
                    }
                }
            }

            updateData.assignedUsers = assignedUsers.map(Number);
        }

        updateData.photos = photos;
        if (link) {
            updateData.link = link;
        }

        console.log('Update data:', JSON.stringify(updateData, null, 2));

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

        // Sync assignedUsers with CycleProgram if associated
        if (cycleProgramTitle) {
            const cycleProgram = await CycleProgram.findOne({ where: { title: cycleProgramTitle } });
            if (cycleProgram) {
                await syncAssignedUsersToCycleProgram(updatedCourse._id.toString(), updatedCourse.assignedUsers, cycleProgram.id);
            }
        }

        console.log('Updated course:', JSON.stringify(updatedCourse, null, 2));

        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a course
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const hasTimeConflict = (course1, course2) => {
    for (let session1 of course1.times) {
        for (let session2 of course2.times) {
            for (let range1 of session1.dateRanges) {
                for (let range2 of session2.dateRanges) {
                    const start1 = new Date(range1.startTime);
                    const end1 = new Date(range1.endTime);
                    const start2 = new Date(range2.startTime);
                    const end2 = new Date(range2.endTime);

                    if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

// Controller method for uploading an image
const uploadImage = (req, res) => {
    try {
        console.log('Received files:', req.files); // Debug: Log received files

        const fileUrls = {
            photoUrls: [],
            cvUrls: [],
            supportUrl: null
        };

        // Handle case where no files are uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(200).json(fileUrls);
        }

        // Handle photos
        if (req.files.photos) {
            req.files.photos.forEach((photoFile) => {
                const photoUrl = `/uploads/${photoFile.filename}`;
                fileUrls.photoUrls.push(photoUrl);
            });
        }

        // Handle CVs
        if (req.files.cvs) {
            req.files.cvs.forEach((cvFile) => {
                const cvUrl = `/Uploads/${cvFile.filename}`;
                fileUrls.cvUrls.push(cvUrl);
            });
        }

        // Handle support file
        if (req.files.support) {
            const supportFile = req.files.support[0];
            const supportUrl = `/Uploads/${supportFile.filename}`;
            fileUrls.supportUrl = supportUrl;
        }

        res.status(200).json(fileUrls);
    } catch (error) {
        console.error('Error in uploadImage:', error);
        res.status(500).json({ error: 'Erreur interne', message: error.message });
    }
};

const getAllComments = async (req, res) => {
    try {
        const courses = await Course.find().select('comments');
        const comments = courses.reduce((acc, course) => acc.concat(course.comments), []);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error); // Log the error to the console
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
}

const getAssignedUsers = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findById(id).populate('assignedUsers');
        if (!course) {
            return res.status(404).send('Course not found');
        }
        const users = await User.find({ profileId: { $in: course.assignedUsers } }).select('_id name profileId');
        const duration = calculateModuleDuration(course.times);
        const usersWithPresence = course.assignedUsers.map((profileId) => {
            const user = users.find((u) => u.profileId === profileId);
            const presence = course.presence.find((p) => p.profileId === profileId) || {};
            return {
                profileId,
                name: user ? user.name : `Unknown User (${profileId})`,
                userId: user ? user._id.toString() : null,
                dailyStatuses: presence.dailyStatuses || Array.from({ length: duration }, (_, i) => ({ day: i + 1, status: 'absent' })),
                daysPresent: presence.daysPresent || 0,
            };
        });
        res.status(200).json({ users: usersWithPresence, duration });
    } catch (error) {
        console.error('Error fetching assigned users:', error);
        res.status(500).send('Failed to fetch assigned users: ' + error.message);
    }
};

const getCoursesByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const courses = await Course.find({
            assignedUsers: userId
        }).populate('assignedUsers');

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCoursePresence = async (req, res) => {
    const { id } = req.params;
    const { presence } = req.body;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).send('Course not found');
        }

        const duration = calculateModuleDuration(course.times);

        presence.forEach(p => {
            const existingPresence = course.presence.find(ep => ep.userId.toString() === p.userId);
            if (existingPresence) {
                existingPresence.dailyStatuses = p.dailyStatuses.map(ds => ({
                    day: ds.day,
                    status: ds.status
                }));
                existingPresence.daysPresent = existingPresence.dailyStatuses.filter(ds => ds.status === 'present').length;
            } else {
                course.presence.push({
                    userId: p.userId,
                    dailyStatuses: p.dailyStatuses.map(ds => ({
                        day: ds.day,
                        status: ds.status
                    })),
                    daysPresent: p.dailyStatuses.filter(ds => ds.status === 'present').length
                });
            }

            if (p.dailyStatuses.some(ds => ds.day < 1 || ds.day > duration)) {
                throw new Error(`Invalid day number. Must be between 1 and ${duration}`);
            }
            if (p.dailyStatuses.some(ds => !['present', 'absent'].includes(ds.status))) {
                throw new Error('Invalid status. Must be "present" or "absent"');
            }
        });

        await course.save();

        res.status(200).send('Presence updated successfully');
    } catch (error) {
        console.error('Failed to update course presence:', error);
        res.status(500).send('Internal Server Error');
    }
};

const getLastestComments = async (req, res) => {
    try {
        const courses = await Course.find()
            .sort({ 'comments.createdAt': -1 })
            .limit(6)
            .select('comments');

        let comments = [];
        courses.forEach(course => {
            comments = comments.concat(course.comments);
        });

        comments.sort((a, b) => b.createdAt - a.createdAt);
        comments = comments.slice(0, 6);

        res.json(comments);
    } catch (error) {
        res.status(500).send(error);
    }
};

const handleComments = async (req, res) => {
    const { id } = req.params;
    const { userName, text } = req.body; // Assuming you're sending userName and text from the frontend

    if (!text.trim()) {
        return res.status(400).json({ message: "Comment text must not be empty" });
    }

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const newComment = {
            userName,
            text,
            createdAt: new Date() // This is optional since default is already set in schema
        };

        course.comments.push(newComment);
        await course.save();

        res.status(201).json(course.comments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const filesUpload = async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).send('Course not found.');
        }

        const newResource = {
            type: file.mimetype.includes('image') ? 'image' : 'file', // Simplified type check
            title: file.originalname,
            link: file.path
        };

        course.resources.push(newResource);
        await course.save();

        res.status(201).json(course.resources);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
const fetchFiles = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).send('Course not found.');
        }

        res.status(200).json(course.resources);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// const assignInterestedUser = async (req, res) => {
//     const { userId } = req.body;
//     const id = req.params.id;

//     try {
//         // First, pull the user from interestedUsers
//         const course = await Course.findByIdAndUpdate(id, {
//             $pull: { interestedUsers: userId }
//         }, { new: true });

//         if (!course) {
//             return res.status(404).send('Course not found');
//         }

//         // Then, add the user to assignedUsers
//         const updatedCourse = await Course.findByIdAndUpdate(id, {
//             $addToSet: { assignedUsers: userId }
//         }, { new: true }).populate('assignedUsers').populate('interestedUsers');

//         res.status(200).json(updated, updatedCourse);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// }
// const requestJoin = async (req, res) => {
//     const { userId } = req.body; // Assume userId is passed in the request body
//     const id = req.params.id;

//     try {
//         const updatedCourse = await Course.findByIdAndUpdate(
//             id,
//             { $addToSet: { interestedUsers: userId } }, // Use $addToSet to avoid duplicates
//             { new: true }
//         ).populate('interestedUsers'); // Optionally populate to return detailed info

//         if (!updatedCourse) {
//             return res.status(404).send('Course not found');
//         }

//         res.status(200).json(updatedCourse);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// }

const sendCourseNotification = async (req, res) => {
    const courseName = req.body.courseName;
    try {
        const course = await Course.findById(req.params.id).populate('assignedUsers');
        if (!course) {
            return res.status(404).send('Course not found');
        }
        course.assignedUsers.forEach(async (user) => {
            io.to(user._id.toString()).emit('notification', {
                message: `You have been assigned to the course ${courseName}`,
                courseId: course._id
            });
            try {
                await User.findByIdAndUpdate(user._id, {
                    $push: { notifications: { message: `You have been assigned to the course ${courseName}`, date: new Date(), courseId: course._id } }
                });
            } catch (err) {
                console.error("Failed to save notification for user:", user._id, err);
            }
        });
        res.send('Notification sent and stored');
    } catch (error) {
        console.error("Failed to send notification:", error);
        res.status(500).send('Error sending notification');
    }
};

const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).send('Course not found');
        }

        const comment = course.comments.id(commentId);
        if (!comment) {
            return res.status(404).send('Comment not found');
        }

        course.comments.pull(commentId);
        await course.save();

        res.status(200).json(course.comments); // Return the updated list of comments
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const userAssignedDownload = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId).select('assignedUsers times presence');

        if (!course) {
            return res.status(404).send('Course not found');
        }

        // If no assigned users, return an empty Excel file with headers
        if (!course.assignedUsers || course.assignedUsers.length === 0) {
            const worksheet = XLSX.utils.json_to_sheet([]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Assigned Users');
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Disposition', 'attachment; filename=assigned_users.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            return res.send(buffer);
        }

        // Fetch user data from PostgreSQL profile and employe tables
        const query = `
      SELECT 
        p.id_profile,
        p."NOM PRENOM",
        p."CIN",
        p."LIBELLE LOC",
        p."LIBELLE REGION"
      FROM profile p
      WHERE p.id_profile = ANY($1)
    `;
        const result = await pool.query(query, [course.assignedUsers]);

        // Calculate duration using the updated function
        const duration = calculateModuleDuration(course.times || []);
        const usersData = result.rows.map(row => {
            const presence = course.presence.find(p => p.userId === row.id_profile) || {};
            const dailyStatuses = presence.dailyStatuses || Array.from({ length: duration }, (_, i) => ({ day: i + 1, status: 'absent' }));
            const statusColumns = {};
            dailyStatuses.forEach(ds => {
                statusColumns[`Day_${ds.day}`] = ds.status;
            });
            return {
                "NOM PRENOM": row["NOM PRENOM"] || '',
                CIN: row["CIN"] || '',
                LIBELLE_LOC: row["LIBELLE LOC"] || '',
                LIBELLE_REGION: row["LIBELLE REGION"] || '',
                created_at: new Date().toISOString(), // Default to current date if not available
                DaysPresent: presence.daysPresent || 0,
                ...statusColumns,
            };
        });

        // Create Excel file
        const worksheet = XLSX.utils.json_to_sheet(usersData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Assigned Users');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=assigned_users_${courseId}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Error downloading assigned users:', error);
        res.status(500).send('Failed to download assigned users: ' + error.message);
    }
};

// Create a new evaluation
const createEvaluation = async (req, res) => {
    const { courseId } = req.params;
    const { userId, evaluationData, comments, aspectsToImprove } = req.body;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const newEvaluation = {
            userId,
            evaluationData,
            comments,
            aspectsToImprove,
            createdAt: new Date()
        };

        course.evaluations.push(newEvaluation);
        await course.save();

        res.status(201).json(course.evaluations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Download evaluations as an Excel file
const downloadEvaluations = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId).populate('evaluations.userId');
        if (!course) {
            return res.status(404).send('Course not found');
        }

        // Convert evaluations to a format suitable for Excel
        const evaluations = course.evaluations.map(evaluation => {
            const evaluationData = evaluation.evaluationData.reduce((acc, item) => {
                acc[item.name] = item.value;
                return acc;
            }, {});

            return {
                userId: evaluation.userId._id.toString(),
                userName: evaluation.userId.name,
                ...evaluationData,
                aspectsToImprove: evaluation.aspectsToImprove,
                createdAt: evaluation.createdAt.toISOString()
            };
        });

        // Create a new workbook and add the evaluations data
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(evaluations);
        XLSX.utils.book_append_sheet(wb, ws, 'Evaluations');

        // Write the workbook to a buffer
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

        // Set headers and send the buffer as a downloadable file
        res.setHeader('Content-Disposition', 'attachment; filename=evaluations.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(buffer);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
};

const archiveCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { archived: true },
            { new: true }
        );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course archived successfully', course });
    } catch (error) {
        console.error('Error archiving course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const unarchiveCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { archived: false },
            { new: true }
        );
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course unarchived successfully', course });
    } catch (error) {
        console.error('Error unarchiving course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const syncAssignedUsersToCycleProgram = async (courseId, assignedUsers, cycleProgramId) => {
    try {
        // Find or create registration for each user
        const registrations = await CycleProgramRegistration.findAll({
            where: { cycle_program_id: cycleProgramId, user_id: assignedUsers },
        });

        const existingUserIds = registrations.map((r) => r.user_id);
        const newUsers = assignedUsers.filter((id) => !existingUserIds.includes(id));

        // Create new registrations for new users
        const newRegistrations = await Promise.all(
            newUsers.map((userId) =>
                CycleProgramRegistration.create({
                    cycle_program_id: cycleProgramId,
                    user_id: userId,
                    status: 'pending',
                })
            )
        );

        // Combine existing and new registrations
        const allRegistrations = [...registrations, ...newRegistrations];
        const registrationIds = allRegistrations.map((r) => r.id);

        // Find associated modules for the course
        const cycleProgramModule = await CycleProgramModule.findOne({
            where: { module_id: courseId },
        });
        if (!cycleProgramModule) {
            throw new Error('No associated CycleProgramModule found');
        }

        // Update or create CycleProgramUserModule entries
        await CycleProgramUserModule.destroy({
            where: { registration_id: registrationIds, module_id: courseId },
        });
        const userModuleEntries = allRegistrations.flatMap((reg) => ({
            registration_id: reg.id,
            module_id: courseId,
            status: 'pending',
        }));
        await CycleProgramUserModule.bulkCreate(userModuleEntries, { ignoreDuplicates: true });
    } catch (error) {
        console.error('Error syncing assigned users to CycleProgram:', error);
        throw error;
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    uploadImage,
    getAssignedUsers,
    getCoursesByUserId,
    updateCoursePresence,
    getLastestComments,
    handleComments,
    filesUpload,
    fetchFiles,
    // assignInterestedUser,
    // requestJoin,
    sendCourseNotification,
    deleteComment,
    createEvaluation,
    downloadEvaluations,
    getAllComments,
    userAssignedDownload,
    archiveCourse,
    unarchiveCourse,
    syncAssignedUsersToCycleProgram
    // getCourseNameById,
};