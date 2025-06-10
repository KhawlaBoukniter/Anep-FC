const express = require("express")
const router = express.Router()
const employeeController = require("../controllers/employeeController")

router.get("/", employeeController.getEmployees)
router.get("/:id", employeeController.getEmployee)
router.post("/", employeeController.createEmployee)
router.put("/:id", employeeController.updateEmployee)
router.delete("/:id", employeeController.deleteEmployee)
router.get("/check-email", employeeController.checkEmail)

module.exports = router
