const pool = require("../config/database")

async function getAllSkills({ search }) {
    let query = "SELECT * FROM competencesa"
    const conditions = []
    const params = []

    if (search) {
        conditions.push(`competencea ILIKE $${params.length + 1}`)
        params.push(`%${search}%`)
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
    }

    const result = await pool.query(query, params)
    return result.rows.map(row => ({
        ...row,
        id: row.id_competencea.toString(),
    }))
}

async function getSkillById(id) {
    const result = await pool.query("SELECT * FROM competencesa WHERE id_competencea = $1", [id])
    if (result.rows.length === 0) return null

    return {
        ...result.rows[0],
        id: result.rows[0].id_competencea.toString(),
    }
}

async function createSkill(skillData) {
    const { code_competencea, competencea } = skillData
    const result = await pool.query(
        "INSERT INTO competencesa (code_competencea, competencea) VALUES ($1, $2) RETURNING *",
        [code_competencea, competencea]
    )
    return {
        ...result.rows[0],
        id: result.rows[0].id_competencea.toString(),
    }
}

async function updateSkill(id, skillData) {
    const { code_competencea, competencea } = skillData
    const result = await pool.query(
        "UPDATE competencesa SET code_competencea = $1, competencea = $2 WHERE id_competencea = $3 RETURNING *",
        [code_competencea, competencea, id]
    )
    if (result.rows.length === 0) return null

    return {
        ...result.rows[0],
        id: result.rows[0].id_competencea.toString(),
    }
}

async function deleteSkill(id) {
    const result = await pool.query("DELETE FROM competencesa WHERE id_competencea = $1 RETURNING *", [id])
    if (result.rows.length === 0) return null
    return { id: result.rows[0].id_competencea.toString() }
}

module.exports = {
    getAllSkills,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill
}