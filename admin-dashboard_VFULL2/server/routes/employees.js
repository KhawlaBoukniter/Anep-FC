const express = require("express")
const router = express.Router()
const employeeController = require("../controllers/employeeController")

router.get("/", employeeController.getEmployees)
router.get("/check-email", employeeController.checkEmail)
router.get("/:id", employeeController.getEmployee)
router.post("/", employeeController.createEmployee)
router.put("/:id", employeeController.updateEmployee)
router.delete("/:id", employeeController.deleteEmployee)
router.put('/:id/archive', employeeController.archiveEmployee)
router.put('/:id/unarchive', employeeController.unarchiveEmployee)

module.exports = router
