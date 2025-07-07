const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../sequelize-config');

const CycleProgram = sequelize.define('CycleProgram', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['cycle', 'program']],
        },
    },
    description: {
        type: DataTypes.TEXT,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    budget: {
        type: DataTypes.DECIMAL(10, 2),
    },
    entity: {
        type: DataTypes.STRING(255),
        allowNull: true, // Pour programmes uniquement
    },
    training_sheet_url: {
        type: DataTypes.STRING(255),
        allowNull: true, // Pour programmes
    },
    support_url: {
        type: DataTypes.STRING(255),
        allowNull: true, // Pour programmes
    },
    photos_url: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true, // Pour programmes
    },
    evaluation_url: {
        type: DataTypes.STRING(255),
        allowNull: true, // Pour programmes et cycles
    },
    facilitator: {
        type: DataTypes.STRING(255),
        allowNull: true, // Pour certains programmes (ex: Mardi du partage)
    },
    attendance_list_url: {
        type: DataTypes.STRING(255),
        allowNull: true, // Pour certains programmes (ex: Mardi du partage) et cycles
    },
    trainer_name: {
        type: DataTypes.STRING(255),
        allowNull: true, // Pour cycles uniquement
    },
    archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'cycles_programs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

const CycleProgramModule = sequelize.define('CycleProgramModule', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cycle_program_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'cycles_programs',
            key: 'id',
        },
    },
    module_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'cycle_program_modules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const CycleProgramRegistration = sequelize.define('CycleProgramRegistration', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cycle_program_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'cycles_programs',
            key: 'id',
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'cycle_program_registrations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

const CycleProgramUserModule = sequelize.define('CycleProgramUserModule', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    registration_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'cycle_program_registrations',
            key: 'id',
        },
    },
    module_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'cycle_program_user_modules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

CycleProgram.hasMany(CycleProgramModule, { foreignKey: 'cycle_program_id' });
CycleProgramModule.belongsTo(CycleProgram, { foreignKey: 'cycle_program_id' });

CycleProgram.hasMany(CycleProgramRegistration, { foreignKey: 'cycle_program_id' });
CycleProgramRegistration.belongsTo(CycleProgram, { foreignKey: 'cycle_program_id' });

CycleProgramRegistration.hasMany(CycleProgramUserModule, { foreignKey: 'registration_id' });
CycleProgramUserModule.belongsTo(CycleProgramRegistration, { foreignKey: 'registration_id' });

module.exports = {
    CycleProgram,
    CycleProgramModule,
    CycleProgramRegistration,
    CycleProgramUserModule,
};