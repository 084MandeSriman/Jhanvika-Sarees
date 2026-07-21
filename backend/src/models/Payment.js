const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' }, // null for guest checkout
  razorpayOrderId: { type: DataTypes.STRING, allowNull: true, unique: true, field: 'razorpay_order_id' },
  razorpayPaymentId: { type: DataTypes.STRING, allowNull: true, field: 'razorpay_payment_id' },
  razorpaySignature: { type: DataTypes.STRING, allowNull: true, field: 'razorpay_signature' },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'INR' },
  status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled'), defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.STRING, allowNull: true, field: 'payment_method' }, // 'online' | 'cod' | razorpay's reported sub-method (card/upi/netbanking/wallet)
  rawPayload: { type: DataTypes.JSON, allowNull: true, field: 'raw_payload' },
}, {
  indexes: [{ fields: ['order_id'] }, { fields: ['user_id'] }, { fields: ['status'] }],
})

module.exports = Payment
