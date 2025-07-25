const { pool } = require("../config/database");
const Joi = require("joi");
const path = require("path");
const fs = require("fs");

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
  archived: Joi.boolean().default(false),
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
      (SELECT file_path FROM common_files ORDER BY id DESC LIMIT 1) as common_file,
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
    })),
    common_file: row.common_file ? this.getFileUrl(row.common_file) : null
  }));
};

exports.getJobById = async (id) => {
  const query = `
    SELECT 
      j.*,
      (SELECT file_path FROM common_files ORDER BY id DESC LIMIT 1) as common_file,
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
    })),
    common_file: result.rows[0].common_file ? this.getFileUrl(result.rows[0].common_file) : null
  };

  return job;
};

exports.createJob = async (jobData, required_skills) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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
      jobData.archived || false,
    ];

    const jobResult = await client.query(insertJobQuery, jobValues);
    const newJob = jobResult.rows[0];

    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query(
          "INSERT INTO emploi_competencer (id_emploi, id_competencer, niveaur) VALUES ($1, $2, $3)",
          [newJob.id_emploi, skill.id_competencer, skill.niveaur]
        );
      }
    }

    await client.query("COMMIT");
    return this.getCompleteJob(newJob.id_emploi);
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
      jobData.archived || false,
      id,
    ];

    const jobResult = await client.query(updateJobQuery, jobValues);
    if (jobResult.rows.length === 0) {
      throw new Error("Emploi non trouvé");
    }

    await client.query("DELETE FROM emploi_competencer WHERE id_emploi = $1", [id]);

    if (required_skills && required_skills.length > 0) {
      for (const skill of required_skills) {
        await client.query(
          "INSERT INTO emploi_competencer (id_emploi, id_competencer, niveaur) VALUES ($1, $2, $3)",
          [id, skill.id_competencer, skill.niveaur]
        );
      }
    }

    await client.query("COMMIT");
    return this.getCompleteJob(id);
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
  const job = await this.getJobById(id);
  if (!job) return null;

  // Ajoutez ici d'autres données complémentaires si nécessaire
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

exports.saveCommonFile = async (filePath) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Supprimer l'ancien fichier physique s'il existe
    const oldFile = await client.query("SELECT file_path FROM common_files LIMIT 1");
    if (oldFile.rows[0]?.file_path) {
      try {
        fs.unlinkSync(path.join(__dirname, '../uploads', path.basename(oldFile.rows[0].file_path)));
      } catch (err) {
        console.error("Erreur lors de la suppression de l'ancien fichier:", err);
      }
    }

    // Supprimer l'ancienne entrée en base
    await client.query("DELETE FROM common_files");

    // Insérer le nouveau fichier
    await client.query("INSERT INTO common_files (file_path) VALUES ($1)", [filePath]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.getFileUrl = (filePath) => {
  if (!filePath) return null;
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  return `${baseUrl}${filePath}`;
};

exports.getLatestCommonFile = async () => {
  const result = await pool.query("SELECT file_path FROM common_files ORDER BY id DESC LIMIT 1");
  return result.rows[0]?.file_path ? this.getFileUrl(result.rows[0].file_path) : null;
};