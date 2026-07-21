const express = require('express')
const { requireRole } = require('../../middleware/auth')
const ctrl = require('../../controllers/userAdminController')

const router = express.Router()

router.get('/customers', ctrl.listCustomers)
router.get('/customers/:id', ctrl.getCustomer)
router.put('/customers/:id/toggle-active', ctrl.toggleCustomerActive)

// Staff management is restricted to superadmin only
router.get('/staff', requireRole('superadmin'), ctrl.listStaff)
router.post('/staff', requireRole('superadmin'), ctrl.createStaff)
router.put('/staff/:id/toggle-active', requireRole('superadmin'), ctrl.toggleStaffActive)

module.exports = router
