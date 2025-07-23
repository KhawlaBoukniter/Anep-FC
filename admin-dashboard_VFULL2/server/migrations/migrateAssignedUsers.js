// Load environment variables first with relative path
require('dotenv').config({ path: __dirname + '/.env' });

const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const Course = require('../models/Course'); // Verify this path
const { CycleProgram, CycleProgramRegistration, CycleProgramUserModule, CycleProgramModule } = require('../models');
const { syncAssignedUsersToCycleProgram } = require('../controllers/courseController');

// Import the preconfigured Sequelize instance
const sequelize = require('../sequelize-config');

(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/anep_fc1', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Use the imported Sequelize instance
        await sequelize.authenticate();

        // Sync models with the database (optional, only if needed)
        await CycleProgram.sync();
        await CycleProgramRegistration.sync();
        await CycleProgramUserModule.sync();
        await CycleProgramModule.sync();

        // Migration function
        const migrateAssignedUsers = async () => {
            const courses = await Course.find(); // Line 37

            for (const course of courses) {
                if (course.cycleProgramTitle) {
                    const cycleProgram = await CycleProgram.findOne({ where: { title: course.cycleProgramTitle } });
                    if (cycleProgram) {
                        await syncAssignedUsersToCycleProgram(course._id.toString(), course.assignedUsers, cycleProgram.id);
                    }
                }
            }
        };

        // Execute migration
        await migrateAssignedUsers();

        // Cleanup
        await mongoose.connection.close();
        await sequelize.close();
    } catch (error) {
        console.error('Migration failed:', error);
        await mongoose.connection.close();
        await sequelize.close();
    }
})();