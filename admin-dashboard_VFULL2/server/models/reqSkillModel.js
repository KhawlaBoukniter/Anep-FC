const pool = require("../config/database");


async function archiveSkill(id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get the code_competencer before archiving
        const skillR = await client.query(
            "SELECT code_competencer FROM competencesr WHERE id_competencer = $1",
            [id]
        );

        if (skillR.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        // Archive in competencesr
        const resultR = await client.query(
            "UPDATE competencesr SET archived = TRUE WHERE id_competencer = $1 RETURNING *",
            [id]
        );

        // Archive in competencesa where code matches
        await client.query(
            "UPDATE competencesa SET archived = TRUE WHERE code_competencea = $1",
            [skillR.rows[0].code_competencer]
        );

        await client.query('COMMIT');

        return {
            ...resultR.rows[0],
            id: resultR.rows[0].id_competencer.toString(),
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function unarchiveSkill(id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get the code_competencer before unarchiving
        const skillR = await client.query(
            "SELECT code_competencer FROM competencesr WHERE id_competencer = $1",
            [id]
        );

        if (skillR.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        // Unarchive in competencesr
        const resultR = await client.query(
            "UPDATE competencesr SET archived = FALSE WHERE id_competencer = $1 RETURNING *",
            [id]
        );

        // Unarchive in competencesa where code matches
        await client.query(
            "UPDATE competencesa SET archived = FALSE WHERE code_competencea = $1",
            [skillR.rows[0].code_competencer]
        );

        await client.query('COMMIT');

        return {
            ...resultR.rows[0],
            id: resultR.rows[0].id_competencer.toString(),
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}


async function getLatestCode() {
    const result = await pool.query(
        "SELECT code_competencer FROM competencesr ORDER BY created_at DESC LIMIT 1"
    );
    return result.rows.length === 0 ? "C000" : result.rows[0].code_competencer;
}

async function getAllSkills({ search, archived = false }) {
    let query = "SELECT * FROM competencesr WHERE archived = $1";
    const conditions = [];
    const params = [archived];

    if (search) {
        conditions.push(`competencer ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
        query += ` AND ${conditions.join(" AND ")}`;
    }

    const result = await pool.query(query, params);
    return result.rows.map(row => ({
        ...row,
        id: row.id_competencer.toString(),
    }));
}

async function getSkillById(id) {
    const result = await pool.query("SELECT * FROM competencesr WHERE id_competencer = $1", [id]);
    if (result.rows.length === 0) return null;

    return {
        ...result.rows[0],
        id: result.rows[0].id_competencer.toString(),
    };
}

async function createSkill(skillData) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { code_competencer, competencer } = skillData;

        // Insert into competencesr
        const resultR = await client.query(
            "INSERT INTO competencesr (code_competencer, competencer) VALUES ($1, $2) RETURNING *",
            [code_competencer, competencer]
        );

        // Insert into competencesa with matching data
        await client.query(
            "INSERT INTO competencesa (code_competencea, competencea) VALUES ($1, $2)",
            [code_competencer, competencer]
        );

        await client.query('COMMIT');

        return {
            ...resultR.rows[0],
            id: resultR.rows[0].id_competencer.toString(),
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function updateSkill(id, skillData) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { code_competencer, competencer } = skillData;

        // Update competencesr
        const resultR = await client.query(
            "UPDATE competencesr SET code_competencer = $1, competencer = $2 WHERE id_competencer = $3 RETURNING *",
            [code_competencer, competencer, id]
        );

        if (resultR.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        // Find corresponding competencesa record by code_competencer
        const resultA = await client.query(
            "SELECT id_competencea FROM competencesa WHERE code_competencea = $1",
            [resultR.rows[0].code_competencer]
        );

        if (resultA.rows.length > 0) {
            // Update competencesa
            await client.query(
                "UPDATE competencesa SET code_competencea = $1, competencea = $2 WHERE id_competencea = $3",
                [code_competencer, competencer, resultA.rows[0].id_competencea]
            );
        }

        await client.query('COMMIT');

        return {
            ...resultR.rows[0],
            id: resultR.rows[0].id_competencer.toString(),
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function deleteSkill(id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get the code_competencer before deleting
        const skillR = await client.query(
            "SELECT code_competencer FROM competencesr WHERE id_competencer = $1",
            [id]
        );

        if (skillR.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        // Delete from competencesr
        const resultR = await client.query(
            "DELETE FROM competencesr WHERE id_competencer = $1 RETURNING *",
            [id]
        );

        // Delete from competencesa where code matches
        await client.query(
            "DELETE FROM competencesa WHERE code_competencea = $1",
            [skillR.rows[0].code_competencer]
        );

        await client.query('COMMIT');

        return { id: resultR.rows[0].id_competencer.toString() };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getLatestCode,
    getAllSkills,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill,
    archiveSkill,
    unarchiveSkill,
};