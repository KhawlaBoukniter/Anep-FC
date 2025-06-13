const pool = require("../config/database")

async function getLatestCode() {
    const result = await pool.query(
        "SELECT code_competencer FROM competencesr ORDER BY created_at ASC LIMIT 1"
    )
    return result.rows.length === 0 ? "C000" : result.rows[0].code_competencer
}

async function getAllSkills({ search }) {
    let query = "SELECT * FROM competencesr"
    const conditions = []
    const params = []

    if (search) {
        conditions.push(`competencer ILIKE $${params.length + 1}`)
        params.push(`%${search}%`)
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
    }

    const result = await pool.query(query, params)
    return result.rows.map(row => ({
        ...row,
        id: row.id_competencer.toString(),
    }))
}

async function getSkillById(id) {
    const result = await pool.query("SELECT * FROM competencesr WHERE id_competencer = $1", [id])
    if (result.rows.length === 0) return null

    return {
        ...result.rows[0],
        id: result.rows[0].id_competencer.toString(),
    }
}

async function createSkill(skillData) {
    const { code_competencer, competencer } = skillData
    const result = await pool.query(
        "INSERT INTO competencesr (code_competencer, competencer) VALUES ($1, $2) RETURNING *",
        [code_competencer, competencer]
    )
    return {
        ...result.rows[0],
        id: result.rows[0].id_competencer.toString(),
    }
}

async function updateSkill(id, skillData) {
    const { code_competencer, competencer } = skillData
    const result = await pool.query(
        "UPDATE competencesr SET code_competencer = $1, competencer = $2 WHERE id_competencer = $3 RETURNING *",
        [code_competencer, competencer, id]
    )
    if (result.rows.length === 0) return null

    return {
        ...result.rows[0],
        id: result.rows[0].id_competencer.toString(),
    }
}

async function deleteSkill(id) {
    const result = await pool.query("DELETE FROM competencesr WHERE id_competencer = $1 RETURNING *", [id])
    if (result.rows.length === 0) return null
    return { id: result.rows[0].id_competencer.toString() }
}

module.exports = {
    getLatestCode,
    getAllSkills,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill
}