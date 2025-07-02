const pool = require("../config/database");
const bcrypt = require("bcrypt");

async function getAllEmployees({ search, role, archived }) {
    const params = [archived !== undefined ? archived : false];
    let query = `
        SELECT 
            e.id_employe,
            e.nom_complet,
            e.email,
            e.role,
            e.telephone1,
            e.telephone2,
            e.categorie,
            e.specialite,
            e.experience_employe,
            e.created_at,
            e.updated_at,
            e.archived,
            e.profile_id,
            e.cin,
            p.id_profile,
            p."NOM PRENOM",
            p."ADRESSE",
            p."DATE NAISS",
            p."DAT_REC",
            p."CIN" AS profile_cin,
            p."DETACHE",
            p."SEXE",
            p."SIT_F_AG",
            p."STATUT",
            p."DAT_POS",
            p."LIBELLE GRADE",
            p."GRADE ASSIMILE",
            p."LIBELLE FONCTION",
            p."DAT_FCT",
            p."LIBELLE LOC",
            p."LIBELLE REGION",
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id_emploi', em.id_emploi,
                    'nom_emploi', em.nom_emploi,
                    'codeemploi', em.codeemploi,
                    'entite', em.entite
                )) FILTER (WHERE em.id_emploi IS NOT NULL),
                '[]'
            ) AS emplois,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id_competencea', ec.id_competencea,
                    'code_competencea', c.code_competencea,
                    'competencea', c.competencea,
                    'niveaua', ec.niveaua
                )) FILTER (WHERE ec.id_competencea IS NOT NULL),
                '[]'
            ) AS competences
        FROM employe e
        LEFT JOIN profile p ON e.profile_id = p.id_profile
        LEFT JOIN emploi_employe ee ON e.id_employe = ee.id_employe
        LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
        LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe
        LEFT JOIN competencesa c ON ec.id_competencea = c.id_competencea
        WHERE e.archived = $1
    `;

    const conditions = [];

    if (search) {
        conditions.push(`(e.nom_complet ILIKE $${params.length + 1} OR e.email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
    }

    if (role && role !== "all") {
        conditions.push(`e.role = $${params.length + 1}`);
        params.push(role);
    }

    if (conditions.length > 0) {
        query += ` AND ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY e.id_employe, p.id_profile ORDER BY e.created_at`;

    try {
        console.log("Executing query:", query, "with params:", params);
        const result = await pool.query(query, params);
        console.log("Query result rows:", result.rows);
        return result.rows.map(row => ({
            id_employe: row.id_employe.toString(),
            nom_complet: row.nom_complet,
            email: row.email,
            role: row.role,
            telephone1: row.telephone1,
            telephone2: row.telephone2,
            categorie: row.categorie,
            specialite: row.specialite,
            experience_employe: row.experience_employe,
            created_at: row.created_at,
            updated_at: row.updated_at,
            archived: row.archived,
            profile_id: row.profile_id,
            cin: row.cin,
            emplois: (row.emplois || []).map(job => ({
                id_emploi: job.id_emploi.toString(),
                nom_emploi: job.nom_emploi,
                codeemploi: job.codeemploi,
                entite: job.entite,
            })),
            competences: (row.competences || []).map(skill => ({
                id_competencea: skill.id_competencea.toString(),
                code_competencea: skill.code_competencea,
                competencea: skill.competencea,
                niveaua: skill.niveaua,
            })),
            profile: row.id_profile ? {
                id_profile: row.id_profile,
                NOM_PRENOM: row["NOM PRENOM"],
                ADRESSE: row["ADRESSE"],
                DATE_NAISS: row["DATE NAISS"],
                DAT_REC: row["DAT_REC"],
                CIN: row["CIN"],
                DETACHE: row["DETACHE"],
                SEXE: row["SEXE"],
                SIT_F_AG: row["SIT_F_AG"],
                STATUT: row["STATUT"],
                DAT_POS: row["DAT_POS"],
                LIBELLE_GRADE: row["LIBELLE GRADE"],
                GRADE_ASSIMILE: row["GRADE ASSIMILE"],
                LIBELLE_FONCTION: row["LIBELLE FONCTION"],
                DAT_FCT: row["DAT_FCT"],
                LIBELLE_LOC: row["LIBELLE LOC"],
                LIBELLE_REGION: row["LIBELLE REGION"],
            } : null,
        }));
    } catch (error) {
        console.error("Database query error:", error.stack);
        throw error;
    }
}

async function getEmployeeById(id) {
    const query = `
        SELECT 
            e.id_employe,
            e.nom_complet,
            e.email,
            e.role,
            e.telephone1,
            e.telephone2,
            e.categorie,
            e.specialite,
            e.experience_employe,
            e.created_at,
            e.updated_at,
            e.archived,
            e.profile_id,
            e.cin,
            p.id_profile,
            p."NOM PRENOM",
            p."ADRESSE",
            p."DATE NAISS",
            p."DAT_REC",
            p."CIN" AS profile_cin,
            p."DETACHE",
            p."SEXE",
            p."SIT_F_AG",
            p."STATUT",
            p."DAT_POS",
            p."LIBELLE GRADE",
            p."GRADE ASSIMILE",
            p."LIBELLE FONCTION",
            p."DAT_FCT",
            p."LIBELLE LOC",
            p."LIBELLE REGION",
            COALESCE(
                json_agg(
                    json_build_object(
                        'id_emploi', em.id_emploi,
                        'nom_emploi', em.nom_emploi,
                        'codeemploi', em.codeemploi,
                        'entite', em.entite
                    )
                ) FILTER (WHERE em.id_emploi IS NOT NULL),
                '[]'
            ) AS emplois,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id_competencea', ec.id_competencea,
                        'code_competencea', c.code_competencea,
                        'competencea', c.competencea,
                        'niveaua', ec.niveaua,
                        'niveau_requis', ecr.niveaur
                    )
                ) FILTER (WHERE ec.id_competencea IS NOT NULL),
                '[]'
            ) AS competences
        FROM employe e
        LEFT JOIN profile p ON e.profile_id = p.id_profile
        LEFT JOIN emploi_employe ee ON e.id_employe = ee.id_employe
        LEFT JOIN emploi em ON ee.id_emploi = em.id_emploi
        LEFT JOIN employe_competencea ec ON e.id_employe = ec.id_employe
        LEFT JOIN competencesa c ON ec.id_competencea = c.id_competencea
        LEFT JOIN emploi_competencer ecr ON c.code_competencea = (
            SELECT cr.code_competencer 
            FROM competencesr cr 
            WHERE cr.id_competencer = ecr.id_competencer
        ) AND ecr.id_emploi = ee.id_emploi
        WHERE e.id_employe = $1
        GROUP BY e.id_employe, p.id_profile
    `;

    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            id: row.id_employe.toString(),
            nom_complet: row.nom_complet,
            email: row.email,
            role: row.role,
            telephone1: row.telephone1,
            telephone2: row.telephone2,
            categorie: row.categorie,
            specialite: row.specialite,
            experience_employe: row.experience_employe,
            created_at: row.created_at,
            updated_at: row.updated_at,
            archived: row.archived,
            profile_id: row.profile_id,
            cin: row.cin,
            emplois: (row.emplois || []).map(job => ({
                id_emploi: job.id_emploi.toString(),
                nom_emploi: job.nom_emploi,
                codeemploi: job.codeemploi,
                entite: job.entite,
            })),
            competences: (row.competences || []).map(skill => ({
                id_competencea: skill.id_competencea ? skill.id_competencea.toString() : null,
                code_competencea: skill.code_competencea,
                competencea: skill.competencea,
                niveaua: skill.niveaua,
                niveau_requis: skill.niveau_requis,
            })).filter(skill => skill.id_competencea !== null),
            profile: row.id_profile ? {
                id_profile: row.id_profile,
                NOM_PRENOM: row["NOM PRENOM"],
                ADRESSE: row["ADRESSE"],
                DATE_NAISS: row["DATE NAISS"],
                DAT_REC: row["DAT_REC"],
                CIN: row["CIN"],
                DETACHE: row["DETACHE"],
                SEXE: row["SEXE"],
                SIT_F_AG: row["SIT_F_AG"],
                STATUT: row["STATUT"],
                DAT_POS: row["DAT_POS"],
                LIBELLE_GRADE: row["LIBELLE GRADE"],
                GRADE_ASSIMILE: row["GRADE ASSIMILE"],
                LIBELLE_FONCTION: row["LIBELLE FONCTION"],
                DAT_FCT: row["DAT_FCT"],
                LIBELLE_LOC: row["LIBELLE LOC"],
                LIBELLE_REGION: row["LIBELLE REGION"],
            } : null,
        };
    } catch (error) {
        console.error("Database query error in getEmployeeById:", error.stack);
        throw error;
    }
}

async function createEmployee(employeeData) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        console.log("Creating employee with data:", employeeData);

        const { profile, emplois, competences, ...employeeFields } = employeeData;

        const insertProfileQuery = `
      INSERT INTO profile (
        "NOM PRENOM", "ADRESSE", "DATE NAISS", "DAT_REC", "CIN", 
        "DETACHE", "SEXE", "SIT_F_AG", "STATUT", "DAT_POS", 
        "LIBELLE GRADE", "GRADE ASSIMILE", "LIBELLE FONCTION", 
        "DAT_FCT", "LIBELLE LOC", "LIBELLE REGION"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id_profile
    `;
        const profileValues = [
            profile["NOM PRENOM"],
            profile.ADRESSE || null,
            profile.DATE_NAISS,
            profile.DAT_REC,
            profile.CIN,
            profile.DETACHE || null,
            profile.SEXE,
            profile.SIT_F_AG || null,
            profile.STATUT || null,
            profile.DAT_POS || null,
            profile.LIBELLE_GRADE || null,
            profile.GRADE_ASSIMILE || null,
            profile.LIBELLE_FONCTION || null,
            profile.DAT_FCT || null,
            profile.LIBELLE_LOC || null,
            profile.LIBELLE_REGION || null,
        ];
        console.log("Profile query values:", profileValues);

        const profileResult = await client.query(insertProfileQuery, profileValues);
        const profileId = profileResult.rows[0].id_profile;

        const insertEmployeeQuery = `
      INSERT INTO employe (
        nom_complet, email, telephone1, telephone2, categorie, 
        specialite, experience_employe, role, archived, profile_id, cin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
        const employeeValues = [
            employeeFields.nom_complet,
            employeeFields.email,
            employeeFields.telephone1 || null,
            employeeFields.telephone2 || null,
            employeeFields.categorie || null,
            employeeFields.specialite || null,
            employeeFields.experience_employe || null,
            employeeFields.role || 'user',
            employeeFields.archived || false,
            profileId,
            employeeFields.cin || null,
        ];
        console.log("Employee query values:", employeeValues);

        const employeeResult = await client.query(insertEmployeeQuery, employeeValues);
        const newEmployee = employeeResult.rows[0];

        if (emplois && emplois.length > 0) {
            for (const job of emplois) {
                console.log("Inserting job:", job);
                await client.query(
                    "INSERT INTO emploi_employe (id_emploi, id_employe) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                    [job.id_emploi, newEmployee.id_employe]
                );
            }
        }

        if (competences && competences.length > 0) {
            for (const skill of competences) {
                console.log("Inserting skill:", skill);
                await client.query(
                    "INSERT INTO employe_competencea (id_employe, id_competencea, niveaua) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
                    [newEmployee.id_employe, skill.id_competencea, skill.niveaua]
                );
            }
        }

        await client.query("COMMIT");
        return await getEmployeeById(newEmployee.id_employe);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Create employee error:", error.stack, "Data:", employeeData);
        throw error;
    } finally {
        client.release();
    }
}

