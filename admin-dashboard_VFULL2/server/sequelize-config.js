require('dotenv').config({ path: __dirname + '/.env' });

console.log('Loaded DATABASE_URL in sequelize-config.js:', process.env.DATABASE_URL);

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: console.log,
});

module.exports = sequelize;