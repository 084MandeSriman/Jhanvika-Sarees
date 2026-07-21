const express = require('express')
const settingsCtrl = require('../../controllers/settingsController')
const activityCtrl = require('../../controllers/activityLogController')
const searchCtrl = require('../../controllers/searchController')
const emailCtrl = require('../../controllers/emailController')

const router = express.Router()

router.get('/settings', settingsCtrl.getSettings)
router.put('/settings', settingsCtrl.updateSettings)
router.get('/activity-logs', activityCtrl.listActivityLogs)
router.get('/search-analytics', searchCtrl.adminSearchAnalytics)
router.get('/email-logs', emailCtrl.adminListEmailLogs)

module.exports = router
