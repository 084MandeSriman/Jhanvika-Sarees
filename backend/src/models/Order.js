const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'order_number' },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' }, // null for guest checkout
  guestEmail: { type: DataTypes.STRING, allowNull: true, field: 'guest_email' },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'),
    defaultValue: 'pending',
  },
  paymentMethod: { type: DataTypes.ENUM('upi', 'card', 'cod'), allowNull: false, field: 'payment_method' },
  paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending', field: 'payment_status' },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  shippingFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, field: 'shipping_fee' },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  couponCode: { type: DataTypes.STRING, allowNull: true, field: 'coupon_code' },
  shippingAddress: { type: DataTypes.JSON, allowNull: false, field: 'shipping_address' },
  trackingNumber: { type: DataTypes.STRING, allowNull: true, field: 'tracking_number' },
  courierName: { type: DataTypes.STRING, allowNull: true, field: 'courier_name' },
  trackingUrl: { type: DataTypes.STRING, allowNull: true, field: 'tracking_url' },
  estimatedDelivery: { type: DataTypes.DATE, allowNull: true, field: 'estimated_delivery' },
}, {
  indexes: [
    { fields: ['status'] },
    { fields: ['user_id'] },
    { fields: ['payment_status'] },
  ],
})

module.exports = Order
