const express = require('express')
const { protect, requireRole } = require('../../middleware/auth')

const router = express.Router()

// Every route mounted below requires a valid JWT AND an admin/superadmin role.
router.use(protect, requireRole('admin', 'superadmin'))

router.use('/products', require('./products'))
router.use('/categories', require('./categories'))
router.use('/orders', require('./orders'))
router.use('/payments', require('./payments'))
router.use('/', require('./users')) // /customers, /staff
router.use('/coupons', require('./coupons'))
router.use('/reviews', require('./reviews'))
router.use('/banners', require('./banners'))
router.use('/cms', require('./cms'))
router.use('/support', require('./support')) // /messages, /newsletter
router.use('/', require('./dashboard')) // /dashboard, /reports/*
router.use('/', require('./system')) // /settings, /activity-logs

module.exports = router
