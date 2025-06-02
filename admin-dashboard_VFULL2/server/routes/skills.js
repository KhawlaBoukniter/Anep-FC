const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const Joi = require("joi")

// Schéma de validation pour une compétence
const skillSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  icon: Joi.string().max(10).default("⭐"),
  category: Joi.string().max(50).allow(""),
})

// GET /api/skills - Récupérer toutes les compétences
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query

    let query = "SELECT * FROM skills"
    const conditions = []
    const params = []

    if (search) {
      conditions.push(`name ILIKE $${params.length + 1}`)
      params.push(`%${search}%`)
    }

    if (category) {
      conditions.push(`category = $${params.length + 1}`)
      params.push(category)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += " ORDER BY name"

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Erreur lors de la récupération des compétences:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des compétences" })
  }
})

// GET /api/skills/:id - Récupérer une compétence par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM skills WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compétence non trouvée" })
    }

    res.json(result.rows[0])
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

    const { name, icon, category } = value

    const result = await pool.query("INSERT INTO skills (name, icon, category) VALUES ($1, $2, $3) RETURNING *", [
      name,
      icon,
      category,
    ])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Erreur lors de la création de la compétence:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Une compétence avec ce nom existe déjà" })
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

    const { name, icon, category } = value

    const result = await pool.query("UPDATE skills SET name = $1, icon = $2, category = $3 WHERE id = $4 RETURNING *", [
      name,
      icon,
      category,
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compétence non trouvée" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la compétence:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Une compétence avec ce nom existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la mise à jour de la compétence" })
    }
  }
})

// DELETE /api/skills/:id - Supprimer une compétence
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM skills WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Compétence non trouvée" })
    }

    res.json({ message: "Compétence supprimée avec succès", skill: result.rows[0] })
  } catch (error) {
    console.error("Erreur lors de la suppression de la compétence:", error)
    res.status(500).json({ error: "Erreur lors de la suppression de la compétence" })
  }
})

// GET /api/skills/categories - Récupérer toutes les catégories de compétences
router.get("/meta/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT category FROM skills WHERE category IS NOT NULL AND category != '' ORDER BY category",
    )

    res.json(result.rows.map((row) => row.category))
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des catégories" })
  }
})

module.exports = router
