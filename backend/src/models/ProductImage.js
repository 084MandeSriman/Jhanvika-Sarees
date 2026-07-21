const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ProductImage = sequelize.define('ProductImage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  url: { type: DataTypes.STRING, allowNull: false },
  altText: { type: DataTypes.STRING, allowNull: true, field: 'alt_text' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
})

module.exports = ProductImage