async function updateEmployee(id, employeeData) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const { emplois, competences, profile, ...data } = employeeData;

        const updateEmployeeQuery = `
            UPDATE employe 
            SET nom_complet = $1, email = $2, telephone1 = $3, telephone2 = $4, 
                categorie = $5, specialite = $6, experience_employe = $7, 
                archived = $8, profile_id = $9, cin = $10, updated_at = CURRENT_TIMESTAMP
            WHERE id_employe = $11
            RETURNING *
        `;

        const employeeValues = [
            data.nom_complet || null,
            data.email || null,
            data.telephone1 || null,
            data.telephone2 || null,
            data.categorie || null,
            data.specialite || null,
            data.experience_employe || null,
            data.archived || false,
            data.profile_id || null,
            data.cin || null,
            id,
        ];

        const employeeResult = await client.query(updateEmployeeQuery, employeeValues);

        if (employeeResult.rows.length === 0) {
            throw new Error("NOT_FOUND");
        }

        if (profile) {
            if (data.profile_id) {
                const updateProfileQuery = `
                    UPDATE profile 
                    SET "NOM PRENOM" = $1, "ADRESSE" = $2, "DATE NAISS" = $3, "DAT_REC" = $4, "CIN" = $5, 
                        "DETACHE" = $6, "SEXE" = $7, "SIT_F_AG" = $8, "STATUT" = $9, "DAT_POS" = $10, 
                        "LIBELLE GRADE" = $11, "GRADE ASSIMILE" = $12, "LIBELLE FONCTION" = $13, 
                        "DAT_FCT" = $14, "LIBELLE LOC" = $15, "LIBELLE REGION" = $16
                    WHERE id_profile = $17
                `;
                const profileValues = [
                    profile["NOM PRENOM"] || null,
                    profile.ADRESSE || null,
                    profile.DATE_NAISS || null,
                    profile.DAT_REC || null,
                    profile.CIN || null,
                    profile.DETACHE || null,
                    profile.SEXE || null,
                    profile.SIT_F_AG || null,
                    profile.STATUT || null,
                    profile.DAT_POS || null,
                    profile.LIBELLE_GRADE || null,
                    profile.GRADE_ASSIMILE || null,
                    profile.LIBELLE_FONCTION || null,
                    profile.DAT_FCT || null,
                    profile.LIBELLE_LOC || null,
                    profile.LIBELLE_REGION || null,
                    data.profile_id,
                ];
                await client.query(updateProfileQuery, profileValues);
            } else {
                const checkProfileQuery = `
                    SELECT id_profile FROM profile WHERE id_profile = (SELECT profile_id FROM employe WHERE id_employe = $1)
                `;
                const checkResult = await client.query(checkProfileQuery, [id]);

                if (!checkResult.rows.length) {
                    const insertProfileQuery = `
                        INSERT INTO profile ("NOM PRENOM", "ADRESSE", "DATE NAISS", "DAT_REC", "CIN", "DETACHE", "SEXE", "SIT_F_AG", "STATUT", "DAT_POS", 
                            "LIBELLE GRADE", "GRADE ASSIMILE", "LIBELLE FONCTION", "DAT_FCT", "LIBELLE LOC", "LIBELLE REGION")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                        RETURNING id_profile
                    `;
                    const profileValues = [
                        profile["NOM PRENOM"] || null,
                        profile.ADRESSE || null,
                        profile.DATE_NAISS || null,
                        profile.DAT_REC || null,
                        profile.CIN || null,
                        profile.DETACHE || null,
                        profile.SEXE || null,
                        profile.SIT_F_AG || null,
                        profile.STATUT || null,
                        profile.DAT_POS || null,
                        profile.LIBELLE_GRADE || null,
                        profile.GRADE_ASSIMILE || null,
                        profile.LIBELLE_FONCTION || null,
                        profile.DAT_FCT || null,
                        profile.LIBELLE_LOC || null,
                        profile.LIBELLE_REGION || null,
                    ];
                    const profileResult = await client.query(insertProfileQuery, profileValues);
                    const newProfileId = profileResult.rows[0].id_profile;
                    await client.query("UPDATE employe SET profile_id = $1 WHERE id_employe = $2", [
                        newProfileId,
                        id,
                    ]);
                }
            }
        }

        await client.query("DELETE FROM emploi_employe WHERE id_employe = $1", [id]);
        if (emplois && emplois.length > 0) {
            for (const job of emplois) {
                await client.query("INSERT INTO emploi_employe (id_emploi, id_employe) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
                    job.id_emploi,
                    id,
                ]);
            }
        }

        if (competences && competences.length > 0) {
            const existingSkillsResult = await client.query(
                "SELECT id_competencea, niveaua FROM employe_competencea WHERE id_employe = $1",
                [id]
            );
            const existingSkills = existingSkillsResult.rows;

            for (const skill of competences) {
                const existingSkill = existingSkills.find((s) => s.id_competencea === skill.id_competencea);
                if (!existingSkill) {
                    await client.query(
                        "INSERT INTO employe_competencea (id_employe, id_competencea, niveaua) VALUES ($1, $2, $3) ON CONFLICT (id_employe, id_competencea) DO UPDATE SET niveaua = $3",
                        [id, skill.id_competencea, skill.niveaua]
                    );
                }
            }
        }

        await client.query("COMMIT");

        return await getEmployeeById(id);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Update employee error:", error.stack);
        throw error;
    } finally {
        client.release();
    }
}

