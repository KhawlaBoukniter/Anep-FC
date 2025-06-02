const express = require("express")
const router = express.Router()
const pool = require("../config/database")

// GET /api/analysis/skills-gap - Analyser les écarts de compétences
router.get("/skills-gap", async (req, res) => {
  try {
    const { skill_id, required_level, gap_filter, specific_gap } = req.query

    if (!skill_id || !required_level) {
      return res.status(400).json({
        error: "Les paramètres skill_id et required_level sont requis",
      })
    }

    let query = `
      SELECT 
        e.id,
        e.first_name,
        e.last_name,
        e.email,
        j.title as job_title,
        j.code as job_code,
        d.name as department_name,
        s.name as skill_name,
        s.icon as skill_icon,
        COALESCE(es.level, 0) as current_level,
        $2::integer as required_level,
        ($2::integer - COALESCE(es.level, 0)) as gap,
        CASE WHEN es.level IS NOT NULL THEN true ELSE false END as has_skill
      FROM employees e
      LEFT JOIN jobs j ON e.job_id = j.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_skills es ON e.id = es.employee_id AND es.skill_id = $1
      LEFT JOIN skills s ON s.id = $1
    `

    const params = [skill_id, required_level]

    // Appliquer les filtres
    if (gap_filter === "true" && specific_gap) {
      query += ` WHERE ($2::integer - COALESCE(es.level, 0)) = $3`
      params.push(specific_gap)
    } else {
      // Par défaut, afficher ceux qui ont besoin de formation
      query += ` WHERE ($2::integer - COALESCE(es.level, 0)) > 0 OR es.level IS NULL`
    }

    query += ` ORDER BY e.last_name, e.first_name`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error("Erreur lors de l'analyse des écarts de compétences:", error)
    res.status(500).json({ error: "Erreur lors de l'analyse des écarts de compétences" })
  }
})

// GET /api/analysis/skills-distribution - Distribution des compétences
router.get("/skills-distribution", async (req, res) => {
  try {
    const query = `
      SELECT 
        s.name as skill_name,
        s.icon,
        COUNT(es.employee_id) as employee_count,
        AVG(es.level) as average_level,
        COUNT(CASE WHEN es.level = 1 THEN 1 END) as level_1_count,
        COUNT(CASE WHEN es.level = 2 THEN 1 END) as level_2_count,
        COUNT(CASE WHEN es.level = 3 THEN 1 END) as level_3_count,
        COUNT(CASE WHEN es.level = 4 THEN 1 END) as level_4_count
      FROM skills s
      LEFT JOIN employee_skills es ON s.id = es.skill_id
      GROUP BY s.id, s.name, s.icon
      ORDER BY employee_count DESC, s.name
    `

    const result = await pool.query(query)
    res.json(result.rows)
  } catch (error) {
    console.error("Erreur lors de l'analyse de la distribution des compétences:", error)
    res.status(500).json({ error: "Erreur lors de l'analyse de la distribution des compétences" })
  }
})

// GET /api/analysis/department-skills - Compétences par département
router.get("/department-skills", async (req, res) => {
  try {
    const query = `
      SELECT 
        d.name as department_name,
        s.name as skill_name,
        s.icon,
        COUNT(es.employee_id) as employee_count,
        AVG(es.level) as average_level
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      LEFT JOIN employee_skills es ON e.id = es.employee_id
      LEFT JOIN skills s ON es.skill_id = s.id
      WHERE s.id IS NOT NULL
      GROUP BY d.id, d.name, s.id, s.name, s.icon
      ORDER BY d.name, employee_count DESC
    `

    const result = await pool.query(query)

    // Regrouper par département
    const departmentSkills = {}
    result.rows.forEach((row) => {
      if (!departmentSkills[row.department_name]) {
        departmentSkills[row.department_name] = []
      }
      departmentSkills[row.department_name].push({
        skill_name: row.skill_name,
        icon: row.icon,
        employee_count: Number.parseInt(row.employee_count),
        average_level: Number.parseFloat(row.average_level),
      })
    })

    res.json(departmentSkills)
  } catch (error) {
    console.error("Erreur lors de l'analyse des compétences par département:", error)
    res.status(500).json({ error: "Erreur lors de l'analyse des compétences par département" })
  }
})

// GET /api/analysis/job-matching - Correspondance emploi-employé
router.get("/job-matching", async (req, res) => {
  try {
    const { job_id } = req.query

    if (!job_id) {
      return res.status(400).json({ error: "Le paramètre job_id est requis" })
    }

    const query = `
      WITH job_requirements AS (
        SELECT 
          jrs.skill_id,
          jrs.required_level,
          s.name as skill_name,
          s.icon
        FROM job_required_skills jrs
        JOIN skills s ON jrs.skill_id = s.id
        WHERE jrs.job_id = $1
      ),
      employee_skills_agg AS (
        SELECT 
          e.id as employee_id,
          e.first_name,
          e.last_name,
          e.email,
          d.name as department_name,
          json_agg(
            json_build_object(
              'skill_id', es.skill_id,
              'level', es.level
            )
          ) as skills
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN employee_skills es ON e.id = es.employee_id
        GROUP BY e.id, e.first_name, e.last_name, e.email, d.name
      )
      SELECT 
        esa.*,
        jr.skill_id,
        jr.skill_name,
        jr.icon,
        jr.required_level,
        COALESCE(
          (SELECT level FROM json_to_recordset(esa.skills) AS x(skill_id int, level int) 
           WHERE x.skill_id = jr.skill_id), 
          0
        ) as current_level,
        (jr.required_level - COALESCE(
          (SELECT level FROM json_to_recordset(esa.skills) AS x(skill_id int, level int) 
           WHERE x.skill_id = jr.skill_id), 
          0
        )) as gap
      FROM employee_skills_agg esa
      CROSS JOIN job_requirements jr
      ORDER BY esa.last_name, esa.first_name, jr.skill_name
    `

    const result = await pool.query(query, [job_id])

    // Regrouper par employé
    const employeeMatching = {}
    result.rows.forEach((row) => {
      const employeeKey = `${row.employee_id}`
      if (!employeeMatching[employeeKey]) {
        employeeMatching[employeeKey] = {
          employee_id: row.employee_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          department_name: row.department_name,
          skill_gaps: [],
          total_gap: 0,
          matching_percentage: 0,
        }
      }

      const gap = Math.max(0, row.gap)
      employeeMatching[employeeKey].skill_gaps.push({
        skill_name: row.skill_name,
        icon: row.icon,
        required_level: row.required_level,
        current_level: row.current_level,
        gap: gap,
      })
      employeeMatching[employeeKey].total_gap += gap
    })

    // Calculer le pourcentage de correspondance
    Object.values(employeeMatching).forEach((employee) => {
      const totalRequiredLevels = employee.skill_gaps.reduce((sum, skill) => sum + skill.required_level, 0)
      const totalCurrentLevels = employee.skill_gaps.reduce(
        (sum, skill) => sum + Math.min(skill.current_level, skill.required_level),
        0,
      )
      employee.matching_percentage =
        totalRequiredLevels > 0 ? Math.round((totalCurrentLevels / totalRequiredLevels) * 100) : 0
    })

    res.json(Object.values(employeeMatching).sort((a, b) => b.matching_percentage - a.matching_percentage))
  } catch (error) {
    console.error("Erreur lors de l'analyse de correspondance emploi-employé:", error)
    res.status(500).json({ error: "Erreur lors de l'analyse de correspondance emploi-employé" })
  }
})

module.exports = router
