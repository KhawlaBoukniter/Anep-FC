// models/Course.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: false,
        enum: ['file', 'image', 'video', 'pdf']
    },
    title: { type: String, required: false },
    link: { type: String, required: false },
});

const evaluationSchema = new mongoose.Schema({
    userId: { type: Number },
    evaluationData: [{
        name: { type: String, required: false },
        value: { type: Number, required: false }
    }],
    aspectsToImprove: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: false },
    text: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});

const dateRangeSchema = new mongoose.Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
});

const timeSchema = new mongoose.Schema({
    dateRanges: [dateRangeSchema],
    instructorType: {
        type: String,
        required: false,
        enum: ['intern', 'extern']
    },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    instructorName: { type: String, required: false },
    externalInstructorDetails: {
        phone: { type: String },
        position: { type: String },
        cv: { type: String }
    }
});

const dailyPresenceSchema = new mongoose.Schema({
    day: { type: Number, required: true },
    status: { type: String, enum: ['present', 'absent'], default: 'absent' }
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: false },
    location: { type: String, required: false },
    // imageUrl: { type: String, required: false },
    photos: [{ type: String, required: false }],
    link: { type: String, required: false },
    support: {
        type: {
            type: String,
            enum: ['file', 'link'],
            required: false
        },
        value: { type: String, required: false }
    },
    offline: {
        type: String,
        required: false,
        enum: ['online', 'offline', 'hybrid']
    },
    description: { type: String },
    notifyUsers: { type: Boolean, default: false },
    hidden: {
        type: String,
        required: false,
        enum: ['visible', 'hidden']
    },
    times: [timeSchema],
    budget: { type: Number, required: false },
    assignedUsers: [{ type: Number }],
    resources: [resourceSchema],
    comments: [commentSchema],
    // interestedUsers: [{ type: Number }],
    presence: [{
        userId: { type: Number },
        dailyStatuses: [dailyPresenceSchema],
        daysPresent: {
            type: Number,
            default: 0,
            required: false
        }
    }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },  // Link to Category model
    evaluations: [evaluationSchema],
    archived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
    // updatedAt: { type: Date },
    // deletedAt: { type: Date },
}, { timestamps: false, suppressReservedKeysWarning: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
