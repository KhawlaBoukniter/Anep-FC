const { skillsGapSchema, jobMatchSchema } = require("../validators/analysisValidator")
const analysisModel = require("../models/analysisModel")

async function getSkillsGap(req, res) {
    try {
        const { error, value } = skillsGapSchema.validate(req.query)
        if (error) {
            return res.status(400).json({ error: error.details[0].message })
        }

        const employees = await analysisModel.getSkillsGap(value)
        res.json(employees)
    } catch (error) {
        console.error("Erreur lors de l'analyse des écarts de compétences:", error)
        res.status(500).json({ error: "Erreur lors de l'analyse des écarts de compétences" })
    }
}

async function getSkillsDistribution(req, res) {
    try {
        const distribution = await analysisModel.getSkillsDistribution()
        res.json(distribution)
    } catch (error) {
        console.error("Erreur lors de l'analyse de la distribution des compétences:", error)
        res.status(500).json({ error: "Erreur lors de l'analyse de la distribution des compétences" })
    }
}

async function getJobMatch(req, res) {
    try {
        const { error, value } = jobMatchSchema.validate(req.query)
        if (error) {
            return res.status(400).json({ error: error.details[0].message })
        }

        const employees = await analysisModel.getJobMatch(value.id_emploi)
        res.json(employees)
    } catch (error) {
        console.error("Erreur lors de l'analyse de correspondance emploi-employé:", error)
        res.status(500).json({ error: "Erreur lors de l'analyse de correspondance emploi-employé" })
    }
}

async function getSkillsAnalysis(req, res) {
    try {
        const analysis = await analysisModel.getSkillsAnalysis()
        res.json(analysis)
    } catch (error) {
        console.error("Erreur lors de l'analyse des compétences:", error)
        res.status(500).json({ error: "Erreur lors de l'analyse des compétences" })
    }
}

module.exports = {
    getSkillsGap,
    getSkillsDistribution,
    getJobMatch,
    getSkillsAnalysis
}