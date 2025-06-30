const mongoose = require('mongoose');

const vacationSchema = new mongoose.Schema({
    start: { type: Date, required: true },
    end: { type: Date, required: true }
});

const notificationSchema = new mongoose.Schema({
    message: String,
    date: { type: Date, default: Date.now },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    commentSnippet: String,
    isNew: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        // Assuming password is hashed and managed separately
    },
    roles: {
        type: [String],
        enum: ['user', 'admin'],
        default: ['user']
    },
    tokenAccess: {
        type: String,
        default: null,
    },
    name: { type: String },
    PPR: { type: Number },
    CIN: { type: String },
    DATE_NAISSANCE: { type: Date },
    SITUATION: { type: String },
    SEXE: { type: String },
    SIT_F_AG: { type: String },
    DATE_RECRUTEMENT: { type: Date },
    ANC_ADM: { type: Date },
    COD_POS: { type: String },
    DAT_POS: { type: Date },
    GRADE_fonction: { type: String },
    GRADE_ASSIMILE: { type: String },
    DAT_EFF_GR: { type: Date },
    ANC_GRADE: { type: Date },
    ECHEL: { type: Number },
    ECHELON: { type: Number },
    INDICE: { type: Number },
    DAT_EFF_ECHLON: { type: Date },
    ANC_ECHLON: { type: Date },
    AFFECTATION: { type: String },
    DEPARTEMENT_DIVISION: { type: String },
    SERVICE: { type: String },
    Localite: { type: String },
    FONCTION: { type: String },
    LIBELLE_SST: { type: String },
    DAT_S_ST: { type: Date },
    notifications: [notificationSchema],
    resetToken: { type: String },
    vacations: [vacationSchema],
    phoneNumber: { type: String },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

module.exports = User;