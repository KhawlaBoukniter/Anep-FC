const { employeeSchema } = require("../validators/employeeValidator");
const employeeModel = require("../models/employeeModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

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

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token requis." });

        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("Decoded token:", decoded);
        const user = await employeeModel.getEmployeeById(decoded.id);
        console.log("Authenticated user:", user);

        // if (decoded.id !== id && decoded.role !== "admin") {
        //     return res.status(403).json({ message: "Accès non autorisé." });
        // }

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
    console.log("🔥🔥🔥 API CALL: updateEmployee REACHED");
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
            console.log(profile);

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
        const { exists, hasPassword } = await employeeModel.checkEmailExists(email);
        console.log("Email check result:", { exists, hasPassword });
        res.json({ exists, hasPassword });
    } catch (error) {
        console.error("Controller error in checkEmail:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function login(req, res) {
    try {
        console.log("Received login request:", req.body);
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }
        const user = await employeeModel.checkPassword(email, password);
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        console.log("Login successful, token generated for:", email);

        const redirectUrl = user.role === 'admin' ? '/dashboard' : `/profile/${user.id}`;
        console.log(redirectUrl);

        res.json({
            token,
            user: { id: user.id, email: user.email, role: user.role },
            redirectUrl
        });
    } catch (error) {
        console.error("Controller error in login:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function verifySession(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token requis." });
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await employeeModel.getEmployeeById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé." });
        }
        res.json({ id: user.id, email: user.email, role: user.role });
    } catch (error) {
        console.error("Controller error in verifySession:", error.stack);
        res.status(401).json({ message: "Token invalide ou expiré." });
    }
}

async function savePassword(req, res) {
    try {
        console.log("Received save password request:", req.body);
        const { email, password, confirmPassword } = req.body;
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Email et mots de passe requis." });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }
        const isSaved = await employeeModel.savePassword(email, password);
        if (!isSaved) {
            return res.status(400).json({ message: "Erreur lors de l'enregistrement du mot de passe." });
        }
        const user = await employeeModel.getEmployeeByEmail(email);
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        console.log("Password saved, token generated for:", email);
        res.json({ isSaved: true, token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error("Controller error in savePassword:", error.stack);
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
    login,
    verifySession,
    savePassword,
};