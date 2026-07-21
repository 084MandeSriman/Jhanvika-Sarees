const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const CmsPage = sequelize.define('CmsPage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT('long'), allowNull: false },
  metaTitle: { type: DataTypes.STRING, allowNull: true, field: 'meta_title' },
  metaDescription: { type: DataTypes.STRING, allowNull: true, field: 'meta_description' },
})

module.exports = CmsPage
