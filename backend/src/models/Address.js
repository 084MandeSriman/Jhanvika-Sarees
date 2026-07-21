const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  fullName: { type: DataTypes.STRING, allowNull: false, field: 'full_name' },
  phone: { type: DataTypes.STRING, allowNull: false },
  line1: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  pincode: { type: DataTypes.STRING, allowNull: false },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_default' },
})

module.exports = Address
