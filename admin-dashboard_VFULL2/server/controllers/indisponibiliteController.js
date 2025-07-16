const indisponibiliteModel = require('../models/indisponibiliteModel');

exports.createIndisponibilite = async (req, res) => {
  try {
    const newIndispo = await indisponibiliteModel.create(req.body);
    res.status(201).json(newIndispo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
};

exports.getAllIndisponibilites = async (req, res) => {
  try {
    const indisponibilites = await indisponibiliteModel.getAll();
    res.json(indisponibilites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur de récupération' });
  }
};

exports.getIndisponibiliteById = async (req, res) => {
  try {
    const indispo = await indisponibiliteModel.getById(req.params.id);
    if (!indispo) {
      return res.status(404).json({ message: 'Indisponibilité non trouvée' });
    }
    res.json(indispo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur de récupération' });
  }
};

exports.updateIndisponibilite = async (req, res) => {
  try {
    const updatedIndispo = await indisponibiliteModel.update(
      req.params.id,
      req.body
    );
    if (!updatedIndispo) {
      return res.status(404).json({ message: 'Non trouvée' });
    }
    res.json(updatedIndispo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur de mise à jour' });
  }
};

exports.deleteIndisponibilite = async (req, res) => {
  try {
    const deletedIndispo = await indisponibiliteModel.remove(req.params.id);
    if (!deletedIndispo) {
      return res.status(404).json({ message: 'Non trouvée' });
    }
    res.json({ message: 'Archivée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur de suppression' });
  }
};

exports.getByEmployeId = async (req, res) => {
  try {
    const indispos = await indisponibiliteModel.getByEmployeId(
      req.params.employeId
    );
    res.json(indispos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur de récupération' });
  }
};