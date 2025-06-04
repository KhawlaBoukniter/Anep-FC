const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const Joi = require("joi")

// Schéma de validation pour un employé
const employeeSchema = Joi.object({
  nom_complet: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  adresse: Joi.string().max(255).allow(""),
  telephone1: Joi.string().max(20).allow(""),
  telephone2: Joi.string().max(20).allow(""),
  categorie: Joi.string().max(50).allow(""),
  specialite: Joi.string().max(100).allow(""),
  experience_employe: Joi.number().integer().min(0).allow(null),
  role: Joi.string().valid("user", "admin").default("user"),
  date_naissance: Joi.date().allow(null),
  date_recrutement: Joi.date().required(),
  cin: Joi.string().max(50).required(),
  emplois: Joi.array().items(
    Joi.object({
      id_emploi: Joi.number().integer().positive().required(),
    })
  ).required(),
  competences: Joi.array().items(
    Joi.object({
      id_competencea: Joi.number().integer().positive().required(),
      niveaua: Joi.number().integer().min(1).max(4).required(),
    })
  ).allow(null),
})

// GET /api/employees - Récupérer tous les employés
router.get("/", async (req, res) => {
  try {
    const { search, role } = req.query

    let query = `
      SELECT 
        e.*,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id_emploi', em.id_emploi,
            'nom_emploi', em.nom_emploi,
            'codeemploi', em.codeemploi
          ))
          FROM emploi_employe ee
          LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
          WHERE ee.id_employe = e.id_employe
        ) AS emplois,
        (
          SELECT json_agg(DISTINCT jsonb_build_object(
            'id_competencea', ec.id_competencea,
            'code_competencea', c.code_competencea,
            'competencea', c.competencea,
            'niveaua', ec.niveaua
          ))
          FROM employe_competencea ec
          LEFT JOIN competencesa c ON ec.id_competencea = c.id_competencea
          WHERE ec.id_employe = e.id_employe
        ) AS competences
      FROM employe e
      
    `

    const conditions = []
    const params = []

    if (search) {
      conditions.push(
        `(e.nom_complet ILIKE $${params.length + 1} OR e.email ILIKE $${params.length + 1})`
      )
      params.push(`%${search}%`)
    }

    if (role && role !== "all") {
      conditions.push(`e.role = $${params.length + 1}`)
      params.push(role)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` GROUP BY e.id_employe ORDER BY e.nom_complet`

    const result = await pool.query(query, params)
    const employees = result.rows.map(row => ({
      ...row,
      id: row.id_employe.toString(),
      emplois: (row.emplois || []).map(job => ({
        ...job,
        id_emploi: job.id_emploi.toString()
      })),
      competences: (row.competences || []).map(skill => ({
        ...skill,
        id_competencea: skill.id_competencea.toString()
      }))
    }))
    res.json(employees)
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error)
    res.status(500).json({ error: "Erreur lors de la récupération des employés" })
  }
})

// GET /api/employees/:id - Récupérer un employé par ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_emploi', em.id_emploi,
              'nom_emploi', em.nom_emploi,
              'codeemploi', em.codeemploi
            )
          ) FILTER (WHERE em.id_emploi IS NOT NULL), 
          '[]'
        ) as emplois,
        COALESCE(
          json_agg(
            json_build_object(
              'id_competencea', ec.id_competencea,
              'code_competencea', c.code_competencea,
              'competencea', c.competencea,
              'niveaua', ec.niveaua
            )
          ) FILTER (WHERE ec.id_competencea IS NOT NULL), 
          '[]'
        ) as competences
      FROM employe e
      LEFT JOIN emploi_employe ee ON e.id_employe = ee.id_employe
      LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
      LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe
      LEFT JOIN competencesa c ON ec.id_competencea = c.id_competencea
      WHERE e.id_employe = $1
      GROUP BY e.id_employe
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employé non trouvé" })
    }

    const employee = {
      ...result.rows[0],
      id: result.rows[0].id_employe.toString(),
      emplois: (result.rows[0].emplois || []).map(job => ({
        ...job,
        id_emploi: job.id_emploi.toString()
      })),
      competences: result.rows[0].competences.map(skill => ({
        ...skill,
        id_competencea: skill.id_competencea.toString()
      }))
    }

    res.json(employee)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'employé:", error)
    res.status(500).json({ error: "Erreur lors de la récupération de l'employé" })
  }
})

