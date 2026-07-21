const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  name: { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: true },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_approved' },
})

module.exports = Review