async function archiveEmployee(id) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(
            "UPDATE employe SET archived = true, updated_at = CURRENT_TIMESTAMP WHERE id_employe = $1 RETURNING *",
            [id]
        );
        await client.query("COMMIT");
        if (result.rows.length === 0) {
            throw new Error("NOT_FOUND");
        }
        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Archive employee error:", error.stack);
        throw error;
    } finally {
        client.release();
    }
}

async function unarchiveEmployee(id) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(
            "UPDATE employe SET archived = false, updated_at = CURRENT_TIMESTAMP WHERE id_employe = $1 RETURNING *",
            [id]
        );
        await client.query("COMMIT");
        if (result.rows.length === 0) {
            throw new Error("NOT_FOUND");
        }
        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Unarchive employee error:", error.stack);
        throw error;
    } finally {
        client.release();
    }
}

async function deleteEmployee(id) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query("DELETE FROM emploi_employe WHERE id_employe = $1", [id]);
        await client.query("DELETE FROM employe_competencea WHERE id_employe = $1", [id]);
        const result = await client.query("DELETE FROM employe WHERE id_employe = $1 RETURNING *", [id]);

        await client.query("COMMIT");

        if (result.rows.length === 0) {
            throw new Error("NOT_FOUND");
        }
        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Delete employee error:", error.stack);
        throw error;
    } finally {
        client.release();
    }
}

