const { employeeSchema } = require("../validators/employeeValidator")
const employeeModel = require("../models/employeeModel")

async function getEmployees(req, res) {
    try {
        const { search, role } = req.query
        const employees = await employeeModel.getAllEmployees({ search, role })
        res.json(employees)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erreur serveur." })
    }
}

async function getEmployee(req, res) {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." })

        const employee = await employeeModel.getEmployeeById(id)
        if (!employee) return res.status(404).json({ message: "Employé non trouvé." })

        res.json(employee)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erreur serveur." })
    }
}

async function createEmployee(req, res) {
    try {
        const { error, value } = employeeSchema.validate(req.body, { abortEarly: false })
        if (error) {
            return res.status(400).json({ errors: error.details.map(e => e.message) })
        }

        const newEmployee = await employeeModel.createEmployee(value)
        res.status(201).json(newEmployee)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erreur serveur." })
    }
}

async function updateEmployee(req, res) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." });

        const { emplois, competences, ...data } = req.body;
        const filteredData = {
            ...data,
            emplois: emplois.map(({ id_emploi }) => ({ id_emploi: Number(id_emploi) })),
            competences: competences?.map(({ id_competencea, niveaua }) => ({
                id_competencea: Number(id_competencea),
                niveaua: Number(niveaua),
            })),
        };

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
        console.error("Erreur lors de la mise à jour de l'employé :", error);
        if (error.code === '23505') {
            return res.status(400).json({ message: "Cet email est deja utilisé." });
        }
        res.status(500).json({ message: "Erreur serveur." });
    }
}

async function deleteEmployee(req, res) {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) return res.status(400).json({ message: "ID invalide." })

        await employeeModel.deleteEmployee(id)
        res.status(204).send()
    } catch (error) {
        console.error(error)
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "Employé non trouvé." })
        }
        res.status(500).json({ message: "Erreur serveur." })
    }
}

async function checkEmail(req, res) {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email requis." });
        }

        const exists = await employeeModel.checkEmailExists(email);
        res.json({ exists });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
}

module.exports = {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    checkEmail,
};
