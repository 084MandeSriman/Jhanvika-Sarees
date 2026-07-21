const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ContactMessage = sequelize.define('ContactMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  isResolved: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_resolved' },
})

module.exports = ContactMessage
