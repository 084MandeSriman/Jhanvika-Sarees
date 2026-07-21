const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  status: { type: DataTypes.STRING, allowNull: false },
  note: { type: DataTypes.STRING, allowNull: true },
})

module.exports = OrderStatusHistory
