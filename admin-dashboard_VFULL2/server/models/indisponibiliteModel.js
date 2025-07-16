const pool = require('../config/database').pool;

const create = async (indisponibiliteData) => {
  const { id_employe, type_indisponibilite, date_debut, date_fin, description } = indisponibiliteData;
  const query = `
    INSERT INTO indisponibilite 
    (id_employe, type_indisponibilite, date_debut, date_fin, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [id_employe, type_indisponibilite, date_debut, date_fin, description];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getAll = async () => {
  const query = `
    SELECT i.*, e.nom_complet AS employe_nom
    FROM indisponibilite i
    JOIN employe e ON i.id_employe = e.id_employe
    WHERE i.archived = FALSE
  `;
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

const getById = async (id) => {
  const query = `
    SELECT i.*, e.nom_complet AS employe_nom
    FROM indisponibilite i
    JOIN employe e ON i.id_employe = e.id_employe
    WHERE i.id_indisponibilite = $1 AND i.archived = FALSE
  `;
  
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const update = async (id, indisponibiliteData) => {
  const { type_indisponibilite, date_debut, date_fin, description } = indisponibiliteData;
  const query = `
    UPDATE indisponibilite
    SET 
      type_indisponibilite = $1,
      date_debut = $2,
      date_fin = $3,
      description = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id_indisponibilite = $5
    RETURNING *
  `;
  const values = [type_indisponibilite, date_debut, date_fin, description, id];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const remove = async (id) => {
  const query = `
    UPDATE indisponibilite
    SET archived = TRUE
    WHERE id_indisponibilite = $1
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getByEmployeId = async (employeId) => {
  const query = `
    SELECT i.*, e.nom_complet AS employe_nom
    FROM indisponibilite i
    JOIN employe e ON i.id_employe = e.id_employe
    WHERE i.id_employe = $1 AND i.archived = FALSE
  `;
  
  try {
    const result = await pool.query(query, [employeId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByEmployeId
};