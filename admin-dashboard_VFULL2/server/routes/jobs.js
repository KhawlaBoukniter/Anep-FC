const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const Joi = require("joi")

// Schéma de validation pour un emploi
const jobSchema = Joi.object({
  nom_emploi: Joi.string().min(2).max(255).required(),
  entite: Joi.string().min(2).max(100).required(),
  formation: Joi.string().max(255).required(),
  experience: Joi.number().integer().allow(null),
  codeemploi: Joi.string().min(3).max(50).required(),
  poidsemploi: Joi.number().integer().min(0).max(100).default(0),
  required_skills: Joi.array().items(
    Joi.object({
      id_competencer: Joi.number().integer().positive().required(),
      niveaur: Joi.number().integer().min(1).max(4).required(),
    })
  ).allow(null),
})

// GET /api/jobs - Récupérer tous les emplois
router.get("/", async (req, res) => {
  try {
    const { search } = req.query

    let query = `
      SELECT 
        j.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_competencer', cr.id_competencer,
              'code_competencer', cr.code_competencer,
              'competencer', cr.competencer,
              'niveaur', ec.niveaur
            )
          ) FILTER (WHERE cr.id_competencer IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM emploi j
      LEFT JOIN emploi_competencer ec ON j.id_emploi = ec.id_emploi
      LEFT JOIN competencesR cr ON ec.id_competencer = cr.id_competencer
    `

    const conditions = []
    const params = []

    if (search) {
      conditions.push(
        `(j.nom_emploi ILIKE $${params.length + 1} OR j.codeemploi ILIKE $${params.length + 1} OR j.entite ILIKE $${params.length + 1})`,
      )
      params.push(`%${search}%`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` GROUP BY j.id_emploi ORDER BY CAST(SUBSTRING(j.codeemploi FROM '\\d+') AS INTEGER)
`

    const result = await pool.query(query, params)
    const jobs = result.rows.map(row => ({
      ...row,
      id_emploi: row.id_emploi.toString(),
      required_skills: row.required_skills.map(skill => ({
        ...skill,
        id_competencer: skill.id_competencer.toString()
      }))
    }))
    res.json(jobs)
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
        COALESCE(
          json_agg(
            json_build_object(
              'id_competencer', cr.id_competencer,
              'code_competencer', cr.code_competencer,
              'competencer', cr.competencer,
              'niveaur', ec.niveaur
            )
          ) FILTER (WHERE cr.id_competencer IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM emploi j
      LEFT JOIN emploi_competencer ec ON j.id_emploi = ec.id_emploi
      LEFT JOIN competencesR cr ON ec.id_competencer = cr.id_competencer
      WHERE j.id_emploi = $1
      GROUP BY j.id_emploi
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emploi non trouvé" })
    }

    const job = {
      ...result.rows[0],
      id_emploi: result.rows[0].id_emploi.toString(),
      required_skills: result.rows[0].required_skills.map(skill => ({
        ...skill,
        id_competencer: skill.id_competencer.toString()
      }))
    }

    res.json(job)
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
      INSERT INTO emploi (nom_emploi, entite, formation, experience, codeemploi, poidsemploi)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `

    const jobValues = [
      jobData.nom_emploi,
      jobData.entite,
      jobData.formation,
      jobData.experience,
      jobData.codeemploi,
      jobData.poidsemploi,
    ]

    const jobResult = await client.query(insertJobQuery, jobValues)
    const newJob = jobResult.rows[0]

    // Insérer les compétences requises si elles existent
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query("INSERT INTO emploi_competencer (id_emploi, id_competencer, niveaur) VALUES ($1, $2, $3)", [
          newJob.id_emploi,
          skill.id_competencer,
          skill.niveaur,
        ])
      }
    }

    await client.query("COMMIT")

    // Récupérer l'emploi complet
    const completeJobQuery = `
      SELECT 
        j.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_competencer', cr.id_competencer,
              'code_competencer', cr.code_competencer,
              'competencer', cr.competencer,
              'niveaur', ec.niveaur
            )
          ) FILTER (WHERE cr.id_competencer IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM emploi j
      LEFT JOIN emploi_competencer ec ON j.id_emploi = ec.id_emploi
      LEFT JOIN competencesR cr ON ec.id_competencer = cr.id_competencer
      WHERE j.id_emploi = $1
      GROUP BY j.id_emploi
    `

    const completeJobResult = await pool.query(completeJobQuery, [newJob.id_emploi])
    const completeJob = {
      ...completeJobResult.rows[0],
      id_emploi: completeJobResult.rows[0].id_emploi.toString(),
      required_skills: completeJobResult.rows[0].required_skills.map(skill => ({
        ...skill,
        id_competencer: skill.id_competencer.toString()
      }))
    }

    res.status(201).json(completeJob)
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
    console.log("Received PUT request for job ID:", id)
    console.log("Request body:", req.body)

    const { error, value } = jobSchema.validate(req.body)
    if (error) {
      console.error("Validation error:", error.details[0].message)
      return res.status(400).json({ error: error.details[0].message })
    }

    const { required_skills, ...jobData } = value

    await client.query("BEGIN")

    // Mettre à jour l'emploi
    const updateJobQuery = `
      UPDATE emploi 
      SET nom_emploi = $1, entite = $2, formation = $3, experience = $4, 
          codeemploi = $5, poidsemploi = $6
      WHERE id_emploi = $7
      RETURNING *
    `

    const jobValues = [
      jobData.nom_emploi,
      jobData.entite,
      jobData.formation,
      jobData.experience,
      jobData.codeemploi,
      jobData.poidsemploi,
      id,
    ]

    console.log("Executing update query:", updateJobQuery)
    console.log("Query parameters:", jobValues)

    const jobResult = await client.query(updateJobQuery, jobValues)
    console.log("Update query result:", jobResult.rows)

    if (jobResult.rows.length === 0) {
      await client.query("ROLLBACK")
      console.log("No job found for ID:", id)
      return res.status(404).json({ error: "Emploi non trouvé" })
    }

    // Supprimer les anciennes compétences requises
    console.log("Deleting old skills for job ID:", id)
    await client.query("DELETE FROM emploi_competencer WHERE id_emploi = $1", [id])

    // Insérer les nouvelles compétences requises
    if (required_skills && required_skills.length > 0) {
      console.log("Inserting new skills:", required_skills)
      for (const skill of required_skills) {
        await client.query("INSERT INTO emploi_competencer (id_emploi, id_competencer, niveaur) VALUES ($1, $2, $3)", [
          id,
          skill.id_competencer,
          skill.niveaur,
        ])
      }
    } else {
      console.log("No new skills to insert")
    }

    await client.query("COMMIT")

    // Récupérer l'emploi complet
    const completeJobQuery = `
      SELECT 
        j.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_competencer', cr.id_competencer,
              'code_competencer', cr.code_competencer,
              'competencer', cr.competencer,
              'niveaur', ec.niveaur
            )
          ) FILTER (WHERE cr.id_competencer IS NOT NULL), 
          '[]'
        ) as required_skills
      FROM emploi j
      LEFT JOIN emploi_competencer ec ON j.id_emploi = ec.id_emploi
      LEFT JOIN competencesR cr ON ec.id_competencer = cr.id_competencer
      WHERE j.id_emploi = $1
      GROUP BY j.id_emploi
    `

    const completeJobResult = await pool.query(completeJobQuery, [id])
    const completeJob = {
      ...completeJobResult.rows[0],
      id_emploi: completeJobResult.rows[0].id_emploi.toString(),
      required_skills: completeJobResult.rows[0].required_skills.map(skill => ({
        ...skill,
        id_competencer: skill.id_competencer.toString(),
      }))
    }

    res.json(completeJob)
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error during job update:", error.stack || error)
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'emploi" })
  } finally {
    client.release()
  }
})

// DELETE /api/jobs/:id - Supprimer un emploi
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM emploi WHERE id_emploi = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Emploi non trouvé" })
    }

    res.json({ message: "Emploi supprimé avec succès", job: { id: result.rows[0].id_emploi.toString() } })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'emploi:", error)
    res.status(500).json({ error: "Erreur lors de la suppression de l'emploi" })
  }
})

module.exports = router