// POST /api/employees - Créer un nouvel employé
router.post("/", async (req, res) => {
  const client = await pool.connect()
  console.log("Contenu reçu :", req.body)


  try {
    const { error, value } = employeeSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { emplois, competences, ...employeeData } = value

    await client.query("BEGIN")

    // Insérer l'employé
    const insertEmployeeQuery = `
      INSERT INTO employe (nom_complet, email, adresse, telephone1, telephone2, categorie, specialite, experience_employe, role, date_naissance, date_recrutement, cin)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `

    const employeeValues = [
      employeeData.nom_complet,
      employeeData.email,
      employeeData.adresse,
      employeeData.telephone1,
      employeeData.telephone2,
      employeeData.categorie,
      employeeData.specialite,
      employeeData.experience_employe,
      employeeData.role,
      employeeData.date_naissance,
      employeeData.date_recrutement,
      employeeData.cin,
    ]

    const employeeResult = await client.query(insertEmployeeQuery, employeeValues)
    const newEmployee = employeeResult.rows[0]

    // Insérer les relations emploi_employe
    if (emplois && emplois.length > 0) {
      for (const job of emplois) {
        await client.query("INSERT INTO emploi_employe (id_emploi, id_employe) VALUES ($1, $2)", [
          job.id_emploi,
          newEmployee.id_employe,
        ])
      }
    }

    // Insérer les compétences si elles existent
    if (competences && competences.length > 0) {
      for (const skill of competences) {
        await client.query("INSERT INTO employe_competencea (id_employe, id_competencea, niveaua) VALUES ($1, $2, $3)", [
          newEmployee.id_employe,
          skill.id_competencea,
          skill.niveaua,
        ])
      }
    }

    await client.query("COMMIT")

    // Récupérer l'employé complet
    const completeEmployeeQuery = `
      SELECT 
        e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_emploi', em.id_emploi,
              'nom_emploi', em.nom_emploi,
              'codeemploi', em.codeemploi
            )
          ) FILTER (WHERE em.id_emploi IS NOT NULL), 
          '[]'
        ) as emplois,
        COALESCE(
          json_agg(
            json_build_object(
              'id_competencea', ec.id_competencea,
              'code_competencea', c.code_competencea,
              'competencea', c.competencea,
              'niveaua', ec.niveaua
            )
          ) FILTER (WHERE ec.id_competencea IS NOT NULL), 
          '[]'
        ) as competences
      FROM employe e
      LEFT JOIN emploi_employe ee ON e.id_employe = ee.id_employe
      LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
      LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe
      LEFT JOIN competencesa c ON ec.id_competencea = c.id_competencea
      WHERE e.id_employe = $1
      GROUP BY e.id_employe
    `

    const completeEmployeeResult = await pool.query(completeEmployeeQuery, [newEmployee.id_employe])
    const completeEmployee = {
      ...completeEmployeeResult.rows[0],
      id: completeEmployeeResult.rows[0].id_employe.toString(),
      emplois: completeEmployeeResult.rows[0].emplois.map(job => ({
        ...job,
        id_emploi: job.id_emploi.toString()
      })),
      competences: completeEmployeeResult.rows[0].competences.map(skill => ({
        ...skill,
        id_competencea: skill.id_competencea.toString()
      }))
    }

    res.status(201).json(completeEmployee)
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erreur lors de la création de l'employé:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Un employé avec cet email ou CIN existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la création de l'employé" })
    }
  } finally {
    client.release()
  }
})

