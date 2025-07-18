module.exports = (sequelize, DataTypes) => {
  const Evaluation = sequelize.define('Evaluation', {
    id_evaluation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cycle_program_registrations',
        key: 'id'
      }
    },
    module_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    apports: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    reponse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    condition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    conception: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    qualite: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    }
  }, {
    tableName: 'evaluations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['registration_id']
      },
      {
        fields: ['module_id']
      },
      {
        unique: true,
        fields: ['registration_id', 'module_id']
      }
    ]
  });

  Evaluation.associate = function(models) {
    Evaluation.belongsTo(models.CycleProgramRegistration, {
      foreignKey: 'registration_id',
      as: 'registration'
    });
  };

  return Evaluation;
};