const { getAllEmployes } = require("../models/employeModel");

exports.getEmployes = async (req, res) => {
  try {
    const employes = await getAllEmployes();
    res.json(employes);
  } catch (error) {
    console.error("Erreur getEmployes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
