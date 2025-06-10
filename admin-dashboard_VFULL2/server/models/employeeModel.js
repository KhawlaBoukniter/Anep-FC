const pool = require("../config/database")

async function getAllEmployees({ search, role }) {
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
        conditions.push(`(e.nom_complet ILIKE $${params.length + 1} OR e.email ILIKE $${params.length + 1})`)
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
    return result.rows.map(row => ({
        ...row,
        id: row.id_employe.toString(),
        emplois: (row.emplois || []).map(job => ({
            ...job,
            id_emploi: job.id_emploi.toString(),
        })),
        competences: (row.competences || []).map(skill => ({
            ...skill,
            id_competencea: skill.id_competencea.toString(),
        })),
    }))
}

async function getEmployeeById(id) {
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
    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
        ...row,
        id: row.id_employe.toString(),
        emplois: (row.emplois || []).map(job => ({
            ...job,
            id_emploi: job.id_emploi.toString(),
        })),
        competences: (row.competences || []).map(skill => ({
            ...skill,
            id_competencea: skill.id_competencea.toString(),
        })),
    }
}

async function createEmployee(employeeData) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        const { emplois, competences, ...data } = employeeData

        const insertEmployeeQuery = `
      INSERT INTO employe (nom_complet, email, adresse, telephone1, telephone2, categorie, specialite, experience_employe, role, date_naissance, date_recrutement, cin)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `
        const employeeValues = [
            data.nom_complet,
            data.email,
            data.adresse,
            data.telephone1,
            data.telephone2,
            data.categorie,
            data.specialite,
            data.experience_employe,
            data.role,
            data.date_naissance,
            data.date_recrutement,
            data.cin,
        ]

        const employeeResult = await client.query(insertEmployeeQuery, employeeValues)
        const newEmployee = employeeResult.rows[0]

        if (emplois && emplois.length > 0) {
            for (const job of emplois) {
                await client.query("INSERT INTO emploi_employe (id_emploi, id_employe) VALUES ($1, $2)", [job.id_emploi, newEmployee.id_employe])
            }
        }

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
        return await getEmployeeById(newEmployee.id_employe)
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

async function updateEmployee(id, employeeData) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        const { emplois, competences, ...data } = employeeData

        const updateEmployeeQuery = `
      UPDATE employe 
      SET nom_complet = $1, email = $2, adresse = $3, telephone1 = $4, telephone2 = $5, 
          categorie = $6, specialite = $7, experience_employe = $8, role = $9, 
          date_naissance = $10, date_recrutement = $11, cin = $12
      WHERE id_employe = $13
      RETURNING *
    `

        const employeeValues = [
            data.nom_complet,
            data.email,
            data.adresse,
            data.telephone1,
            data.telephone2,
            data.categorie,
            data.specialite,
            data.experience_employe,
            data.role,
            data.date_naissance,
            data.date_recrutement,
            data.cin,
            id,
        ]

        const employeeResult = await client.query(updateEmployeeQuery, employeeValues)

        if (employeeResult.rows.length === 0) {
            throw new Error("NOT_FOUND")
        }

        await client.query("DELETE FROM emploi_employe WHERE id_employe = $1", [id])
        if (emplois && emplois.length > 0) {
            for (const job of emplois) {
                await client.query("INSERT INTO emploi_employe (id_emploi, id_employe) VALUES ($1, $2)", [job.id_emploi, id])
            }
        }

        await client.query("DELETE FROM employe_competencea WHERE id_employe = $1", [id])
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

        return await getEmployeeById(id)
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

async function deleteEmployee(id) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        await client.query("DELETE FROM emploi_employe WHERE id_employe = $1", [id])
        await client.query("DELETE FROM employe_competencea WHERE id_employe = $1", [id])
        const result = await client.query("DELETE FROM employe WHERE id_employe = $1 RETURNING *", [id])

        await client.query("COMMIT")

        if (result.rows.length === 0) {
            throw new Error("NOT_FOUND")
        }
        return true
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

async function checkEmailExists(email) {
    const query = `
    SELECT EXISTS (
      SELECT 1 FROM employe WHERE email = $1
    ) AS exists
  `;
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
}

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    checkEmailExists,
};
