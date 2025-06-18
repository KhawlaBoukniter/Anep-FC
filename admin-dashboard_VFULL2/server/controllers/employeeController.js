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
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function updateEmployee(req, res) {
    try {
        console.log("Update employee request for id:", req.params.id, "with data:", req.body);
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        const { emplois, competences, profile_id, cin, ...data } = req.body;
        const filteredData = {
            ...data,
            profile_id: profile_id || null,
            cin: cin || null,
            emplois: emplois?.map(({ id_emploi }) => ({ id_emploi: Number(id_emploi) })),
            competences: competences?.map(({ id_competencea, niveaua }) => ({
                id_competencea: Number(id_competencea),
                niveaua: Number(niveaua),
            })),
        };

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
        console.log("Check email request:", req.query);
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email requis." });
        }

        const exists = await employeeModel.checkEmailExists(email);
        console.log("Email exists:", exists);
        res.json({ exists });
    } catch (error) {
        console.error("Controller error in checkEmail:", error.stack);
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