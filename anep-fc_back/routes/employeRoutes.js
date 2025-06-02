const express = require("express");
const router = express.Router();
const { getEmployes } = require("../controllers/employeController");

router.get("/", getEmployes);

module.exports = router;
