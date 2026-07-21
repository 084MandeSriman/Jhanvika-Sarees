const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.JSON, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true, field: 'ip_address' },
})

module.exports = ActivityLog
