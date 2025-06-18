const db = require('../config/database');

async function syncProfilesWithEmployees() {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Mettre à jour les employés existants avec les profils correspondants
    const updateQuery = `
            UPDATE employe e
            SET 
                profile_id = COALESCE(e.profile_id, p.id_profile),
                cin = COALESCE(e.cin, p."CIN")
            FROM profile p
            WHERE 
                (
                    LOWER(TRIM(e.nom_complet)) = LOWER(TRIM(p."NOM PRENOM"))
                    OR LOWER(TRIM(REGEXP_REPLACE(e.nom_complet, '(\\w+)\\s+(\\w+)', '\\2 \\1'))) = LOWER(TRIM(p."NOM PRENOM"))
                    OR LOWER(TRIM(REGEXP_REPLACE(p."NOM PRENOM", '(\\w+)\\s+(\\w+)', '\\2 \\1'))) = LOWER(TRIM(e.nom_complet))
                )
                AND (e.profile_id IS NULL OR e.cin IS NULL)
        `;
    const updateResult = await client.query(updateQuery);

    // 2. Insérer les nouveaux employés à partir des profils non associés
    const insertQuery = `
            INSERT INTO employe (nom_complet, profile_id, cin)
            SELECT p."NOM PRENOM", p.id_profile, p."CIN"
            FROM profile p
            WHERE NOT EXISTS (
                SELECT 1 FROM employe e
                WHERE 
                    LOWER(TRIM(e.nom_complet)) = LOWER(TRIM(p."NOM PRENOM"))
                    OR LOWER(TRIM(REGEXP_REPLACE(e.nom_complet, '(\\w+)\\s+(\\w+)', '\\2 \\1'))) = LOWER(TRIM(p."NOM PRENOM"))
                    OR LOWER(TRIM(REGEXP_REPLACE(p."NOM PRENOM", '(\\w+)\\s+(\\w+)', '\\2 \\1'))) = LOWER(TRIM(e.nom_complet))
            )
        `;
    const insertResult = await client.query(insertQuery);

    await client.query('COMMIT');

    return {
      updated: updateResult.rowCount,
      inserted: insertResult.rowCount,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { syncProfilesWithEmployees };