const express = require('express')
const ctrl = require('../../controllers/contactController')

const router = express.Router()

router.get('/messages', ctrl.adminListMessages)
router.put('/messages/:id/resolve', ctrl.resolveMessage)
router.get('/newsletter', ctrl.adminListSubscribers)

module.exports = router
