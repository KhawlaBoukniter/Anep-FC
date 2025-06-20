const { skillSchema } = require("../validators/reqSkillValidator")
const skillModel = require("../models/reqSkillModel")
const pool = require("../config/database")


async function getLatestCode(req, res) {
    try {
        const latestCode = await skillModel.getLatestCode()
        res.json({ latestCode })
    } catch (error) {
        console.error("Erreur lors de la récupération du dernier code:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
        })
        res.status(500).json({
            error: "Erreur lors de la récupération du dernier code",
            details: error.message,
        })
    }
}

async function getSkills(req, res) {
    try {
        const { search } = req.query
        const skills = await skillModel.getAllSkills({ search })
        res.json(skills)
    } catch (error) {
        console.error("Erreur lors de la récupération des compétences:", error)
        res.status(500).json({ error: "Erreur lors de la récupération des compétences" })
    }
}

async function getSkill(req, res) {
    try {
        const { id } = req.params
        const skill = await skillModel.getSkillById(id)
        if (!skill) {
            return res.status(404).json({ error: "Compétence non trouvée" })
        }
        res.json(skill)
    } catch (error) {
        console.error("Erreur lors de la récupération de la compétence:", error)
        res.status(500).json({ error: "Erreur lors de la récupération de la compétence" })
    }
}

async function createSkill(req, res) {
    try {
        const { error, value } = skillSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ error: error.details[0].message })
        }

        const newSkill = await skillModel.createSkill(value)
        res.status(201).json(newSkill)
    } catch (error) {
        console.error("Erreur lors de la création de la compétence:", error)
        if (error.code === "23505") {
            res.status(409).json({ error: "Une compétence avec ce code existe déjà" })
        } else {
            res.status(500).json({ error: "Erreur lors de la création de la compétence" })
        }
    }
}

async function updateSkill(req, res) {
    try {
        const { id } = req.params
        const { error, value } = skillSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ error: error.details[0].message })
        }

        const updatedSkill = await skillModel.updateSkill(id, value)
        if (!updatedSkill) {
            return res.status(404).json({ error: "Compétence non trouvée" })
        }
        res.json(updatedSkill)
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la compétence:", error)
        if (error.code === "23505") {
            res.status(409).json({ error: "Une compétence avec ce code existe déjà" })
        } else {
            res.status(500).json({ error: "Erreur lors de la mise à jour de la compétence" })
        }
    }
}

async function deleteSkill(req, res) {
    try {
        const { id } = req.params
        const deletedSkill = await skillModel.deleteSkill(id)
        if (!deletedSkill) {
            return res.status(404).json({ error: "Compétence non trouvée" })
        }
        res.json({ message: "Compétence supprimée avec succès", skill: deletedSkill })
    } catch (error) {
        console.error("Erreur lors de la suppression de la compétence:", error)
        res.status(500).json({ error: "Erreur lors de la suppression de la compétence" })
    }
}

async function getRequiredSkills(req, res) {
    try {
        const { jobIds } = req.query;
        if (!jobIds) {
            return res.status(400).json({ error: "Les IDs des emplois sont requis." });
        }
        const jobIdArray = jobIds.split(",").map(Number);
        const query = `
      SELECT cr.id_competencer, cr.code_competencer, cr.competencer
      FROM competencesR cr
      JOIN emploi_competencer ec ON cr.id_competencer = ec.id_competencer
      WHERE ec.id_emploi = ANY($1)
    `;
        const result = await pool.query(query, [jobIdArray]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des compétences requises:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
}

module.exports = {
    getLatestCode,
    getSkills,
    getSkill,
    createSkill,
    updateSkill,
    deleteSkill,
    getRequiredSkills
}