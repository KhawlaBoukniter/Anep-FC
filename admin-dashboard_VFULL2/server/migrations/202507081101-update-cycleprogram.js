'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const columns = await queryInterface.describeTable('cycles_programs');

        // Remove trainer_name if it exists
        if (columns.trainer_name) {
            await queryInterface.removeColumn('cycles_programs', 'trainer_name');
        }

        // Add program_type if it doesn't exist
        if (!columns.program_type) {
            await queryInterface.addColumn('cycles_programs', 'program_type', {
                type: Sequelize.ENUM('mardi_du_partage', 'bati_pro', 'other'),
                allowNull: true,
            });
        }

        // Add archived if it doesn't exist
        if (!columns.archived) {
            await queryInterface.addColumn('cycles_programs', 'archived', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }

        // Add created_at if it doesn't exist
        if (!columns.created_at) {
            await queryInterface.addColumn('cycles_programs', 'created_at', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            });
        }

        // Add updated_at if it doesn't exist
        if (!columns.updated_at) {
            await queryInterface.addColumn('cycles_programs', 'updated_at', {
                type: Sequelize.DATE,
                allowNull: true,
            });
        }

        // Create cycle_program_modules if it doesn't exist
        await queryInterface.createTable('cycle_program_modules', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            cycle_program_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'cycles_programs',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            module_id: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Create cycle_program_registrations if it doesn't exist
        await queryInterface.createTable('cycle_program_registrations', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            cycle_program_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'cycles_programs',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Create cycle_program_user_modules if it doesn't exist
        await queryInterface.createTable('cycle_program_user_modules', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            registration_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'cycle_program_registrations',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            module_id: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Drop tables in reverse order
        await queryInterface.dropTable('cycle_program_user_modules');
        await queryInterface.dropTable('cycle_program_registrations');
        await queryInterface.dropTable('cycle_program_modules');

        // Revert changes to cycles_programs
        const columns = await queryInterface.describeTable('cycles_programs');
        if (columns.program_type) {
            await queryInterface.removeColumn('cycles_programs', 'program_type');
        }
        if (columns.archived) {
            await queryInterface.removeColumn('cycles_programs', 'archived');
        }
        if (columns.created_at) {
            await queryInterface.removeColumn('cycles_programs', 'created_at');
        }
        if (columns.updated_at) {
            await queryInterface.removeColumn('cycles_programs', 'updated_at');
        }
        await queryInterface.addColumn('cycles_programs', 'trainer_name', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
};