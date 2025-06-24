const { employeeSchema } = require("../validators/employeeValidator");
const employeeModel = require("../models/employeeModel");

async function getEmployees(req, res) {
    try {
        console.log("Get employees request:", req.query);
        const { search, role, archived = false } = req.query;
        const employees = await employeeModel.getAllEmployees({
            search,
            role,
            archived: archived === "true",
        });
        console.log("Employees fetched:", employees);
        res.json(employees);
    } catch (error) {
        console.error("Controller error in getEmployees:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function getEmployee(req, res) {
    try {
        console.log("Get employee request for id:", req.params.id);
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        const employee = await employeeModel.getEmployeeById(id);
        console.log("Employee fetched:", employee);
        if (!employee) return res.status(404).json({ message: "Employé non trouvé." });

        res.json(employee);
    } catch (error) {
        console.error("Controller error in getEmployee:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function createEmployee(req, res) {
    try {
        console.log("Create employee request:", req.body);
        const { error, value } = employeeSchema.validate(req.body, { abortEarly: false });
        if (error) {
            console.log("Validation errors:", error.details.map((e) => e.message));
            return res.status(400).json({ errors: error.details.map((e) => e.message) });
        }

        const newEmployee = await employeeModel.createEmployee(value);
        console.log("Employee created:", newEmployee);
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error("Controller error in createEmployee:", error.stack);
        if (error.code === "23505") {
            return res.status(400).json({ message: "Cet email ou CIN est déjà utilisé." });
        }
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function updateEmployee(req, res) {
    try {
        console.log("Update employee request for id:", req.params.id, "with data:", req.body);
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        const { emplois, competences, profile, ...data } = req.body;
        const filteredData = {
            ...data,
            profile_id: data.profile_id || null,
            cin: data.cin || null,
            emplois: emplois?.map(({ id_emploi }) => ({ id_emploi: Number(id_emploi) })) || [],
        };

        if (profile) {
            const profileFields = {
                "NOM PRENOM": profile["NOM PRENOM"] || null,
                ADRESSE: profile.ADRESSE || null,
                DATE_NAISS: profile.DATE_NAISS || null,
                DAT_REC: profile.DAT_REC || null,
                CIN: profile.CIN || null,
                DETACHE: profile.DETACHE || null,
                SEXE: profile.SEXE || null,
                SIT_F_AG: profile.SIT_F_AG || null,
                STATUT: profile.STATUT || null,
                DAT_POS: profile.DAT_POS || null,
                LIBELLE_GRADE: profile.LIBELLE_GRADE || null,
                GRADE_ASSIMILE: profile.GRADE_ASSIMILE || null,
                LIBELLE_FONCTION: profile.LIBELLE_FONCTION || null,
                DAT_FCT: profile.DAT_FCT || null,
                LIBELLE_LOC: profile.LIBELLE_LOC || null,
                LIBELLE_REGION: profile.LIBELLE_REGION || null,
            };
            filteredData.profile = profileFields;
        }

        const allCompetences = competences || [];
        filteredData.competences = allCompetences;

        const { error, value } = employeeSchema.validate(filteredData, { abortEarly: false });
        if (error) {
            console.log("Validation errors:", error.details.map((e) => e.message));
            return res.status(400).json({ errors: error.details.map((e) => e.message) });
        }

        const updatedEmployee = await employeeModel.updateEmployee(id, value);
        console.log("Employee updated:", updatedEmployee);
        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employé non trouvé." });
        }
        res.json(updatedEmployee);
    } catch (error) {
        console.error("Controller error in updateEmployee:", error.stack);
        if (error.code === "23505") {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function archiveEmployee(req, res) {
    try {
        console.log("Archive employee request for id:", req.params.id);
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        await employeeModel.archiveEmployee(id);
        res.status(204).json({ message: "Employé archivé avec succès." });
    } catch (error) {
        console.error("Controller error in archiveEmployee:", error.stack);
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "Employé non trouvé." });
        }
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function unarchiveEmployee(req, res) {
    try {
        console.log("Unarchive employee request for id:", req.params.id);
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        await employeeModel.unarchiveEmployee(id);
        res.status(204).json({ message: "Employé désarchivé avec succès." });
    } catch (error) {
        console.error("Controller error in unarchiveEmployee:", error.stack);
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "Employé non trouvé." });
        }
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function deleteEmployee(req, res) {
    try {
        console.log("Delete employee request for id:", req.params.id);
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        await employeeModel.deleteEmployee(id);
        res.status(204).json({ message: "Employé supprimé avec succès." });
    } catch (error) {
        console.error("Controller error in deleteEmployee:", error.stack);
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "Employé non trouvé." });
        }
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function checkEmail(req, res) {
    try {
        console.log("Received check email request:", req.query);
        const { email } = req.query;
        if (!email) {
            console.log("Email parameter is missing or empty");
            return res.status(400).json({ message: "Email requis." });
        }
        console.log("Checking existence of email:", email);
        const exists = await employeeModel.checkEmailExists(email);
        console.log("Email existence result:", exists);
        res.json({ exists });
    } catch (error) {
        console.error("Controller error:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

module.exports = {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    archiveEmployee,
    unarchiveEmployee,
    deleteEmployee,
    checkEmail,
};