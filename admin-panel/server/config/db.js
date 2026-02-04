const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'admin_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'Sarthak@212',
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Keep console clean
  }
);

module.exports = sequelize;