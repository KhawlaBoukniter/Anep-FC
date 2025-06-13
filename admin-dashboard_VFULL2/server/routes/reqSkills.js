const express = require("express")
const router = express.Router()
const skillController = require("../controllers/reqSkillController")

router.get("/latest-code", skillController.getLatestCode)
router.get("/", skillController.getSkills)
router.get("/:id", skillController.getSkill)
router.post("/", skillController.createSkill)
router.put("/:id", skillController.updateSkill)
router.delete("/:id", skillController.deleteSkill)

module.exports = router