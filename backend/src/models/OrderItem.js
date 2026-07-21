const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  productId: { type: DataTypes.INTEGER, allowNull: true, field: 'product_id' },
  name: { type: DataTypes.STRING, allowNull: false }, // snapshot at time of order
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // snapshot
  qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
})

module.exports = OrderItem
