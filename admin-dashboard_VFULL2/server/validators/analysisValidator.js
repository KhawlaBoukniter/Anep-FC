const Joi = require("joi")

const skillsGapSchema = Joi.object({
    id_competencea: Joi.string().required(),
    niveaua: Joi.number().integer().min(1).required(),
    gap_filter: Joi.string().valid("yes", "no").optional(),
    specific_gap: Joi.number().integer().optional()
})

const jobMatchSchema = Joi.object({
    id_emploi: Joi.string().required()
})

module.exports = { skillsGapSchema, jobMatchSchema }