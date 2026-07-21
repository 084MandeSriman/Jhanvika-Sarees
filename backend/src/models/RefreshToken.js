const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

// Refresh tokens are stored hashed (never the raw token) so a DB leak alone
// can't be used to impersonate a session. Each row is one active session.
const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  tokenHash: { type: DataTypes.STRING, allowNull: false, field: 'token_hash' },
  userAgent: { type: DataTypes.STRING, allowNull: true, field: 'user_agent' },
  ipAddress: { type: DataTypes.STRING, allowNull: true, field: 'ip_address' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  revokedAt: { type: DataTypes.DATE, allowNull: true, field: 'revoked_at' },
}, {
  indexes: [{ fields: ['user_id'] }, { fields: ['token_hash'] }],
})

module.exports = RefreshToken
