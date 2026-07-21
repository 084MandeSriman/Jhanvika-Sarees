const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  subtitle: { type: DataTypes.STRING, allowNull: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true, field: 'image_url' },
  linkUrl: { type: DataTypes.STRING, allowNull: true, field: 'link_url' },
  position: { type: DataTypes.ENUM('home_hero', 'home_offer', 'category_top'), defaultValue: 'home_hero' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
})

module.exports = Banner
