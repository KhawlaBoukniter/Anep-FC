const { CycleProgram, CycleProgramModule, CycleProgramRegistration, CycleProgramUserModule } = require('../models');
const Course = require('../models/Course');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const db = require('../models');

const createCycleProgram = async (req, res) => {
    const {
        title,
        type,
        program_type,
        description,
        start_date,
        end_date,
        budget,
        entity,
        facilitator,
        training_sheet_url,
        support_url,
        evaluation_url,
        attendance_list_url,
        module_ids
    } = req.body;

    const files = req.files || {};
    const uploadDir = path.join(__dirname, '../Uploads');
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (files.photos || evaluation_url || files.evaluation || attendance_list_url || files.attendance_list) {
        return res.status(400).json({ message: 'Photos, evaluation, and attendance list are not allowed during creation' });
    }

    try {
        const cycleProgramData = {
            title,
            type,
            program_type: type === 'program' ? program_type : null,
            description,
            start_date,
            end_date,
            budget: parseFloat(budget),
            entity: type === 'program' && (program_type === 'bati_pro' || program_type === 'other') ? entity : null,
            training_sheet_url: type === 'program' && (program_type === 'bati_pro' || program_type === 'other') ? (files.training_sheet ? `${baseUrl}/Uploads/${files.training_sheet[0].filename}` : training_sheet_url || null) : null,
            support_url: files.support ? `${baseUrl}/Uploads/${files.support[0].filename}` : support_url || null,
            photos_url: [],
            evaluation_url: null,
            facilitator: type === 'program' && (program_type === 'mardi_du_partage' || program_type === 'other') ? facilitator : null,
            attendance_list_url: null,
        };

        const cycleProgram = await CycleProgram.create(cycleProgramData);

        if (module_ids && JSON.parse(module_ids).length > 0) {
            const parsedModuleIds = JSON.parse(module_ids);
            const moduleEntries = parsedModuleIds.map(module_id => ({
                cycle_program_id: cycleProgram.id,
                module_id,
            }));
            await CycleProgramModule.bulkCreate(moduleEntries);
        }

        res.status(201).json(cycleProgram);
    } catch (error) {
        console.error('Error creating cycle/program:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateCycleProgram = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        type,
        program_type,
        description,
        start_date,
        end_date,
        budget,
        entity,
        facilitator,
        training_sheet_url,
        support_url,
        evaluation_url,
        attendance_list_url,
        module_ids
    } = req.body;

    const files = req.files || {};
    const uploadDir = path.join(__dirname, '../Uploads');
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    try {
        const cycleProgram = await CycleProgram.findByPk(id);
        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Program not found' });
        }

        const updateData = {
            title,
            type,
            program_type: type === 'program' ? program_type : null,
            description,
            start_date,
            end_date,
            budget: parseFloat(budget),
            entity: type === 'program' && (program_type === 'bati_pro' || program_type === 'other') ? entity : null,
            training_sheet_url: type === 'program' && (program_type === 'bati_pro' || program_type === 'other') ? (files.training_sheet ? `${baseUrl}/Uploads/${files.training_sheet[0].filename}` : training_sheet_url || cycleProgram.training_sheet_url) : null,
            support_url: files.support ? `${baseUrl}/Uploads/${files.support[0].filename}` : support_url || cycleProgram.support_url,
            photos_url: files.photos ? files.photos.map(file => `${baseUrl}/Uploads/${file.filename}`) : cycleProgram.photos_url,
            evaluation_url: files.evaluation ? `${baseUrl}/Uploads/${files.evaluation[0].filename}` : evaluation_url || cycleProgram.evaluation_url,
            facilitator: type === 'program' && (program_type === 'mardi_du_partage' || program_type === 'other') ? facilitator : null,
            attendance_list_url: (type === 'cycle' || (type === 'program' && (program_type === 'mardi_du_partage' || program_type === 'other'))) ? (files.attendance_list ? `${baseUrl}/Uploads/${files.attendance_list[0].filename}` : attendance_list_url || cycleProgram.attendance_list_url) : null,
        };

        await cycleProgram.update(updateData);

        if (module_ids) {
            let parsedModuleIds;
            try {
                parsedModuleIds = JSON.parse(module_ids);
                if (!Array.isArray(parsedModuleIds)) {
                    throw new Error('module_ids must be an array');
                }
            } catch (err) {
                return res.status(400).json({ message: 'Invalid module_ids format' });
            }

            const validModules = await Course.find({ _id: { $in: parsedModuleIds } });
            if (validModules.length !== parsedModuleIds.length) {
                return res.status(400).json({ message: 'One or more module IDs are invalid' });
            }

            await CycleProgramModule.destroy({ where: { cycle_program_id: cycleProgram.id } });
            const moduleEntries = parsedModuleIds.map(module_id => ({
                cycle_program_id: cycleProgram.id,
                module_id,
            }));
            await CycleProgramModule.bulkCreate(moduleEntries);
        }

        res.status(200).json(cycleProgram);
    } catch (error) {
        console.error('Error updating cycle/program:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAllCyclePrograms = async (req, res) => {
    const { archived } = req.query;

    try {
        const query = {};
        if (archived !== undefined) {
            query.archived = archived === 'true';
        }

        const cyclePrograms = await CycleProgram.findAll({
            where: query,
            include: [
                { model: CycleProgramModule, as: 'CycleProgramModules' },
                { model: CycleProgramRegistration, as: 'CycleProgramRegistrations' },
            ],
        });

        const result = await Promise.all(cyclePrograms.map(async (cp) => {
            const validModuleIds = cp.CycleProgramModules
                .map(m => m.module_id)
                .filter(id => id !== null);

            const modules = validModuleIds.length > 0
                ? await Course.find({ _id: { $in: validModuleIds } })
                : [];

            return {
                ...cp.toJSON(),
                modules,
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching cycles/programs:', error);
        res.status(500).json({ message: error.message });
    }
};

const getCycleProgramById = async (req, res) => {
    const { id } = req.params;

    try {
        const cycleProgram = await CycleProgram.findByPk(id, {
            include: [
                { model: CycleProgramModule, as: 'CycleProgramModules' },
                { model: CycleProgramRegistration, as: 'CycleProgramRegistrations' },
            ],
        });

        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Program not found' });
        }

        cycleProgram.budget = cycleProgram.budget ?? 0;
        cycleProgram.start_date = cycleProgram.start_date || new Date().toISOString();

        const modules = await Course.find({
            _id: { $in: cycleProgram.CycleProgramModules.map(m => m.module_id) },
        });

        res.status(200).json({
            ...cycleProgram.toJSON(),
            modules,
        });
    } catch (error) {
        console.error('Error fetching cycle/program:', error);
        res.status(500).json({ message: error.message });
    }
};

const archiveCycleProgram = async (req, res) => {
    const { id } = req.params;

    try {
        const cycleProgram = await CycleProgram.findByPk(id);
        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Program not found' });
        }

        await cycleProgram.update({ archived: true });
        res.status(200).json({ message: 'Cycle/Program archived successfully' });
    } catch (error) {
        console.error('Error archiving cycle/program:', error);
        res.status(500).json({ message: error.message });
    }
};

const unarchiveCycleProgram = async (req, res) => {
    const { id } = req.params;

    try {
        const cycleProgram = await CycleProgram.findByPk(id);
        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Program not found' });
        }

        await cycleProgram.update({ archived: false });
        res.status(200).json({ message: 'Cycle/Program unarchived successfully' });
    } catch (error) {
        console.error('Error unarchiving cycle/program:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteCycleProgram = async (req, res) => {
    const { id } = req.params;

    try {
        const cycleProgram = await CycleProgram.findByPk(id);
        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Program not found' });
        }

        if (!cycleProgram.archived) {
            return res.status(400).json({ message: 'Only archived cycles/programs can be deleted' });
        }

        await CycleProgramModule.destroy({
            where: { cycle_program_id: id },
        });

        const registrations = await CycleProgramRegistration.findAll({
            where: { cycle_program_id: id },
        });

        const registrationIds = registrations.map(reg => reg.id);
        if (registrationIds.length > 0) {
            await CycleProgramUserModule.destroy({
                where: { registration_id: registrationIds },
            });
            await CycleProgramRegistration.destroy({
                where: { cycle_program_id: id },
            });
        }

        await cycleProgram.destroy();

        res.status(200).json({ message: 'Cycle/Program deleted successfully' });
    } catch (error) {
        console.error('Error deleting cycle/program:', error);
        res.status(500).json({ message: error.message });
    }
};


const registerUserToCycleProgram = async (req, res) => {
    const { id } = req.params;
    const { user_id, module_ids } = req.body;

    console.log(`Registering user ${user_id} to cycle_program ${id} with modules:`, module_ids);

    try {
        const parsedProgramId = parseInt(id, 10);
        const parsedUserId = parseInt(user_id, 10);
        if (isNaN(parsedProgramId) || isNaN(parsedUserId)) {
            return res.status(400).json({ message: 'id et user_id doivent être des nombres valides' });
        }

        const cycleProgram = await CycleProgram.findByPk(parsedProgramId, {
            include: [{ model: CycleProgramModule, as: 'CycleProgramModules' }],
        });
        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Programme non trouvé' });
        }

        const transaction = await db.sequelize.transaction();
        try {
            const registration = await CycleProgramRegistration.create({
                cycle_program_id: parsedProgramId,
                user_id: parsedUserId,
                status: 'pending',
            },
                { transaction }
            );

            let userModules = [];
            if (cycleProgram.type === 'cycle') {
                // For cycles, automatically include all modules with pending status
                const moduleIds = cycleProgram.CycleProgramModules.map((m) => m.module_id);
                userModules = moduleIds.map((moduleId) => ({
                    registration_id: registration.id,
                    module_id: moduleId,
                    status: 'pending',
                }));
            } else if (module_ids && typeof module_ids === 'string') {
                const moduleIdsArray = JSON.parse(module_ids);
                if (!Array.isArray(moduleIdsArray)) {
                    await transaction.rollback();
                    return res.status(400).json({ message: 'module_ids doit être un tableau valide' });
                }
                // Validate module IDs
                const validModules = await Course.find({ _id: { $in: moduleIdsArray } });
                if (validModules.length !== moduleIdsArray.length) {
                    await transaction.rollback();
                    return res.status(400).json({ message: 'Un ou plusieurs IDs de modules sont invalides' });
                }
                userModules = moduleIdsArray.map((moduleId) => ({
                    registration_id: registration.id,
                    module_id: moduleId,
                    status: 'pending',
                }));
            }

            if (userModules.length > 0) {
                await CycleProgramUserModule.bulkCreate(userModules, { transaction });
            }

            await transaction.commit();
            console.log(`Registration created with id: ${registration.id}`);
            res.status(200).json({ message: 'Inscription en attente de validation', registrationId: registration.id });
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur', details: error.message });
    }
};

const downloadRegistrations = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch only accepted registrations
        const registrations = await CycleProgramRegistration.findAll({
            where: {
                cycle_program_id: id,
                status: 'accepted' // Only include accepted registrations
            },
            include: [
                { model: CycleProgramUserModule, as: 'CycleProgramUserModules' },
                { model: CycleProgram, as: 'CycleProgram', attributes: ['title', 'type'] }
            ],
        });

        // Fetch user and module details for accepted registrations
        const usersData = await Promise.all(
            registrations.map(async (reg) => {
                // Fetch user details from the employe table
                const [user] = await db.sequelize.query(
                    `SELECT id_employe AS id, nom_complet AS name, email FROM employe WHERE id_employe = :userId`,
                    {
                        replacements: { userId: reg.user_id },
                        type: db.sequelize.QueryTypes.SELECT,
                    }
                );

                // Fetch module details
                const moduleIds = reg.CycleProgramUserModules
                    .filter(m => m.status === 'accepted') // Only include accepted modules
                    .map(m => m.module_id);

                const modules = moduleIds.length > 0
                    ? await Course.find({ _id: { $in: moduleIds } })
                    : [];

                return {
                    // UserID: user?.id || reg.user_id,
                    Name: user?.name || 'Unknown',
                    Email: user?.email || 'Unknown',
                    ProgramTitle: reg.CycleProgram.title,
                    ProgramType: reg.CycleProgram.type,
                    Modules: modules.map(m => m.title).join(', ') || 'None',
                    RegistrationDate: reg.created_at.toISOString(),
                };
            })
        );

        // If no accepted registrations, return an empty file with headers
        if (usersData.length === 0) {
            usersData.push({
                Name: '',
                Email: '',
                ProgramTitle: '',
                ProgramType: '',
                Modules: '',
                RegistrationDate: ''
            });
        }

        const worksheet = XLSX.utils.json_to_sheet(usersData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'AcceptedRegistrations');

        // Customize column headers
        XLSX.utils.sheet_add_aoa(worksheet, [[
            'Nom Complet',
            'Email',
            'Titre du Programme',
            'Type de Programme',
            'Modules Acceptés',
            'Date d\'Inscription'
        ]], { origin: 'A1' });

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=registrations_${id}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(buffer);
    } catch (error) {
        console.error('Error downloading registrations:', error);
        res.status(500).json({ message: error.message });
    }
};

const getUserEnrolledModules = async (req, res) => {
    const { user_id } = req.params;

    try {
        const registrations = await CycleProgramRegistration.findAll({
            where: { user_id },
            include: [
                {
                    model: CycleProgramUserModule,
                    as: 'CycleProgramUserModules',
                    attributes: ['module_id', 'status', 'created_at'],
                },
                {
                    model: CycleProgram,
                    as: 'CycleProgram',
                    attributes: ['id', 'title', 'type', 'description', 'start_date', 'end_date', 'evaluation_url'],
                },
            ],
            order: [[{ model: CycleProgramUserModule, as: 'CycleProgramUserModules' }, 'created_at', 'DESC']],
        });

        // Create a map to deduplicate modules by module_id, prioritizing the latest status
        const moduleMap = new Map();

        for (const registration of registrations) {
            const cycleProgram = registration.CycleProgram;
            for (const userModule of registration.CycleProgramUserModules) {
                const moduleId = userModule.module_id;
                // Only update if this is the first occurrence or a more recent entry
                if (!moduleMap.has(moduleId) || new Date(userModule.created_at) > new Date(moduleMap.get(moduleId).created_at)) {
                    moduleMap.set(moduleId, {
                        module_id: moduleId,
                        status: userModule.status,
                        created_at: userModule.created_at,
                        cycleProgram: {
                            id: cycleProgram.id,
                            title: cycleProgram.title,
                            type: cycleProgram.type,
                            description: cycleProgram.description,
                            start_date: cycleProgram.start_date,
                            end_date: cycleProgram.end_date,
                            evaluation_url: cycleProgram.evaluation_url,
                        },
                    });
                }
            }
        }

        // Fetch module details from MongoDB
        const validModuleIds = Array.from(moduleMap.keys())
            .map((id) => {
                try {
                    return new mongoose.Types.ObjectId(id);
                } catch (err) {
                    console.warn(`Invalid ObjectId: ${id}`);
                    return null;
                }
            })
            .filter((id) => id !== null);

        const modules = validModuleIds.length > 0
            ? await Course.find({ _id: { $in: validModuleIds } })
            : [];

        // Combine module details with status and cycleProgram info
        const enrolledModules = Array.from(moduleMap.values()).map((entry) => {
            const module = modules.find((m) => m._id.toString() === entry.module_id) || {};
            return {
                module: {
                    id: entry.module_id,
                    title: module.title || 'Module sans titre',
                    description: module.description || 'Aucune description disponible',
                    times: module.times || [],
                    photos: module.photos || [],
                    support: module.support || null,
                    progress: module.progress || 0,
                    certificateAvailable: module.certificateAvailable || false,
                    lastAccessed: module.lastAccessed || 'Jamais',
                },
                cycleProgram: entry.cycleProgram,
                status: entry.status,
            };
        });

        res.status(200).json(enrolledModules);
    } catch (error) {
        console.error('Error fetching user enrolled modules:', error);
        res.status(500).json({ message: error.message });
    }
};

const getRegistrationsByProgramId = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;

    console.log(`Fetching registrations for cycle_program_id: ${id}, user_id: ${user_id}`);

    if (!user_id) {
        return res.status(400).json({ message: 'user_id est requis' });
    }
    if (!req.user || user_id !== req.user.id.toString()) {
        console.log('Access denied: user_id:', user_id, 'req.user:', req.user);
        return res.status(403).json({ message: 'Accès non autorisé' });
    }

    try {
        const parsedProgramId = parseInt(id, 10);
        const parsedUserId = parseInt(user_id, 10);
        if (isNaN(parsedProgramId) || isNaN(parsedUserId)) {
            return res.status(400).json({ message: 'id et user_id doivent être des nombres valides' });
        }

        const cycleProgram = await CycleProgram.findByPk(parsedProgramId);
        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Programme non trouvé' });
        }

        const registrations = await CycleProgramRegistration.findAll({
            where: {
                cycle_program_id: parsedProgramId,
                user_id: parsedUserId,
            },
            include: [
                {
                    model: CycleProgram,
                    as: 'CycleProgram',
                    attributes: ['id', 'title', 'type'],
                },
                {
                    model: CycleProgramUserModule,
                    as: 'CycleProgramUserModules',
                    attributes: ['module_id', 'status'],
                },
            ],
        });

        // Transformer les données pour inclure un mapping module_id -> status
        const moduleStatuses = registrations.reduce((acc, reg) => {
            reg.CycleProgramUserModules.forEach((module) => {
                acc[module.module_id] = module.status;
            });
            return acc;
        }, {});

        console.log(`Registrations fetched for program ${id}:`, registrations.length);
        res.status(200).json({
            registrations,
            moduleStatuses,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des inscriptions:', error);
        res.status(500).json({ message: 'Erreur serveur', details: error.message });
    }
};

const getPendingRegistrations = async (req, res) => {
    try {
        const registrations = await CycleProgramRegistration.findAll({
            where: { status: 'pending' },
            include: [
                { model: CycleProgram, as: 'CycleProgram', attributes: ['id', 'title', 'type'] },
                { model: CycleProgramUserModule, as: 'CycleProgramUserModules', attributes: ['module_id', 'status'] },
            ],
        });

        // Fetch user details and module details
        const enrichedRegistrations = await Promise.all(
            registrations.map(async (reg) => {
                // Fetch user details from the employe table
                const [user] = await db.sequelize.query(
                    `SELECT id_employe AS id, nom_complet AS name, email FROM employe WHERE id_employe = :userId`,
                    {
                        replacements: { userId: reg.user_id },
                        type: db.sequelize.QueryTypes.SELECT,
                    }
                );

                const modules = reg.CycleProgramUserModules.length
                    ? await Course.find({ _id: { $in: reg.CycleProgramUserModules.map((m) => m.module_id) } })
                    : [];

                return {
                    ...reg.toJSON(),
                    user: user || { id: reg.user_id, name: 'Unknown', email: 'Unknown' }, // Fallback if user not found
                    modules: modules.map((m) => ({
                        id: m._id.toString(),
                        title: m.title,
                        status: reg.CycleProgramUserModules.find((um) => um.module_id === m._id.toString())?.status || 'pending',
                    })),
                };
            })
        );

        res.status(200).json(enrichedRegistrations);
    } catch (error) {
        console.error('Error fetching pending registrations:', error);
        res.status(500).json({ message: 'Erreur serveur', details: error.message });
    }
};

const updateRegistrationStatus = async (req, res) => {
    const { id } = req.params;
    const { status, moduleStatuses } = req.body;

    try {
        const registration = await CycleProgramRegistration.findByPk(id, {
            include: [
                { model: CycleProgram, as: 'CycleProgram' },
                { model: CycleProgramUserModule, as: 'CycleProgramUserModules' },
            ],
        });
        if (!registration) {
            return res.status(404).json({ message: 'Inscription non trouvée' });
        }

        const transaction = await db.sequelize.transaction();
        try {
            // Determine if any module is being accepted
            const hasAcceptedModule = moduleStatuses && Array.isArray(moduleStatuses)
                ? moduleStatuses.some(mod => mod.status === 'accepted')
                : false;

            // If any module is accepted and the program is of type 'program', set registration status to 'accepted'
            const finalStatus = registration.CycleProgram.type === 'program' && hasAcceptedModule
                ? 'accepted'
                : status;

            // Update registration status
            await registration.update({ status: finalStatus }, { transaction });

            // For cycles, module statuses follow the cycle status
            if (registration.CycleProgram.type === 'cycle') {
                await CycleProgramUserModule.update(
                    { status: finalStatus },
                    { where: { registration_id: id }, transaction }
                );
            } else if (moduleStatuses && Array.isArray(moduleStatuses)) {
                // For programs, update individual module statuses
                for (const { module_id, status: moduleStatus } of moduleStatuses) {
                    await CycleProgramUserModule.update(
                        { status: moduleStatus },
                        { where: { registration_id: id, module_id }, transaction }
                    );
                }
            }

            await transaction.commit();
            res.status(200).json({ message: 'Statut de l\'inscription mis à jour' });
        } catch (innerError) {
            await transaction.rollback();
            throw innerError;
        }
    } catch (error) {
        console.error('Error updating registration status:', error);
        res.status(500).json({ message: 'Erreur serveur', details: error.message });
    }
};

module.exports = {
    createCycleProgram,
    updateCycleProgram,
    archiveCycleProgram,
    unarchiveCycleProgram,
    deleteCycleProgram,
    getAllCyclePrograms,
    getCycleProgramById,
    registerUserToCycleProgram,
    downloadRegistrations,
    getUserEnrolledModules,
    getRegistrationsByProgramId,
    getPendingRegistrations,
    updateRegistrationStatus,
};