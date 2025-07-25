const express = require("express")
const router = express.Router()
const skillController = require("../controllers/reqSkillController")

router.get("/latest-code", skillController.getLatestCode)
router.get("/required", skillController.getRequiredSkills)
router.get("/", skillController.getSkills)
router.get("/:id", skillController.getSkill)
router.post("/", skillController.createSkill)
router.put("/:id", skillController.updateSkill)
router.delete("/:id", skillController.deleteSkill)
router.put("/:id/archive", skillController.archiveSkill);
router.put("/:id/unarchive", skillController.unarchiveSkill); 
module.exports = router