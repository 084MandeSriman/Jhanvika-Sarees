const express = require('express')
const { protect, requireRole } = require('../middleware/auth')
const ctrl = require('../controllers/emailController')

const router = express.Router()

router.post('/send-test', protect, requireRole('admin', 'superadmin'), ctrl.sendTestEmail)

module.exports = router
