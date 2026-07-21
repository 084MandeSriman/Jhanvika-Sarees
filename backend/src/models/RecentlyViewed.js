const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const RecentlyViewed = sequelize.define('RecentlyViewed', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  viewedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'viewed_at' },
}, {
  indexes: [{ unique: true, fields: ['user_id', 'product_id'] }],
})

module.exports = RecentlyViewed
