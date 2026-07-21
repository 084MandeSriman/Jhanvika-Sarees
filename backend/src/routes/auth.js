const express = require('express')
const { body } = require('express-validator')
const validate = require('../middleware/validate')
const { protect } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimiter')
const ctrl = require('../controllers/authController')

const router = express.Router()

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  ctrl.register
)

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  ctrl.login
)

router.post('/refresh', authLimiter, ctrl.refresh)
router.post('/logout', ctrl.logout)
router.get('/sessions', protect, ctrl.listSessions)
router.delete('/sessions/:id', protect, ctrl.revokeSession)

router.get('/me', protect, ctrl.me)
router.put('/me', protect, ctrl.updateMe)
router.put(
  '/change-password',
  protect,
  [body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')],
  validate,
  ctrl.changePassword
)

router.get('/verify-email/:token', ctrl.verifyEmail)
router.post('/resend-verification', protect, ctrl.resendVerification)

router.post('/otp/request', authLimiter, [body('phone').notEmpty()], validate, ctrl.requestOtp)
router.post('/otp/verify', authLimiter, [body('phone').notEmpty(), body('otp').notEmpty()], validate, ctrl.verifyOtp)

router.post('/forgot-password', authLimiter, [body('email').isEmail()], validate, ctrl.forgotPassword)
router.post(
  '/reset-password',
  authLimiter,
  [body('token').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  ctrl.resetPassword
)

module.exports = router
