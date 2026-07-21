const express = require('express')
const { protect } = require('../middleware/auth')
const ctrl = require('../controllers/cartController')

const router = express.Router()

router.use(protect)
router.get('/', ctrl.getCart)
router.post('/items', ctrl.addItem)
router.put('/items/:itemId', ctrl.updateItem)
router.delete('/items/:itemId', ctrl.removeItem)
router.put('/items/:itemId/save-for-later', ctrl.saveForLater)
router.put('/items/:itemId/move-to-cart', ctrl.moveToCart)
router.post('/merge', ctrl.mergeCart)
router.delete('/', ctrl.clearCart)

module.exports = router
