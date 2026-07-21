const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const EmailVerificationToken = sequelize.define('EmailVerificationToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  tokenHash: { type: DataTypes.STRING, allowNull: false, field: 'token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  usedAt: { type: DataTypes.DATE, allowNull: true, field: 'used_at' },
})

module.exports = EmailVerificationToken
