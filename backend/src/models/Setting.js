const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Setting = sequelize.define('Setting', {
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: true },
  group: { type: DataTypes.STRING, defaultValue: 'general' },
}, { timestamps: true })

module.exports = Setting
