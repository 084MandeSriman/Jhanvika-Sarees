const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const EmailLog = sequelize.define('EmailLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  toEmail: { type: DataTypes.STRING, allowNull: false, field: 'to_email' },
  subject: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // e.g. 'welcome', 'order_confirmation'
  status: { type: DataTypes.ENUM('sent', 'failed'), allowNull: false },
  error: { type: DataTypes.TEXT, allowNull: true },
  orderId: { type: DataTypes.INTEGER, allowNull: true, field: 'order_id' },
}, {
  indexes: [{ fields: ['type'] }, { fields: ['status'] }],
})

module.exports = EmailLog
