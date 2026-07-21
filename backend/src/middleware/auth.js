const jwt = require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')
const { fail } = require('../utils/apiResponse')
const { User } = require('../models')

// Verifies the JWT and attaches req.user. Rejects if missing/invalid.
const protect = asyncHandler(async (req, res, next) => {
  let token
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1]
  }
  if (!token) {
    return fail(res, 401, 'Not authorized — no token provided')
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)
    if (!user || !user.isActive) {
      return fail(res, 401, 'Not authorized — user no longer active')
    }
    req.user = user
    next()
  } catch (err) {
    return fail(res, 401, 'Not authorized — invalid or expired token')
  }
})

// Like protect, but does not fail if no token is present (used for guest-aware routes).
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1]
  }
  if (!token) return next()
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)
    if (user && user.isActive) req.user = user
  } catch {
    // ignore invalid token for optional auth
  }
  next()
})

// Restricts a route to one or more roles, e.g. requireRole('admin', 'superadmin')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 403, 'Forbidden — insufficient permissions')
    }
    next()
  }
}

module.exports = { protect, optionalAuth, requireRole }
