const { employeeSchema } = require("../validators/employeeValidator");
const employeeModel = require("../models/employeeModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

async function getEmployees(req, res) {
    try {
        const { search, role, archived = false } = req.query;
        const employees = await employeeModel.getAllEmployees({
            search,
            role,
            archived: archived === "true",
        });
        res.json(employees);
    } catch (error) {
        console.error("Controller error in getEmployees:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function getEmployee(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token requis." });

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await employeeModel.getEmployeeById(decoded.id);

        const employee = await employeeModel.getEmployeeById(id);
        if (!employee) return res.status(404).json({ message: "Employé non trouvé." });

        res.json(employee);
    } catch (error) {
        console.error("Controller error in getEmployee:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function createEmployee(req, res) {
    try {
        const { error, value } = employeeSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map((e) => e.message) });
        }

        const newEmployee = await employeeModel.createEmployee(value);
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
            return res.status(400).json({ errors: error.details.map((e) => e.message) });
        }

        const updatedEmployee = await employeeModel.updateEmployee(id, value);
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
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email requis." });
        }
        const { exists, hasPassword } = await employeeModel.checkEmailExists(email);
        res.json({ exists, hasPassword });
    } catch (error) {
        console.error("Controller error in checkEmail:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }
        const user = await employeeModel.checkPassword(email, password);
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

        const redirectUrl = user.role === 'admin' ? '/dashboard' : '/formation';

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
        res.json({ isSaved: true, token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error("Controller error in savePassword:", error.stack);
        res.status(500).json({ message: "Erreur serveur.", details: error.message });
    }
}

async function getEmployeeProfiles(req, res) {
    try {
        const employees = await getAllEmployees({ search: req.query.search, role: req.query.role, archived: false });
        // Transform to match the expected Profile interface
        const profiles = employees.map(employee => ({
            id_profile: employee.profile?.id_profile,
            name: employee.profile?.["NOM PRENOM"],
            "NOM PRENOM": employee.profile?.["NOM PRENOM"],
            ADRESSE: employee.profile?.ADRESSE,
            DATE_NAISS: employee.profile?.DATE_NAISS,
            DAT_REC: employee.profile?.DAT_REC,
            CIN: employee.profile?.CIN,
            DETACHE: employee.profile?.DETACHE,
            SEXE: employee.profile?.SEXE,
            SIT_F_AG: employee.profile?.SIT_F_AG,
            STATUT: employee.profile?.STATUT,
            DAT_POS: employee.profile?.DAT_POS,
            LIBELLE_GRADE: employee.profile?.["LIBELLE GRADE"],
            GRADE_ASSIMILE: employee.profile?.["GRADE ASSIMILE"],
            LIBELLE_FONCTION: employee.profile?.["LIBELLE FONCTION"],
            DAT_FCT: employee.profile?.DAT_FCT,
            LIBELLE_LOC: employee.profile?.["LIBELLE LOC"],
            LIBELLE_REGION: employee.profile?.["LIBELLE REGION"],
            created_at: employee.created_at,
            updated_at: employee.updated_at,
        })).filter(profile => profile.id_profile);
        res.json(profiles);
    } catch (error) {
        console.error("Controller error in getEmployeeProfiles:", error.stack);
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
    getEmployeeProfiles,
};