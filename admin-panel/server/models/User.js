const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  plan: { type: DataTypes.ENUM('basic', 'premium'), defaultValue: 'basic' },
  password: { type: DataTypes.STRING, allowNull: false },
  last_login: { type: DataTypes.DATE },
  total_chats: { type: DataTypes.INTEGER, defaultValue: 0 },
  ban_until: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: false });

module.exports = User;