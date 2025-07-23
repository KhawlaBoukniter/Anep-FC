const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const xlsx = require("xlsx");
const db = require("../config/database");

function normalizeDate(dateStr) {
    if (!dateStr) return null;

    let dateString = typeof dateStr === "object" && dateStr instanceof Date
        ? `${dateStr.getFullYear()}-${String(dateStr.getMonth() + 1).padStart(2, '0')}-${String(dateStr.getDate()).padStart(2, '0')}`
        : dateStr.toString().trim();

    const ddMmYyyy = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddMmYyyy) {
        const [, day, month, year] = ddMmYyyy;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const mmDdYyyy = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (mmDdYyyy) {
        const [, month, day, year] = mmDdYyyy;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const yyyyMmDd = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyyMmDd) {
        return dateString;
    }

    return dateString;
}

function isDateOneDayApart(date1, date2) {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

async function importProfiles(req, res) {

    if (!req.file) {
        return res.status(400).json({ message: "Fichier manquant" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const results = [];
    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    const updates = [];

    try {
        if (fileExtension === ".csv") {
            fs.createReadStream(filePath)
                .pipe(parse({ columns: true, delimiter: ";" }))
                .on("data", (data) => {
                    results.push(data);
                })
                .on("error", (err) => {
                    console.error("❌ Erreur lors du parsing CSV :", err);
                    throw err;
                })
                .on("end", () => {
                    processData();
                });
        } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            results.push(...xlsx.utils.sheet_to_json(worksheet, { raw: true, cellDates: false }));
            processData();
        } else {
            return res.status(400).json({ message: "Format de fichier non pris en charge. Utilisez .csv, .xlsx ou .xls" });
        }

        async function processData() {
            for (const row of results) {
                const CIN = row["CIN"]?.trim();
                const nomPrenom = row["NOM PRENOM"]?.trim();
                if (!CIN && !nomPrenom) continue;

                let existing;
                if (CIN) {
                    existing = await db.query(`SELECT * FROM profile WHERE "CIN" = $1`, [CIN]);
                } else {
                    existing = await db.query(`SELECT * FROM profile WHERE "NOM PRENOM" = $1`, [nomPrenom]);
                }
                const current = existing.rows[0];

                const formatted = {
                    "NOM PRENOM": nomPrenom || null,
                    ADRESSE: row["ADRESSE"] || null,
                    "DATE NAISS": normalizeDate(row["DATE NAISS"]),
                    DAT_REC: normalizeDate(row["DAT_REC"]),
                    CIN: CIN || null,
                    DETACHE: row["DETACHE"] || null,
                    SEXE: row["SEXE"] || null,
                    SIT_F_AG: row["SIT_F_AG"] || null,
                    STATUT: row["STATUT"] || null,
                    DAT_POS: normalizeDate(row["DAT_POS"]),
                    "LIBELLE GRADE": row["LIBELLE GRADE"] || null,
                    "GRADE ASSIMILE": row["GRADE ASSIMILE"] || null,
                    "LIBELLE FONCTION": row["LIBELLE FONCTION"] || null,
                    DAT_FCT: normalizeDate(row["DAT_FCT"]),
                    "LIBELLE LOC": row["LIBELLE LOC"] || null,
                    "LIBELLE REGION": row["LIBELLE REGION"] || null,
                };

                if (!current) {
                    await db.query(
                        `INSERT INTO profile (${Object.keys(formatted).map(k => `"${k}"`).join(",")})
                         VALUES (${Object.keys(formatted).map((_, i) => `$${i + 1}`).join(",")})`,
                        Object.values(formatted)
                    );
                    await db.query(
                        `INSERT INTO import_history (identifier, action, previous_data, new_data)
                        VALUES ($1, 'insert', NULL, $2)`,
                        [CIN || nomPrenom, JSON.stringify(formatted)]
                    );
                    inserted++;
                } else {
                    let hasChanged = false;
                    const before = { ...current };

                    for (const key in before) {
                        if (before.hasOwnProperty(key) && key.match(/DATE|DAT/) && before[key]) {
                            before[key] = normalizeDate(before[key]);
                        }
                    }

                    const after = { ...formatted };
                    const changedFields = [];
                    for (const key of Object.keys(formatted)) {
                        const beforeValue = (before[key] || "").toString().trim();
                        const afterValue = (after[key] || "").toString().trim();
                        if (beforeValue !== afterValue && beforeValue !== "" && afterValue !== "") {
                            if (key.match(/DATE|DAT/) && isDateOneDayApart(beforeValue, afterValue)) {
                                continue;
                            }
                            hasChanged = true;
                            changedFields.push({ field: key, before: beforeValue, after: afterValue });
                        }
                    }

                    if (hasChanged) {
                        await db.query(
                            `UPDATE profile SET ${Object.keys(formatted).map((k, i) => `"${k}" = $${i + 1}`).join(", ")} 
                             WHERE "CIN" = $${Object.keys(formatted).length + 1} OR "NOM PRENOM" = $${Object.keys(formatted).length + 2}`,
                            [...Object.values(formatted), CIN || null, nomPrenom || null]
                        );
                        await db.query(
                            `INSERT INTO import_history (identifier, action, previous_data, new_data)
                            VALUES ($1, 'update', $2, $3)`,
                            [CIN || nomPrenom, JSON.stringify(before), JSON.stringify(formatted)]
                        );
                        updates.push({ identifier: CIN || nomPrenom, before, after, changedFields });
                        updated++;
                    } else {
                        unchanged++;
                    }
                }
            }

            fs.unlinkSync(filePath);
            res.status(200).json({ inserted, updated, unchanged, updates });
        }
    } catch (err) {
        console.error("❌ Erreur pendant l'importation :", err);
        res.status(500).json({ message: "Erreur pendant l'importation", error: err.message });
    }
}

async function undoLastImport(req, res) {
    try {
        const { rows } = await db.query(
            `SELECT * FROM import_history ORDER BY imported_at DESC LIMIT 100`
        );

        for (const record of rows) {
            if (record.action === "insert") {
                await db.query(`DELETE FROM profile WHERE "CIN" = $1 OR "NOM PRENOM" = $1`, [record.identifier]);
            } else if (record.action === "update") {
                const previous = record.previous_data;
                await db.query(
                    `UPDATE profile SET ${Object.keys(previous).map((k, i) => `"${k}" = $${i + 1}`).join(", ")} 
           WHERE "CIN" = $${Object.keys(previous).length + 1} OR "NOM PRENOM" = $${Object.keys(previous).length + 2}`,
                    [...Object.values(previous), record.identifier, record.identifier]
                );
            }
        }

        await db.query(`DELETE FROM import_history`);
        res.status(200).json({ message: "Dernier import annulé avec succès." });
    } catch (err) {
        console.error("❌ Erreur lors de l'annulation :", err);
        res.status(500).json({ message: "Erreur lors de l'annulation", error: err.message });
    }
}


module.exports = { importProfiles, undoLastImport };