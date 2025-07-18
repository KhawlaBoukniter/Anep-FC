const db = require('../models');
const Evaluation = db.Evaluation;

exports.createOrUpdate = async (req, res) => {
  try {
    const { registration_id, module_id, ...evaluationData } = req.body;
    
    const [evaluation, created] = await Evaluation.upsert({
      registration_id,
      module_id,
      ...evaluationData
    }, {
      returning: true
    });

    res.status(created ? 201 : 200).json(evaluation);
  } catch (error) {
    console.error("Erreur création/mise à jour évaluation:", error);
    res.status(500).json({ 
      message: error.message || "Erreur serveur" 
    });
  }
};

exports.getByRegistration = async (req, res) => {
  try {
    const evaluations = await Evaluation.findAll({
      where: { registration_id: req.params.registrationId }
    });
    
    if (!evaluations.length) {
      return res.status(404).json({
        message: "Aucune évaluation trouvée pour cette inscription"
      });
    }
    
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getByModule = async (req, res) => {
  try {
    const evaluations = await Evaluation.findAll({
      where: { module_id: req.params.moduleId }
    });
    
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.calculateAverage = async (req, res) => {
  try {
    const result = await Evaluation.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('apports')), 'avg_apports'],
        [sequelize.fn('AVG', sequelize.col('reponse')), 'avg_reponse'],
        [sequelize.fn('AVG', sequelize.col('condition')), 'avg_condition'],
        [sequelize.fn('AVG', sequelize.col('conception')), 'avg_conception'],
        [sequelize.fn('AVG', sequelize.col('qualite')), 'avg_qualite']
      ],
      where: {
        module_id: req.params.moduleId
      }
    });

    res.json({
      apports: parseFloat(result.dataValues.avg_apports).toFixed(2),
      reponse: parseFloat(result.dataValues.avg_reponse).toFixed(2),
      condition: parseFloat(result.dataValues.avg_condition).toFixed(2),
      conception: parseFloat(result.dataValues.avg_conception).toFixed(2),
      qualite: parseFloat(result.dataValues.avg_qualite).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur calcul moyenne" });
  }
};