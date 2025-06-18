const pool = require("../config/database")

async function getSkillsGap({ id_competencea, niveaua, gap_filter, specific_gap }) {
  let query = `
    SELECT 
      e.id_employe as id,
      e.nom_complet,
      e.email,
      em.nom_emploi as job_title,
      em.codeemploi as job_code,
      c.competencea as skill_name,
      COALESCE(ec.niveaua, 0) as current_level,
      $2::integer as required_level,
      ($2::integer - COALESCE(ec.niveaua, 0)) as gap,
      CASE WHEN ec.niveaua IS NOT NULL THEN true ELSE false END as has_skill
    FROM employe e
    LEFT JOIN emploi_employe ee ON e.id_employe = ee.id_employe
    LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
    LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe AND ec.id_competencea = $1
    LEFT JOIN competencesa c ON ec.id_competencea = c.id_competencea
  `

  const params = [id_competencea, niveaua]

  if (gap_filter === "yes" && specific_gap) {
    query += ` WHERE ($2::integer - COALESCE(ec.niveaua, 0)) = $3`
    params.push(specific_gap)
  } else {
    query += ` WHERE ($2::integer - COALESCE(ec.niveaua, 0)) > 0 OR ec.niveaua IS NULL`
  }

  query += ` ORDER BY e.nom_complet`

  const result = await pool.query(query, params)
  return result.rows.map(row => ({
    ...row,
    id: row.id.toString(),
  }))
}

async function getSkillsDistribution() {
  const query = `
    SELECT 
      c.competencea as skill_name,
      COUNT(ec.id_employe) as employee_count,
      AVG(ec.niveaua) as average_level,
      COUNT(CASE WHEN ec.niveaua = 1 THEN 1 END) as level_1_count,
      COUNT(CASE WHEN ec.niveaua = 2 THEN 1 END) as level_2_count,
      COUNT(CASE WHEN ec.niveaua = 3 THEN 1 END) as level_3_count,
      COUNT(CASE WHEN ec.niveaua = 4 THEN 1 END) as level_4_count
    FROM competencesa c
    LEFT JOIN employe_competencea ec ON c.id_competencea = ec.id_competencea
    GROUP BY c.id_competencea, c.competencea
    ORDER BY employee_count DESC, c.competencea
  `

  const result = await pool.query(query)
  return result.rows
}

async function getJobMatch(id_emploi) {
  const query = `
    WITH job_requirements AS (
      SELECT 
        ecr.id_competencer,
        ecr.niveaur as required_level,
        cr.competencer as skill_name
      FROM emploi_competencer ecr
      JOIN competencesR cr ON ecr.id_competencer = cr.id_competencer
      WHERE ecr.id_emploi = $1
    ),
    employee_skills_agg AS (
      SELECT 
        e.id_employe as employee_id,
        e.nom_complet,
        e.email,
        json_agg(
          json_build_object(
            'id_competencea', ec.id_competencea,
            'niveaua', ec.niveaua
          )
        ) as competences
      FROM employe e
      LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe
      GROUP BY e.id_employe, e.nom_complet, e.email
    )
    SELECT 
      esa.*,
      jr.id_competencer,
      jr.skill_name,
      jr.required_level,
      COALESCE(
        (SELECT niveaua FROM json_to_recordset(esa.competences) AS x(id_competencea int, niveaua int) 
         WHERE x.id_competencea = jr.id_competencer), 
        0
      ) as current_level,
      (jr.required_level - COALESCE(
        (SELECT niveaua FROM json_to_recordset(esa.competences) AS x(id_competencea int, niveaua int) 
         WHERE x.id_competencea = jr.id_competencer), 
        0
      )) as gap
    FROM employee_skills_agg esa
    CROSS JOIN job_requirements jr
    ORDER BY esa.nom_complet, jr.skill_name
  `

  const result = await pool.query(query, [id_emploi])

  const employeeMatching = {}
  result.rows.forEach((row) => {
    const employeeKey = `${row.employee_id}`
    if (!employeeMatching[employeeKey]) {
      employeeMatching[employeeKey] = {
        employee_id: row.employee_id.toString(),
        nom_complet: row.nom_complet,
        email: row.email,
        skill_gaps: [],
        total_gap: 0,
        matching_percentage: 0,
      }
    }

    const gap = Math.max(0, row.gap)
    employeeMatching[employeeKey].skill_gaps.push({
      skill_name: row.skill_name,
      required_level: row.required_level,
      current_level: row.current_level,
      gap: gap,
    })
    employeeMatching[employeeKey].total_gap += gap
  })

  Object.values(employeeMatching).forEach((employee) => {
    const totalRequiredLevels = employee.skill_gaps.reduce((sum, skill) => sum + skill.required_level, 0)
    const totalCurrentLevels = employee.skill_gaps.reduce(
      (sum, skill) => sum + Math.min(skill.current_level, skill.required_level),
      0,
    )
    employee.matching_percentage =
      totalRequiredLevels > 0 ? Math.round((totalCurrentLevels / totalRequiredLevels) * 100) : 0
  })

  return Object.values(employeeMatching).sort((a, b) => b.matching_percentage - a.matching_percentage)
}

async function getSkillsAnalysis() {
  const employeesQuery = `
    SELECT 
      e.id_employe as id,
      e.nom_complet,
      e.email,
      e.telephone1 as telephone,
      e.categorie,
      e.specialite,
      e.role,
      em.nom_emploi as poste,
      em.entite as departement,
      json_agg(
        json_build_object(
          'name', ca.competencea,
          'level', ec.niveaua
        )
      ) FILTER (WHERE ec.id_competencea IS NOT NULL) as skills
    FROM employe e
    LEFT JOIN emploi_employe ee ON e.id_employe = ee.id_employe
    LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
    LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe
    LEFT JOIN competencesa ca ON ec.id_competencea = ca.id_competencea
    GROUP BY e.id_employe, em.nom_emploi, em.entite
    ORDER BY e.nom_complet
  `
  const employeesResult = await pool.query(employeesQuery)
  const employees = employeesResult.rows.map(row => ({
    ...row,
    id: row.id.toString(),
    skills: row.skills || [],
  }))

  const skillsQuery = `
    SELECT 
      id_competencea as id,
      competencea as name
    FROM competencesa
    ORDER BY competencea
  `
  const skillsResult = await pool.query(skillsQuery)
  const availableSkills = skillsResult.rows

  const jobRequirementsQuery = `
    SELECT 
      em.nom_emploi as poste,
      json_agg(
        json_build_object(
          'name', cr.competencer,
          'requiredLevel', ecr.niveaur
        )
      ) as requirements
    FROM emploi em
    LEFT JOIN emploi_competencer ecr ON em.id_emploi = ecr.id_emploi
    LEFT JOIN competencesR cr ON ecr.id_competencer = cr.id_competencer
    GROUP BY em.nom_emploi
  `
  const jobRequirementsResult = await pool.query(jobRequirementsQuery)
  const jobRequirements = jobRequirementsResult.rows.reduce((acc, row) => {
    acc[row.poste] = row.requirements.filter(req => req.name)
    return acc
  }, {})

  return { employees, availableSkills, jobRequirements }
}

module.exports = {
  getSkillsGap,
  getSkillsDistribution,
  getJobMatch,
  getSkillsAnalysis
}