async function checkEmailExists(email) {
    const query = `
        SELECT EXISTS (
            SELECT 1 FROM employe WHERE email = $1 AND archived = false
        ) AS exists,
        (SELECT password IS NOT NULL FROM employe WHERE email = $1 AND archived = false) AS has_password
    `;
    try {
        console.log("Executing query with email:", email);
        const result = await pool.query(query, [email]);
        console.log("Database response:", result.rows[0]);
        return {
            exists: result.rows[0].exists,
            hasPassword: result.rows[0].has_password
        };
    } catch (error) {
        console.error("Database error:", {
            message: error.message,
            stack: error.stack,
            query: query,
            params: [email],
        });
        throw error;
    }
}

async function checkPassword(email, password) {
    const query = `
        SELECT password FROM employe WHERE email = $1 AND archived = false
    `;
    try {
        const result = await pool.query(query, [email]);
        if (result.rows.length === 0) {
            return false;
        }
        const hashedPassword = result.rows[0].password;
        if (!hashedPassword) {
            return false;
        }
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error("Database error in checkPassword:", {
            message: error.message,
            stack: error.stack,
            query: query,
            params: [email],
        });
        throw error;
    }
}

async function savePassword(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
        UPDATE employe 
        SET password = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE email = $2 AND archived = false
        RETURNING id_employe
    `;
    try {
        const result = await pool.query(query, [hashedPassword, email]);
        return result.rows.length > 0;
    } catch (error) {
        console.error("Database error in savePassword:", {
            message: error.message,
            stack: error.stack,
            query: query,
            params: [email],
        });
        throw error;
    }
}

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    archiveEmployee,
    unarchiveEmployee,
    deleteEmployee,
    checkEmailExists,
    checkPassword,
    savePassword,
};