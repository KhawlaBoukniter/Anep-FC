const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const Joi = require("joi")

// Schéma de validation pour une compétence
const skillSchema = Joi.object({
  code_competencea: Joi.string().max(50).min(2).required(),
  competencea: Joi.string().min(2).max(255).required(),
})

// GET /api/skills - Récupérer toutes les compétences
router.get("/", async (req, res) => {
  try {
    const { search } = req.query

    let query = "SELECT * FROM competencesa"
    const conditions = []
    const params = []

    if (search) {
      conditions.push(`competencea ILIKE $${params.length + 1}`)
      params.push(`%${search}%`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += " ORDER BY competencea"

    const result = await pool.query(query, params)
    const skills = result.rows.map(row => ({
      ...row,
      id: row.id_competencea.toString(),
    }))
    res.json(skills)
  } catch (error) {
    console.error("Erreur lors de la récupération des compétences:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des compétences" })
  }
})

// GET /api/skills/:id - Récupérer une compétence par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM competencesa WHERE id_competencea = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compétence non trouvé" })
    }

    const skill = {
      ...result.rows[0],
      id: result.rows[0].id_competencea.toString(),
    }

    res.json(skill)
  } catch (error) {
    console.error("Erreur lors de la récupération de la compétence:", error)
    res.status(500).json({ error: "Erreur lors de la récupération de la compétence" })
  }
})

// POST /api/skills - Créer une nouvelle compétence
router.post("/", async (req, res) => {
  try {
    const { error, value } = skillSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { code_competencea, competencea } = value

    const result = await pool.query(
      "INSERT INTO competencesa (code_competencea, competencea) VALUES ($1, $2) RETURNING *",
      [code_competencea, competencea],
    )

    const newSkill = {
      ...result.rows[0],
      id: result.rows[0].id_competencea.toString(),
    }

    res.status(201).json(newSkill)

  } catch (error) {
    console.error("Erreur lors de la création de la compétence:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Une compétence avec ce code existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la création de la compétence" })
    }
  }
})

// PUT /api/skills/:id - Mettre à jour une compétence
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = skillSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { code_competencea, competencea } = value

    const result = await pool.query(
      "UPDATE competencesa SET code_competencea = $1, competencea = $2 WHERE id_competencea = $3 RETURNING *",
      [code_competencea, competencea, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compétence non trouvée" })
    }

    const updatedSkill = {
      ...result.rows[0],
      id: result.rows[0].id_competencea.toString(),
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
})

// DELETE /api/skills/:id - Supprimer une compétence
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM competencesa WHERE id_competencea = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compétence non trouvée" })
    }

    res.json({ message: "Compétence supprimée avec succès", skill: { id: result.rows[0].id_competencea.toString() } })
  } catch (error) {
    console.error("Erreur lors de la suppression de la compétence:", error)
    res.status(500).json({ error: "Erreur lors de la suppression de la compétence" })
  }
})

module.exports = router