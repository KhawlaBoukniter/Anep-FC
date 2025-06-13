const Joi = require("joi")

const skillSchema = Joi.object({
    code_competencer: Joi.string().max(50).min(2).required(),
    competencer: Joi.string().min(2).max(255).required(),
})

module.exports = { skillSchema }