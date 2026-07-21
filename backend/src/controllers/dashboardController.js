const { Op, fn, col, literal } = require('sequelize')
const asyncHandler = require('../utils/asyncHandler')
const { ok } = require('../utils/apiResponse')
const { sequelize, Order, OrderItem, Product, User, Category } = require('../models')

// @route  GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [revenueRow] = await Order.findAll({
    where: { paymentStatus: 'paid' },
    attributes: [[fn('SUM', col('total')), 'revenue'], [fn('COUNT', col('id')), 'paidOrders']],
    raw: true,
  })

  const totalOrders = await Order.count()
  const totalCustomers = await User.count({ where: { role: 'customer' } })
  const totalProducts = await Product.count({ where: { status: 'published' } })
  const lowStockCount = await Product.count({ where: { stock: { [Op.lte]: 5 }, status: 'published' } })
  const pendingOrders = await Order.count({ where: { status: 'pending' } })

  const recentOrders = await Order.findAll({
    order: [['createdAt', 'DESC']],
    limit: 8,
    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
  })

  // Last 7 days revenue trend
  const salesTrend = await Order.findAll({
    where: {
      paymentStatus: 'paid',
      createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('SUM', col('total')), 'revenue'],
      [fn('COUNT', col('id')), 'orders'],
    ],
    group: [literal('DATE(created_at)')],
    order: [[literal('DATE(created_at)'), 'ASC']],
    raw: true,
  })

  const topProducts = await OrderItem.findAll({
    attributes: [
      'productId', 'name',
      [fn('SUM', col('qty')), 'unitsSold'],
      [fn('SUM', literal('price * qty')), 'revenue'],
    ],
    group: ['productId', 'name'],
    order: [[literal('unitsSold'), 'DESC']],
    limit: 5,
    raw: true,
  })

  return ok(res, {
    revenue: Number(revenueRow?.revenue || 0),
    paidOrders: Number(revenueRow?.paidOrders || 0),
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockCount,
    pendingOrders,
    recentOrders,
    salesTrend,
    topProducts,
  })
})

// @route  GET /api/admin/reports/sales?from=&to=
const salesReport = asyncHandler(async (req, res) => {
  const where = { paymentStatus: 'paid' }
  if (req.query.from || req.query.to) {
    where.createdAt = {}
    if (req.query.from) where.createdAt[Op.gte] = new Date(req.query.from)
    if (req.query.to) where.createdAt[Op.lte] = new Date(req.query.to)
  }
  const rows = await Order.findAll({
    where,
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('SUM', col('total')), 'revenue'],
      [fn('SUM', col('discount')), 'discounts'],
      [fn('COUNT', col('id')), 'orders'],
    ],
    group: [literal('DATE(created_at)')],
    order: [[literal('DATE(created_at)'), 'ASC']],
    raw: true,
  })
  return ok(res, rows)
})

// @route  GET /api/admin/reports/inventory
const inventoryReport = asyncHandler(async (req, res) => {
  const rows = await Product.findAll({
    attributes: ['id', 'name', 'sku', 'stock', 'price'],
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
    order: [['stock', 'ASC']],
  })
  return ok(res, rows)
})

// @route  GET /api/admin/reports/customers
const customerReport = asyncHandler(async (req, res) => {
  const rows = await User.findAll({
    where: { role: 'customer' },
    attributes: {
      include: [[fn('COUNT', col('orders.id')), 'orderCount'], [fn('SUM', col('orders.total')), 'lifetimeValue']],
    },
    include: [{ model: Order, as: 'orders', attributes: [] }],
    group: ['User.id'],
    order: [[literal('lifetimeValue'), 'DESC']],
    subQuery: false,
  })
  return ok(res, rows)
})

module.exports = { getDashboard, salesReport, inventoryReport, customerReport }
