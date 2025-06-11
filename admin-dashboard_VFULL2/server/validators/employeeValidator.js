const Joi = require("joi")

const employeeSchema = Joi.object({
    nom_complet: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    adresse: Joi.string().max(255).allow(""),
    telephone1: Joi.string().max(20).allow(""),
    telephone2: Joi.string().max(20).allow(""),
    categorie: Joi.string().max(50).allow(""),
    specialite: Joi.string().max(100).allow(""),
    experience_employe: Joi.number().integer().min(0).allow(null),
    role: Joi.string().valid("user", "admin").default("user"),
    date_naissance: Joi.date().allow(null),
    date_recrutement: Joi.date().required(),
    cin: Joi.string().max(50).required(),
    emplois: Joi.array().items(
        Joi.object({
            id_emploi: Joi.number().integer().positive().required(),
        }).unknown(true)
    ).required(),
    competences: Joi.array().items(
        Joi.object({
            id_competencea: Joi.number().integer().positive().required(),
            niveaua: Joi.number().integer().min(1).max(4).required(),
        }).unknown(true)
    ).allow(null),
}).unknown(true)

module.exports = { employeeSchema }
