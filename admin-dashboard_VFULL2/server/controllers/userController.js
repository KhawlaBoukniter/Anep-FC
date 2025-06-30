const mongoose = require('mongoose');
const User = require('../models/User');
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        console.log("Fetched users:", users);
        res.send(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send(error.message);
    }
};

// Get a single user by ID
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Create a new user
const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Update a user
const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from the authenticated user

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).select('notifications');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const notifications = user.notifications.map(notification => ({
            ...notification.toObject(),
            isNew: notification.isNew
        }));

        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAdminNotifications = async (req, res) => {
    const adminId = req.user._id; // Assuming the admin ID is also from the authenticated user

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).send('Invalid user ID');
    }

    try {
        const user = await User.findById(adminId, 'notifications');
        if (!user) {
            return res.status(404).send('User not found');
        }

        const notifications = user.notifications.map(notification => ({
            ...notification.toObject(),
            isNew: notification.isNew // Ensure isNew is correctly sent to the frontend
        }));

        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Server error');
    }
};
const markNotificationRead = async (req, res) => {
    const { userId, notificationId } = req.body;

    try {
        // Directly update the notification's isNew field in the database
        const result = await User.updateOne(
            { "_id": userId, "notifications._id": notificationId },
            { "$set": { "notifications.$.isNew": false } }
        );

        if (result.nModified === 0) {
            return res.status(404).json({ message: 'Notification not found or already updated' });
        }

        // Optionally, fetch the updated user or notification for response
        const user = await User.findById(userId);
        const notification = user.notifications.id(notificationId);

        // Prepare the data to be returned
        const responseData = {
            message: 'Notification marked as read',
            notificationId: notification._id,
            commentSnippet: notification.commentSnippet,
            isNew: notification.isNew,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const importUsersFromExcel = async (req, res) => {
    try {
        const users = req.body; // Assume the request body contains the array of users

        // Log the incoming data for debugging
        console.log('Incoming users data:', users);

        const results = await Promise.all(users.map(async (user) => {
            // Check if the user already exists by email
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                console.log(`User with email ${user.email} already exists. Updating.`);
                // Update the user, excluding the password field
                const updateData = { ...user };
                delete updateData.password; // Ensure the password is not updated
                await User.updateOne({ email: user.email }, { $set: updateData });
                return null; // Return null to indicate an update operation
            }

            // Generate an ID if the user doesn't have one
            if (!user._id) {
                user._id = new mongoose.Types.ObjectId(); // Assuming you're using Mongoose for MongoDB
            }

            // Create the user in the database
            return User.create(user);
        }));

        res.status(201).json({
            message: 'Users processed successfully',
            imported: results.filter(result => result !== null).length,
            updated: results.filter(result => result === null).length, // Count updates as null returns
        });
    } catch (error) {
        // Log the error for debugging
        console.error('Error during users processing:', error);

        res.status(500).json({ message: 'Failed to process users', error: error.message });
    }
}
module.exports = {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getNotifications,
    getAdminNotifications,
    markNotificationRead,
    importUsersFromExcel
};