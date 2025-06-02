const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const Joi = require("joi")

// Schéma de validation pour un département
const departmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow(""),
})

// GET /api/departments - Récupérer tous les départements
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT 
        d.*,
        COUNT(DISTINCT e.id) as employee_count,
        COUNT(DISTINCT j.id) as job_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN jobs j ON d.id = j.department_id
      GROUP BY d.id, d.name, d.description, d.created_at
      ORDER BY d.name
    `

    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des départements" })
  }
})

// GET /api/departments/:id - Récupérer un département par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        d.*,
        COUNT(DISTINCT e.id) as employee_count,
        COUNT(DISTINCT j.id) as job_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN jobs j ON d.id = j.department_id
      WHERE d.id = $1
      GROUP BY d.id, d.name, d.description, d.created_at
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Département non trouvé" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erreur lors de la récupération du département:", error)
    res.status(500).json({ error: "Erreur lors de la récupération du département" })
  }
})

// POST /api/departments - Créer un nouveau département
router.post("/", async (req, res) => {
  try {
    const { error, value } = departmentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, description } = value

    const result = await pool.query("INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *", [
      name,
      description,
    ])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Erreur lors de la création du département:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Un département avec ce nom existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la création du département" })
    }
  }
})

// PUT /api/departments/:id - Mettre à jour un département
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = departmentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, description } = value

    const result = await pool.query("UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING *", [
      name,
      description,
      id,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Département non trouvé" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erreur lors de la mise à jour du département:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Un département avec ce nom existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la mise à jour du département" })
    }
  }
})

// DELETE /api/departments/:id - Supprimer un département
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier s'il y a des employés ou des emplois liés
    const checkQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as employee_count,
        COUNT(DISTINCT j.id) as job_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN jobs j ON d.id = j.department_id
      WHERE d.id = $1
    `

    const checkResult = await pool.query(checkQuery, [id])
    const { employee_count, job_count } = checkResult.rows[0]

    if (Number.parseInt(employee_count) > 0 || Number.parseInt(job_count) > 0) {
      return res.status(409).json({
        error: "Impossible de supprimer ce département car il contient des employés ou des emplois",
      })
    }

    const result = await pool.query("DELETE FROM departments WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Département non trouvé" })
    }

    res.json({ message: "Département supprimé avec succès", department: result.rows[0] })
  } catch (error) {
    console.error("Erreur lors de la suppression du département:", error)
    res.status(500).json({ error: "Erreur lors de la suppression du département" })
  }
})

module.exports = router
