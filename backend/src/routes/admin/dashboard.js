const express = require('express')
const ctrl = require('../../controllers/dashboardController')

const router = express.Router()

router.get('/dashboard', ctrl.getDashboard)
router.get('/reports/sales', ctrl.salesReport)
router.get('/reports/inventory', ctrl.inventoryReport)
router.get('/reports/customers', ctrl.customerReport)

module.exports = router
