const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const Joi = require("joi")

// Schéma de validation pour un employé
const employeeSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20),
  job_id: Joi.number().integer().positive(),
  department_id: Joi.number().integer().positive(),
  category: Joi.string().max(50),
  specialty: Joi.string().max(100),
  hire_date: Joi.date(),
  role: Joi.string().valid("user", "admin").default("user"),
  skills: Joi.array().items(
    Joi.object({
      skill_id: Joi.number().integer().positive().required(),
      level: Joi.number().integer().min(1).max(4).required(),
    }),
  ),
})

// GET /api/employees - Récupérer tous les employés
router.get("/", async (req, res) => {
  try {
    const { search, department_id, job_id, role } = req.query

    let query = `
      SELECT 
        e.*,
        d.name as department_name,
        j.title as job_title,
        j.code as job_code,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'level', es.level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as skills
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN jobs j ON e.job_id = j.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
    `

    const conditions = []
    const params = []

    if (search) {
      conditions.push(
        `(e.first_name ILIKE $${params.length + 1} OR e.last_name ILIKE $${params.length + 1} OR e.email ILIKE $${params.length + 1})`,
      )
      params.push(`%${search}%`)
    }

    if (department_id) {
      conditions.push(`e.department_id = $${params.length + 1}`)
      params.push(department_id)
    }

    if (job_id) {
      conditions.push(`e.job_id = $${params.length + 1}`)
      params.push(job_id)
    }

    if (role) {
      conditions.push(`e.role = $${params.length + 1}`)
      params.push(role)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` GROUP BY e.id, d.name, j.title, j.code ORDER BY e.last_name, e.first_name`

    const result = await pool.query(query, params)
    res.json(result.rows)
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
        d.name as department_name,
        j.title as job_title,
        j.code as job_code,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'level', es.level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as skills
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN jobs j ON e.job_id = j.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE e.id = $1
      GROUP BY e.id, d.name, j.title, j.code
    `

    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employé non trouvé" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Erreur lors de la récupération de l'employé:", error)
    res.status(500).json({ error: "Erreur lors de la récupération de l'employé" })
  }
})

// POST /api/employees - Créer un nouvel employé
router.post("/", async (req, res) => {
  const client = await pool.connect()

  try {
    const { error, value } = employeeSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { skills, ...employeeData } = value

    await client.query("BEGIN")

    // Insérer l'employé
    const insertEmployeeQuery = `
      INSERT INTO employees (first_name, last_name, email, phone, job_id, department_id, category, specialty, hire_date, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    const employeeValues = [
      employeeData.first_name,
      employeeData.last_name,
      employeeData.email,
      employeeData.phone,
      employeeData.job_id,
      employeeData.department_id,
      employeeData.category,
      employeeData.specialty,
      employeeData.hire_date,
      employeeData.role,
    ]

    const employeeResult = await client.query(insertEmployeeQuery, employeeValues)
    const newEmployee = employeeResult.rows[0]

    // Insérer les compétences si elles existent
    if (skills && skills.length > 0) {
      for (const skill of skills) {
        await client.query("INSERT INTO employee_skills (employee_id, skill_id, level) VALUES ($1, $2, $3)", [
          newEmployee.id,
          skill.skill_id,
          skill.level,
        ])
      }
    }

    await client.query("COMMIT")

    // Récupérer l'employé complet avec ses compétences
    const completeEmployee = await pool.query(
      `
      SELECT 
        e.*,
        d.name as department_name,
        j.title as job_title,
        j.code as job_code,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'level', es.level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as skills
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN jobs j ON e.job_id = j.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE e.id = $1
      GROUP BY e.id, d.name, j.title, j.code
    `,
      [newEmployee.id],
    )

    res.status(201).json(completeEmployee.rows[0])
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erreur lors de la création de l'employé:", error)

    if (error.code === "23505") {
      // Violation de contrainte unique
      res.status(409).json({ error: "Un employé avec cet email existe déjà" })
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

    const { skills, ...employeeData } = value

    await client.query("BEGIN")

    // Mettre à jour l'employé
    const updateEmployeeQuery = `
      UPDATE employees 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, job_id = $5, 
          department_id = $6, category = $7, specialty = $8, hire_date = $9, role = $10
      WHERE id = $11
      RETURNING *
    `

    const employeeValues = [
      employeeData.first_name,
      employeeData.last_name,
      employeeData.email,
      employeeData.phone,
      employeeData.job_id,
      employeeData.department_id,
      employeeData.category,
      employeeData.specialty,
      employeeData.hire_date,
      employeeData.role,
      id,
    ]

    const employeeResult = await client.query(updateEmployeeQuery, employeeValues)

    if (employeeResult.rows.length === 0) {
      await client.query("ROLLBACK")
      return res.status(404).json({ error: "Employé non trouvé" })
    }

    // Supprimer les anciennes compétences
    await client.query("DELETE FROM employee_skills WHERE employee_id = $1", [id])

    // Insérer les nouvelles compétences
    if (skills && skills.length > 0) {
      for (const skill of skills) {
        await client.query("INSERT INTO employee_skills (employee_id, skill_id, level) VALUES ($1, $2, $3)", [
          id,
          skill.skill_id,
          skill.level,
        ])
      }
    }

    await client.query("COMMIT")

    // Récupérer l'employé complet mis à jour
    const completeEmployee = await pool.query(
      `
      SELECT 
        e.*,
        d.name as department_name,
        j.title as job_title,
        j.code as job_code,
        COALESCE(
          json_agg(
            json_build_object(
              'skill_id', s.id,
              'name', s.name,
              'icon', s.icon,
              'level', es.level
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as skills
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN jobs j ON e.job_id = j.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE e.id = $1
      GROUP BY e.id, d.name, j.title, j.code
    `,
      [id],
    )

    res.json(completeEmployee.rows[0])
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Erreur lors de la mise à jour de l'employé:", error)

    if (error.code === "23505") {
      res.status(409).json({ error: "Un employé avec cet email existe déjà" })
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

    const result = await pool.query("DELETE FROM employees WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employé non trouvé" })
    }

    res.json({ message: "Employé supprimé avec succès", employee: result.rows[0] })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error)
    res.status(500).json({ error: "Erreur lors de la suppression de l'employé" })
  }
})

module.exports = router
