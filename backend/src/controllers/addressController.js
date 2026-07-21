const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { Address } = require('../models')

const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.findAll({ where: { userId: req.user.id }, order: [['isDefault', 'DESC']] })
  return ok(res, addresses)
})

const createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, line1, city, state, pincode, isDefault } = req.body
  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } })
  }
  const address = await Address.create({
    userId: req.user.id, fullName, phone, line1, city, state, pincode, isDefault: !!isDefault,
  })
  return created(res, address)
})

const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } })
  if (!address) return fail(res, 404, 'Address not found')
  if (req.body.isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.user.id } })
  }
  await address.update(req.body)
  return ok(res, address)
})

const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } })
  if (!address) return fail(res, 404, 'Address not found')
  await address.destroy()
  return ok(res, { message: 'Address removed' })
})

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress }
