const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  sku: { type: DataTypes.STRING, allowNull: true, unique: true },
  categoryId: { type: DataTypes.INTEGER, allowNull: false, field: 'category_id' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fabric: { type: DataTypes.STRING, allowNull: true },
  occasion: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  highlights: { type: DataTypes.JSON, allowNull: true }, // array of strings
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  weightGrams: { type: DataTypes.INTEGER, allowNull: true, field: 'weight_grams' },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
  reviewsCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'reviews_count' },
  bestseller: { type: DataTypes.BOOLEAN, defaultValue: false },
  isNew: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_new' },
  // palette drives the generated SVG swatch art when no real image is uploaded
  paletteJson: { type: DataTypes.JSON, allowNull: true, field: 'palette_json' },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'published' },
  metaTitle: { type: DataTypes.STRING, allowNull: true, field: 'meta_title' },
  metaDescription: { type: DataTypes.STRING, allowNull: true, field: 'meta_description' },
}, {
  indexes: [
    { fields: ['category_id'] },
    { fields: ['status'] },
  ],
})

module.exports = Product
