const { pool } = require("../config/database");
const Joi = require("joi");

// Schéma de validation pour un emploi
exports.jobSchema = Joi.object({
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
  archived: Joi.boolean().default(false), // Ajout du champ archived
});

exports.updateEmploiWeights = async () => {
  const updateQuery = `
    UPDATE emploi j
    SET poidsemploi = sub.nb_employes
    FROM (
      SELECT id_emploi, COUNT(*) AS nb_employes
      FROM emploi_employe
      GROUP BY id_emploi
    ) AS sub
    WHERE j.id_emploi = sub.id_emploi
  `;

  try {
    await pool.query(updateQuery);
    console.log("Mise à jour des poids des emplois réussie.");
  } catch (error) {
    console.error("Erreur lors de la mise à jour des poids des emplois :", error);
    throw error;
  }
};

exports.getAllJobs = async (search, archived = false) => {
  await this.updateEmploiWeights();

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
  `;

  const conditions = [];
  const params = [];

  // Filtrer par archived
  conditions.push(`j.archived = $${params.length + 1}`);
  params.push(archived);

  if (search) {
    conditions.push(
      `(j.nom_emploi ILIKE $${params.length + 1} OR j.codeemploi ILIKE $${params.length + 1} OR j.entite ILIKE $${params.length + 1})`
    );
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` GROUP BY j.id_emploi ORDER BY CAST(SUBSTRING(j.codeemploi FROM '\\d+') AS INTEGER)`;

  const result = await pool.query(query, params);
  return result.rows.map(row => ({
    ...row,
    id_emploi: row.id_emploi.toString(),
    required_skills: row.required_skills.map(skill => ({
      ...skill,
      id_competencer: skill.id_competencer.toString()
    }))
  }));
};

exports.getJobById = async (id) => {
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
  `;

  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;

  const job = {
    ...result.rows[0],
    id_emploi: result.rows[0].id_emploi.toString(),
    required_skills: result.rows[0].required_skills.map(skill => ({
      ...skill,
      id_competencer: skill.id_competencer.toString()
    }))
  };

  return job;
};

exports.createJob = async (jobData, required_skills) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insérer l'emploi
    const insertJobQuery = `
      INSERT INTO emploi (nom_emploi, entite, formation, experience, codeemploi, poidsemploi, archived)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const jobValues = [
      jobData.nom_emploi,
      jobData.entite,
      jobData.formation,
      jobData.experience,
      jobData.codeemploi,
      jobData.poidsemploi,
      jobData.archived || false, // Ajout du champ archived
    ];

    const jobResult = await client.query(insertJobQuery, jobValues);
    const newJob = jobResult.rows[0];

    // Insérer les compétences requises si elles existent
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query(
          "INSERT INTO emploi_competencer (id_emploi, id_competencer, niveaur) VALUES ($1, $2, $3)",
          [newJob.id_emploi, skill.id_competencer, skill.niveaur]
        );
      }
    }

    await client.query("COMMIT");
    return newJob;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.updateJob = async (id, jobData, required_skills) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Mettre à jour l'emploi
    const updateJobQuery = `
      UPDATE emploi 
      SET nom_emploi = $1, entite = $2, formation = $3, experience = $4, 
          codeemploi = $5, poidsemploi = $6, archived = $7
      WHERE id_emploi = $8
      RETURNING *
    `;

    const jobValues = [
      jobData.nom_emploi,
      jobData.entite,
      jobData.formation,
      jobData.experience,
      jobData.codeemploi,
      jobData.poidsemploi,
      jobData.archived || false, // Ajout du champ archived
      id,
    ];

    const jobResult = await client.query(updateJobQuery, jobValues);
    if (jobResult.rows.length === 0) {
      throw new Error("Emploi non trouvé");
    }

    // Supprimer les anciennes compétences requises
    await client.query("DELETE FROM emploi_competencer WHERE id_emploi = $1", [id]);

    // Insérer les nouvelles compétences requises
    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query(
          "INSERT INTO emploi_competencer (id_emploi, id_competencer, niveaur) VALUES ($1, $2, $3)",
          [id, skill.id_competencer, skill.niveaur]
        );
      }
    }

    await client.query("COMMIT");
    return jobResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.deleteJob = async (id) => {
  const result = await pool.query("DELETE FROM emploi WHERE id_emploi = $1 RETURNING *", [id]);
  return result.rows[0];
};

exports.getCompleteJob = async (id) => {
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
  `;

  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;

  const job = {
    ...result.rows[0],
    id_emploi: result.rows[0].id_emploi.toString(),
    required_skills: result.rows[0].required_skills.map(skill => ({
      ...skill,
      id_competencer: skill.id_competencer.toString()
    }))
  };

  return job;
};

exports.archiveJob = async (id) => {
  try {
    const query = "UPDATE emploi SET archived = TRUE WHERE id_emploi = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) {
      throw new Error("Emploi non trouvé");
    }
    return {
      ...result.rows[0],
      id_emploi: result.rows[0].id_emploi.toString(),
    };
  } catch (error) {
    throw error;
  }
};

exports.unarchiveJob = async (id) => {
  try {
    const query = "UPDATE emploi SET archived = FALSE WHERE id_emploi = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) {
      throw new Error("Emploi non trouvé");
    }
    return {
      ...result.rows[0],
      id_emploi: result.rows[0].id_emploi.toString(),
    };
  } catch (error) {
    throw error;
  }
};