const pool = require("../config/database").pool;

const create = async (evaluationData) => {
  const { registration_id, module_id, apports, reponse, condition, conception, qualite } = evaluationData;
  const query = `
    INSERT INTO evaluations 
    (registration_id, module_id, apports, reponse, condition, conception, qualite)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [registration_id, module_id, apports, reponse, condition, conception, qualite];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getAll = async () => {
  const query = `
    SELECT e.*, cpr.user_id, c.title AS cycle_program_title
    FROM evaluations e
    JOIN cycle_program_registrations cpr ON e.registration_id = cpr.id
    JOIN cycles_programs c ON cpr.cycle_program_id = c.id
    WHERE c.archived = FALSE
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
    SELECT e.*, cpr.user_id, c.title AS cycle_program_title
    FROM evaluations e
    JOIN cycle_program_registrations cpr ON e.registration_id = cpr.id
    JOIN cycles_programs c ON cpr.cycle_program_id = c.id
    WHERE e.id_evaluation = $1 AND c.archived = FALSE
  `;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const update = async (id, evaluationData) => {
  const { apports, reponse, condition, conception, qualite } = evaluationData;
  const query = `
    UPDATE evaluations
    SET 
      apports = $1,
      reponse = $2,
      condition = $3,
      conception = $4,
      qualite = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id_evaluation = $6
    RETURNING *
  `;
  const values = [apports, reponse, condition, conception, qualite, id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const remove = async (id) => {
  const query = `
    DELETE FROM evaluations
    WHERE id_evaluation = $1
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

const getByRegistrationId = async (registrationId) => {
  const query = `
    SELECT e.*, cpr.user_id, c.title AS cycle_program_title
    FROM evaluations e
    JOIN cycle_program_registrations cpr ON e.registration_id = cpr.id
    JOIN cycles_programs c ON cpr.cycle_program_id = c.id
    WHERE e.registration_id = $1 AND c.archived = FALSE
  `;

  try {
    const result = await pool.query(query, [registrationId]);
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
  getByRegistrationId,
};