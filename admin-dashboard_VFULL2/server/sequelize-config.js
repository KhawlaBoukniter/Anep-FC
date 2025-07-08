require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    {
        dialect: 'postgres',
        logging: false,
    }
);

module.exports = sequelize;