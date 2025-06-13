const Joi = require("joi")

const skillSchema = Joi.object({
    code_competencea: Joi.string().max(50).min(2).required(),
    competencea: Joi.string().min(2).max(255).required(),
})

module.exports = { skillSchema }