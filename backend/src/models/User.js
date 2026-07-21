const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM('customer', 'admin', 'superadmin'), defaultValue: 'customer' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'email_verified' },
  lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' },
  failedLoginAttempts: { type: DataTypes.INTEGER, defaultValue: 0, field: 'failed_login_attempts' },
  lockUntil: { type: DataTypes.DATE, allowNull: true, field: 'lock_until' },
})

module.exports = User
