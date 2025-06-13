const express = require("express")
const router = express.Router()
const analysisController = require("../controllers/analysisController")

router.get("/skills-gap", analysisController.getSkillsGap)
router.get("/skills-distribution", analysisController.getSkillsDistribution)
router.get("/job-match", analysisController.getJobMatch)
router.get("/skills-analysis", analysisController.getSkillsAnalysis)

module.exports = router