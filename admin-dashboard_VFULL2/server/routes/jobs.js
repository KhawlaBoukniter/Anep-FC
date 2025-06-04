const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const Joi = require("joi")

// Schéma de validation pour un emploi
const jobSchema = Joi.object({
  code: Joi.string().min(3).max(20).required(),
  title: Joi.string().min(2).max(100).required(),
  entity: Joi.string().min(2).max(100).required(),
  formation: Joi.string().allow(""),
  experience: Joi.string().max(50).allow(""),
  weight_percentage: Joi.number().integer().min(0).max(100),
  department_id: Joi.number().integer().positive(),
  required_skills: Joi.array().items(
    Joi.object({
      skill_id: Joi.number().integer().positive().required(),
      required_level: Joi.number().integer().min(1).max(4).required(),
    }),
  ),
})

// GET /api/jobs - Récupérer tous les emplois
router.get("/", async (req, res) => {
  try {
    const { search, department_id } = req.query

    let query = `
      SELECT 
        j.*,
        d.name as department_name,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'required_level', jrs.required_level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
    `

    const conditions = []
    const params = []

    if (search) {
      conditions.push(
        `(j.title ILIKE $${params.length + 1} OR j.code ILIKE $${params.length + 1} OR j.entity ILIKE $${params.length + 1})`,
      )
      params.push(`%${search}%`)
    }

    if (department_id) {
      conditions.push(`j.department_id = $${params.length + 1}`)
      params.push(department_id)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` GROUP BY j.id, d.name ORDER BY j.code`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Erreur lors de la récupération des emplois:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des emplois" })
  }
})

// GET /api/jobs/:id - Récupérer un emploi par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        j.*,
        d.name as department_name,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'required_level', jrs.required_level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
      WHERE j.id = $1
      GROUP BY j.id, d.name
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emploi non trouvé" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erreur lors de la récupération de l'emploi:", error)
    res.status(500).json({ error: "Erreur lors de la récupération de l'emploi" })
  }
})

// POST /api/jobs - Créer un nouvel emploi
router.post("/", async (req, res) => {
  const client = await pool.connect()

  try {
    const { error, value } = jobSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { required_skills, ...jobData } = value

    await client.query("BEGIN")

    // Insérer l'emploi
    const insertJobQuery = `
      INSERT INTO jobs (code, title, entity, formation, experience, weight_percentage, department_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const jobValues = [
      jobData.code,
      jobData.title,
      jobData.entity,
      jobData.formation,
      jobData.experience,
      jobData.weight_percentage,
      jobData.department_id,
    ]

    const jobResult = await client.query(insertJobQuery, jobValues)
    const newJob = jobResult.rows[0]

    // Insérer les compétences requises si elles existent
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query("INSERT INTO job_required_skills (job_id, skill_id, required_level) VALUES ($1, $2, $3)", [
          newJob.id,
          skill.skill_id,
          skill.required_level,
        ])
      }
    }

    await client.query("COMMIT")

    // Récupérer l'emploi complet avec ses compétences requises
    const completeJob = await pool.query(
      `
      SELECT 
        j.*,
        d.name as department_name,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'required_level', jrs.required_level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
      WHERE j.id = $1
      GROUP BY j.id, d.name
    `,
      [newJob.id],
    )

    res.status(201).json(completeJob.rows[0])
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erreur lors de la création de l'emploi:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Un emploi avec ce code existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la création de l'emploi" })
    }
  } finally {
    client.release()
  }
})

// PUT /api/jobs/:id - Mettre à jour un emploi
router.put("/:id", async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params
    const { error, value } = jobSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { required_skills, ...jobData } = value

    await client.query("BEGIN")

    // Mettre à jour l'emploi
    const updateJobQuery = `
      UPDATE jobs 
      SET code = $1, title = $2, entity = $3, formation = $4, experience = $5, 
          weight_percentage = $6, department_id = $7
      WHERE id = $8
      RETURNING *
    `

    const jobValues = [
      jobData.code,
      jobData.title,
      jobData.entity,
      jobData.formation,
      jobData.experience,
      jobData.weight_percentage,
      jobData.department_id,
      id,
    ]

    const jobResult = await client.query(updateJobQuery, jobValues)

    if (jobResult.rows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Emploi non trouvé" })
    }

    // Supprimer les anciennes compétences requises
    await client.query("DELETE FROM job_required_skills WHERE job_id = $1", [id])

    // Insérer les nouvelles compétences requises
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query("INSERT INTO job_required_skills (job_id, skill_id, required_level) VALUES ($1, $2, $3)", [
          id,
          skill.skill_id,
          skill.required_level,
        ])
      }
    }

    await client.query("COMMIT")

    // Récupérer l'emploi complet mis à jour
    const completeJob = await pool.query(
      `
      SELECT 
        j.*,
        d.name as department_name,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'required_level', jrs.required_level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      LEFT JOIN job_required_skills jrs ON j.id = jrs.job_id
      LEFT JOIN skills s ON jrs.skill_id = s.id
      WHERE j.id = $1
      GROUP BY j.id, d.name
    `,
      [id],
    )

    res.json(completeJob.rows[0])
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erreur lors de la mise à jour de l'emploi:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Un emploi avec ce code existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'emploi" })
    }
  } finally {
    client.release()
  }
})

// DELETE /api/jobs/:id - Supprimer un emploi
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM jobs WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emploi non trouvé" })
    }

    res.json({ message: "Emploi supprimé avec succès", job: result.rows[0] })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'emploi:", error)
    res.status(500).json({ error: "Erreur lors de la suppression de l'emploi" })
  }
})

module.exports = router
