const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.ENUM('percent', 'flat'), allowNull: false, defaultValue: 'percent' },
  value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  minOrderValue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'min_order_value' },
  usageLimit: { type: DataTypes.INTEGER, allowNull: true, field: 'usage_limit' },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'used_count' },
  expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
})

module.exports = Coupon
