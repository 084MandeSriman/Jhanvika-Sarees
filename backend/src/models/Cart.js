const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'user_id' },
})

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cartId: { type: DataTypes.INTEGER, allowNull: false, field: 'cart_id' },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  savedForLater: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'saved_for_later' },
}, {
  indexes: [{ fields: ['cart_id'] }],
})

module.exports = { Cart, CartItem }
