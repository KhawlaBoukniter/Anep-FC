const { CycleProgram, CycleProgramModule, CycleProgramRegistration, CycleProgramUserModule } = require('../models/CycleProgram');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const createCycleProgram = async (req, res) => {
    const {
        title,
        type,
        description,
        start_date,
        end_date,
        budget,
        entity,
        facilitator,
        trainer_name,
        module_ids,
        training_sheet_url,
        support_url,
        evaluation_url,
        attendance_list_url,
    } = req.body;

    const files = req.files || {};
    const uploadDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
        const cycleProgramData = {
            title,
            type,
            description,
            start_date,
            end_date,
            budget,
            entity: type === 'program' ? entity : null,
            training_sheet_url: files.training_sheet ? `/uploads/${files.training_sheet[0].filename}` : (training_sheet_url || null),
            support_url: files.support ? `/uploads/${files.support[0].filename}` : (support_url || null),
            photos_url: files.photos ? files.photos.map(file => `/uploads/${file.filename}`) : null,
            evaluation_url: files.evaluation ? `/uploads/${files.evaluation[0].filename}` : (evaluation_url || null),
            facilitator: type === 'program' && facilitator ? facilitator : null,
            attendance_list_url: files.attendance_list ? `/uploads/${files.attendance_list[0].filename}` : (attendance_list_url || null),
            trainer_name: type === 'cycle' ? trainer_name : null,
        };

        const cycleProgram = await CycleProgram.create(cycleProgramData);

        if (module_ids && module_ids.length > 0) {
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
        description,
        start_date,
        end_date,
        budget,
        entity,
        facilitator,
        trainer_name,
        module_ids,
        training_sheet_url,
        support_url,
        evaluation_url,
        attendance_list_url,
    } = req.body;

    const files = req.files || {};
    const uploadDir = path.join(__dirname, '../Uploads');

    try {
        const cycleProgram = await CycleProgram.findByPk(id);
        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Program not found' });
        }

        const updateData = {
            title,
            type,
            description,
            start_date,
            end_date,
            budget,
            entity: type === 'program' ? entity : null,
            training_sheet_url: files.training_sheet ? `/uploads/${files.training_sheet[0].filename}` : (training_sheet_url || cycleProgram.training_sheet_url),
            support_url: files.support ? `/uploads/${files.support[0].filename}` : (support_url || cycleProgram.support_url),
            photos_url: files.photos ? files.photos.map(file => `/uploads/${file.filename}`) : cycleProgram.photos_url,
            evaluation_url: files.evaluation ? `/uploads/${files.evaluation[0].filename}` : (evaluation_url || cycleProgram.evaluation_url),
            facilitator: type === 'program' && facilitator ? facilitator : null,
            attendance_list_url: files.attendance_list ? `/uploads/${files.attendance_list[0].filename}` : (attendance_list_url || cycleProgram.attendance_list_url),
            trainer_name: type === 'cycle' ? trainer_name : null,
        };

        await cycleProgram.update(updateData);

        if (module_ids) {
            const parsedModuleIds = JSON.parse(module_ids);
            await CycleProgramModule.destroy({ where: { cycle_program_id: id } });
            const moduleEntries = parsedModuleIds.map(module_id => ({
                cycle_program_id: id,
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

// Les autres fonctions (archive, unarchive, getAll, etc.) restent inchangées
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

const getAllCyclePrograms = async (req, res) => {
    const { archived } = req.query;

    try {
        const query = {};
        if (archived !== undefined) {
            query.archived = archived === 'true';
        }

        const cyclePrograms = await CycleProgram.findAll({
            where: query,
            include: [{ model: CycleProgramModule, as: 'CycleProgramModules' }],
        });

        const result = await Promise.all(cyclePrograms.map(async (cp) => {
            const modules = await Course.find({
                _id: { $in: cp.CycleProgramModules.map(m => m.module_id) },
            });
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

const registerUserToCycleProgram = async (req, res) => {
    const { id } = req.params;
    const { user_id, module_ids } = req.body;

    try {
        const cycleProgram = await CycleProgram.findByPk(id, {
            include: [{ model: CycleProgramModule, as: 'CycleProgramModules' }],
        });

        if (!cycleProgram) {
            return res.status(404).json({ message: 'Cycle/Program not found' });
        }

        const registration = await CycleProgramRegistration.create({
            cycle_program_id: id,
            user_id,
        });

        if (cycleProgram.type === 'cycle') {
            const moduleEntries = cycleProgram.CycleProgramModules.map(module => ({
                registration_id: registration.id,
                module_id: module.module_id,
            }));
            await CycleProgramUserModule.bulkCreate(moduleEntries);
        } else {
            if (module_ids && module_ids.length > 0) {
                const parsedModuleIds = JSON.parse(module_ids);
                const moduleEntries = parsedModuleIds.map(module_id => ({
                    registration_id: registration.id,
                    module_id,
                }));
                await CycleProgramUserModule.bulkCreate(moduleEntries);
            }
        }

        res.status(201).json(registration);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: error.message });
    }
};

const downloadRegistrations = async (req, res) => {
    const { id } = req.params;

    try {
        const registrations = await CycleProgramRegistration.findAll({
            where: { cycle_program_id: id },
            include: [{ model: CycleProgramUserModule, as: 'CycleProgramUserModules' }],
        });

        const usersData = registrations.map(reg => ({
            UserID: reg.user_id,
            Modules: reg.CycleProgramUserModules.map(m => m.module_id).join(', '),
            RegistrationDate: reg.created_at.toISOString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(usersData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(buffer);
    } catch (error) {
        console.error('Error downloading registrations:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCycleProgram,
    updateCycleProgram,
    archiveCycleProgram,
    unarchiveCycleProgram,
    getAllCyclePrograms,
    getCycleProgramById,
    registerUserToCycleProgram,
    downloadRegistrations,
};