const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  tagline: { type: DataTypes.STRING, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true, field: 'image_url' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
})

module.exports = Category
