// Load environment variables first with relative path
require('dotenv').config({ path: __dirname + '/.env' });

const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const Course = require('../models/Course'); // Verify this path
const { CycleProgram, CycleProgramRegistration, CycleProgramUserModule, CycleProgramModule } = require('../models');
const { syncAssignedUsersToCycleProgram } = require('../controllers/courseController');

// Import the preconfigured Sequelize instance
const sequelize = require('../sequelize-config');

// Debug: Log the DATABASE_URL and Course to verify it’s loaded
console.log('Loaded DATABASE_URL in migrateAssignedUsers.js:', process.env.DATABASE_URL);
console.log('Loaded Course model:', Course);

(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/anep_fc1', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Use the imported Sequelize instance
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');

        // Sync models with the database (optional, only if needed)
        await CycleProgram.sync();
        await CycleProgramRegistration.sync();
        await CycleProgramUserModule.sync();
        await CycleProgramModule.sync();

        // Migration function
        const migrateAssignedUsers = async () => {
            const courses = await Course.find(); // Line 37
            console.log(`Found ${courses.length} courses to migrate`);

            for (const course of courses) {
                if (course.cycleProgramTitle) {
                    console.log(`Processing course ${course._id} with cycleProgramTitle: ${course.cycleProgramTitle}`);
                    const cycleProgram = await CycleProgram.findOne({ where: { title: course.cycleProgramTitle } });
                    if (cycleProgram) {
                        console.log(`Found cycle program ${cycleProgram.id} for course ${course._id}`);
                        await syncAssignedUsersToCycleProgram(course._id.toString(), course.assignedUsers, cycleProgram.id);
                        console.log(`Migrated assignedUsers for course ${course._id}`);
                    } else {
                        console.log(`No cycle program found for title ${course.cycleProgramTitle}`);
                    }
                }
            }
            console.log('Migration completed');
        };

        // Execute migration
        await migrateAssignedUsers();

        // Cleanup
        await mongoose.connection.close();
        await sequelize.close();
        console.log('Database connections closed');
    } catch (error) {
        console.error('Migration failed:', error);
        await mongoose.connection.close();
        await sequelize.close();
    }
})();