'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../sequelize-config'); // Use sequelize-config.js
const basename = path.basename(__filename);
const db = {};

// Explicitly list Sequelize model files
const sequelizeModelFiles = ['CycleProgram.js', 'employeeModel.js']; // Add other Sequelize model files here, e.g., ['cycleprogram.js', 'user.js']

sequelizeModelFiles.forEach(file => {
  try {
    const filePath = path.join(__dirname, file);
    const exported = require(filePath);
    if (typeof exported === 'function') {
      const models = exported(sequelize, Sequelize.DataTypes);
      // Handle object of models
      if (models && typeof models === 'object') {
        Object.keys(models).forEach(modelName => {
          db[modelName] = models[modelName];
        });
      } else {
        console.warn(`Skipping file ${file}: does not return an object of models`);
      }
    } else {
      console.warn(`Skipping file ${file}: does not export a function`);
    }
  } catch (error) {
    console.error(`Error loading model from ${file}:`, error.message);
  }
});

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;