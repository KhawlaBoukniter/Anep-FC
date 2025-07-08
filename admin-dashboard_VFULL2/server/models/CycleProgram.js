module.exports = (sequelize, DataTypes) => {
    const CycleProgram = sequelize.define(
        'CycleProgram',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM('cycle', 'program'),
                allowNull: false,
            },
            program_type: {
                type: DataTypes.ENUM('mardi_du_partage', 'bati_pro', 'other'),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
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
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            entity: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            training_sheet_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            support_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            photos_url: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: true,
                defaultValue: [],
            },
            evaluation_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            facilitator: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            attendance_list_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            archived: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: 'cycles_programs',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    const CycleProgramModule = sequelize.define(
        'CycleProgramModule',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            cycle_program_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: CycleProgram,
                    key: 'id',
                },
            },
            module_id: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: 'cycle_program_modules',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );

    const CycleProgramRegistration = sequelize.define(
        'CycleProgramRegistration',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            cycle_program_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: CycleProgram,
                    key: 'id',
                },
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'cycle_program_registrations',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );

    const CycleProgramUserModule = sequelize.define(
        'CycleProgramUserModule',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            registration_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: CycleProgramRegistration,
                    key: 'id',
                },
            },
            module_id: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: 'cycle_program_user_modules',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false,
        }
    );

    CycleProgram.associate = (models) => {
        CycleProgram.hasMany(models.CycleProgramModule, { as: 'CycleProgramModules', foreignKey: 'cycle_program_id', onDelete: 'CASCADE' });
        CycleProgram.hasMany(models.CycleProgramRegistration, { as: 'CycleProgramRegistrations', foreignKey: 'cycle_program_id', onDelete: 'CASCADE' });
    };

    CycleProgramModule.associate = (models) => {
        CycleProgramModule.belongsTo(models.CycleProgram, { as: 'CycleProgram', foreignKey: 'cycle_program_id' });
    };

    CycleProgramRegistration.associate = (models) => {
        CycleProgramRegistration.belongsTo(models.CycleProgram, { as: 'CycleProgram', foreignKey: 'cycle_program_id' });
        CycleProgramRegistration.hasMany(models.CycleProgramUserModule, { as: 'CycleProgramUserModules', foreignKey: 'registration_id', onDelete: 'CASCADE' });
    };

    CycleProgramUserModule.associate = (models) => {
        CycleProgramUserModule.belongsTo(models.CycleProgramRegistration, { as: 'CycleProgramRegistration', foreignKey: 'registration_id' });
    };

    return {
        CycleProgram,
        CycleProgramModule,
        CycleProgramRegistration,
        CycleProgramUserModule,
    };
};