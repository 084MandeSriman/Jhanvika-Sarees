const bcrypt = require('bcryptjs')
const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { recordActivity } = require('../utils/audit')
const { User, Order, Address } = require('../models')

// @route  GET /api/admin/customers
const listCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const offset = (page - 1) * limit
  const { rows, count } = await User.findAndCountAll({
    where: { role: 'customer' },
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })
  return ok(res, rows, { page, limit, total: count, totalPages: Math.ceil(count / limit) })
})

// @route  GET /api/admin/customers/:id
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: [{ model: Order, as: 'orders' }, { model: Address, as: 'addresses' }],
  })
  if (!customer) return fail(res, 404, 'Customer not found')
  return ok(res, customer)
})

// @route  PUT /api/admin/customers/:id/toggle-active
const toggleCustomerActive = asyncHandler(async (req, res) => {
  const customer = await User.findByPk(req.params.id)
  if (!customer) return fail(res, 404, 'Customer not found')
  customer.isActive = !customer.isActive
  await customer.save()
  await recordActivity(req, 'customer.toggle_active', { customerId: customer.id, isActive: customer.isActive })
  return ok(res, { id: customer.id, isActive: customer.isActive })
})

// ---------- Admin user (staff) management — superadmin only ----------

// @route  GET /api/admin/staff
const listStaff = asyncHandler(async (req, res) => {
  const staff = await User.findAll({
    where: { role: ['admin', 'superadmin'] },
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  })
  return ok(res, staff)
})

// @route  POST /api/admin/staff
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  if (!['admin', 'superadmin'].includes(role)) return fail(res, 400, 'Invalid staff role')
  const existing = await User.findOne({ where: { email } })
  if (existing) return fail(res, 409, 'A user with this email already exists')
  const hashed = await bcrypt.hash(password, 10)
  const staff = await User.create({ name, email, password: hashed, role, emailVerified: true })
  await recordActivity(req, 'staff.create', { staffId: staff.id, role })
  return created(res, { id: staff.id, name: staff.name, email: staff.email, role: staff.role })
})

// @route  PUT /api/admin/staff/:id/toggle-active
const toggleStaffActive = asyncHandler(async (req, res) => {
  const staff = await User.findByPk(req.params.id)
  if (!staff) return fail(res, 404, 'Staff member not found')
  staff.isActive = !staff.isActive
  await staff.save()
  await recordActivity(req, 'staff.toggle_active', { staffId: staff.id, isActive: staff.isActive })
  return ok(res, { id: staff.id, isActive: staff.isActive })
})

module.exports = {
  listCustomers,
  getCustomer,
  toggleCustomerActive,
  listStaff,
  createStaff,
  toggleStaffActive,
}
