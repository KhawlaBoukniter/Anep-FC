require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

async function migrateCourses() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const courses = await Course.find();
        console.log(`Found ${courses.length} courses to migrate`);

        for (const course of courses) {
            const updatedTimes = course.times.map((time) => ({
                ...time._doc,
                dateRanges: time.startTime && time.endTime ? [{ startTime: time.startTime, endTime: time.endTime }] : [],
                startTime: undefined,
                endTime: undefined,
            }));
            await Course.updateOne({ _id: course._id }, { $set: { times: updatedTimes } });
            console.log(`Updated course: ${course.title}`);
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

migrateCourses();