// PUT /api/employees/:id - Mettre à jour un employé
router.put("/:id", async (req, res) => {
  const client = await pool.connect()

  try {
    const { id } = req.params
    const { error, value } = employeeSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { emplois, competences, ...employeeData } = value

    await client.query("BEGIN")

    // Mettre à jour l'employé
    const updateEmployeeQuery = `
      UPDATE employe 
      SET nom_complet = $1, email = $2, adresse = $3, telephone1 = $4, telephone2 = $5, 
          categorie = $6, specialite = $7, experience_employe = $8, role = $9, 
          date_naissance = $10, date_recrutement = $11, cin = $12
      WHERE id_employe = $13
      RETURNING *
    `

    const employeeValues = [
      employeeData.nom_complet,
      employeeData.email,
      employeeData.adresse,
      employeeData.telephone1,
      employeeData.telephone2,
      employeeData.categorie,
      employeeData.specialite,
      employeeData.experience_employe,
      employeeData.role,
      employeeData.date_naissance,
      employeeData.date_recrutement,
      employeeData.cin,
      id,
    ]

    const employeeResult = await client.query(updateEmployeeQuery, employeeValues)

    if (employeeResult.rows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Employé non trouvé" })
    }

    // Supprimer les anciennes relations emploi_employe
    await client.query("DELETE FROM emploi_employe WHERE id_employe = $1", [id])

    // Insérer les nouvelles relations emploi_employe
    if (emplois && emplois.length > 0) {
      for (const job of emplois) {
        await client.query("INSERT INTO emploi_employe (id_emploi, id_employe) VALUES ($1, $2)", [
          job.id_emploi,
          id,
        ])
      }
    }

    // Supprimer les anciennes compétences
    await client.query("DELETE FROM employe_competencea WHERE id_employe = $1", [id])

    // Insérer les nouvelles compétences
    if (competences && competences.length > 0) {
      for (const skill of competences) {
        await client.query("INSERT INTO employe_competencea (id_employe, id_competencea, niveaua) VALUES ($1, $2, $3)", [
          id,
          skill.id_competencea,
          skill.niveaua,
        ])
      }
    }

    await client.query("COMMIT")

    // Récupérer l'employé complet mis à jour
    const completeEmployeeQuery = `
      SELECT 
        e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_emploi', em.id_emploi,
              'nom_emploi', em.nom_emploi,
              'codeemploi', em.codeemploi
            )
          ) FILTER (WHERE em.id_emploi IS NOT NULL), 
          '[]'
        ) as emplois,
        COALESCE(
          json_agg(
            json_build_object(
              'id_competencea', ec.id_competencea,
              'code_competencea', c.code_competencea,
              'competencea', c.competencea,
              'niveaua', ec.niveaua
            )
          ) FILTER (WHERE ec.id_competencea IS NOT NULL), 
          '[]'
        ) as competences
      FROM employe e
      LEFT JOIN emploi_employe ee ON e.id_employe = ee.id_employe
      LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
      LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe
      LEFT JOIN competencesa c ON ec.id_competencea = c.id_competencea
      WHERE e.id_employe = $1
      GROUP BY e.id_employe
    `

    const completeEmployeeResult = await pool.query(completeEmployeeQuery, [id])
    const completeEmployee = {
      ...completeEmployeeResult.rows[0],
      id: completeEmployeeResult.rows[0].id_employe.toString(),
      emplois: completeEmployeeResult.rows[0].emplois.map(job => ({
        ...job,
        id_emploi: job.id_emploi.toString()
      })),
      competences: completeEmployeeResult.rows[0].competences.map(skill => ({
        ...skill,
        id_competencea: skill.id_competencea.toString()
      }))
    }

    res.json(completeEmployee)
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erreur lors de la mise à jour de l'employé:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Un employé avec cet email ou CIN existe déjà" })
    } else {
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'employé" })
    }
  } finally {
    client.release()
  }
})

// DELETE /api/employees/:id - Supprimer un employé
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("DELETE FROM employe WHERE id_employe = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employé non trouvé" })
    }

    res.json({ message: "Employé supprimé avec succès", employee: { ...result.rows[0], id: result.rows[0].id_employe.toString() } })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error)
    res.status(500).json({ error: "Erreur lors de la suppression de l'employé" })
  }
})

module.exports = router
