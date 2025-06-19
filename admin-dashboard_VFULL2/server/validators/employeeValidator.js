const Joi = require("joi");

const employeeSchema = Joi.object({
    nom_complet: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().allow(null),
    telephone1: Joi.string().max(20).allow(null),
    telephone2: Joi.string().max(20).allow(null),
    categorie: Joi.string().max(50).allow(null),
    specialite: Joi.string().max(100).allow(null),
    experience_employe: Joi.number().integer().min(0).allow(null),
    role: Joi.string().valid("user", "admin").default("user"),
    cin: Joi.string().max(50).allow(null),
    archived: Joi.boolean().default(false),
    emplois: Joi.array()
        .items(
            Joi.object({
                id_emploi: Joi.number().integer().positive().required(),
            }).unknown(true)
        )
        .required(),
    competences: Joi.array()
        .items(
            Joi.object({
                id_competencea: Joi.number().integer().positive().required(),
                niveaua: Joi.number().integer().min(1).max(4).required(),
            }).unknown(true)
        )
        .allow(null),
    profile: Joi.object({
        "NOM PRENOM": Joi.string().min(2).max(255).required(),
        ADRESSE: Joi.string().max(255).allow(null),
        DATE_NAISS: Joi.date().allow(null),
        DAT_REC: Joi.date().allow(null),
        CIN: Joi.string().pattern(/^[A-Z]{1,2}[0-9]{5,6}$/).allow(null),
        DETACHE: Joi.string().valid("O", "N").allow(null),
        SEXE: Joi.string().valid("F", "M").allow(null),
        SIT_F_AG: Joi.string().valid("M", "C", "D").allow(null),
        STATUT: Joi.string().valid("activite", "sortie de service").allow(null),
        DAT_POS: Joi.date().allow(null),
        LIBELLE_GRADE: Joi.string().max(200).allow(null),
        GRADE_ASSIMILE: Joi.string().max(200).allow(null),
        LIBELLE_FONCTION: Joi.string().max(200).allow(null),
        DAT_FCT: Joi.date().allow(null),
        LIBELLE_LOC: Joi.string().max(200).allow(null),
        LIBELLE_REGION: Joi.string().max(200).allow(null),
    }).required(),
}).unknown(true);

module.exports = { employeeSchema };