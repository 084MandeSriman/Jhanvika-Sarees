const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { Op } = require('sequelize')
const asyncHandler = require('../utils/asyncHandler')
const { ok, created, fail } = require('../utils/apiResponse')
const { generateAccessToken, generateRefreshTokenValue, hashToken } = require('../utils/generateToken')
const { recordActivity } = require('../utils/audit')
const emailService = require('../services/emailService')
const { User, RefreshToken, EmailVerificationToken } = require('../models')

// In-memory OTP/reset-token store for this demo (would be Redis/DB in production)
const otpStore = new Map()
const resetTokenStore = new Map()

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000
const REFRESH_COOKIE_NAME = 'jhanvika_refresh'
const REFRESH_TOKEN_DAYS = 30

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: user.emailVerified,
  }
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  }
}

// Issues a fresh access token + a new DB-tracked refresh token (rotation:
// the old refresh token, if any, should be revoked by the caller).
async function issueSession(req, res, user) {
  const accessToken = generateAccessToken(user)
  const refreshValue = generateRefreshTokenValue()

  await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshValue),
    userAgent: req.headers['user-agent'] || null,
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
  })

  res.cookie(REFRESH_COOKIE_NAME, refreshValue, refreshCookieOptions())
  return accessToken
}

async function sendVerificationEmail(user) {
  const raw = crypto.randomBytes(24).toString('hex')
  await EmailVerificationToken.create({
    userId: user.id,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${raw}`
  try {
    await emailService.sendVerificationEmail(user, verifyUrl)
  } catch {
    // Already logged to EmailLog by emailService — registration must not fail because of it.
  }
}

// @route  POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const existing = await User.findOne({ where: { email } })
  if (existing) return fail(res, 409, 'An account with this email already exists')

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashed, phone, role: 'customer' })

  await recordActivity(req, 'user.register', { userId: user.id })
  await sendVerificationEmail(user)
  emailService.sendWelcomeEmail(user).catch(() => {})

  const accessToken = await issueSession(req, res, user)
  return created(res, { user: toPublicUser(user), accessToken })
})

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ where: { email } })
  if (!user) return fail(res, 401, 'Invalid email or password')

  if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000)
    return fail(res, 423, `Too many failed attempts. Try again in ${minutesLeft} minute(s).`)
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    user.failedLoginAttempts += 1
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS)
      user.failedLoginAttempts = 0
      await user.save()
      await recordActivity(req, 'auth.account_locked', { userId: user.id })
      return fail(res, 423, 'Account locked for 15 minutes due to repeated failed logins.')
    }
    await user.save()
    return fail(res, 401, 'Invalid email or password')
  }

  if (!user.isActive) return fail(res, 403, 'This account has been disabled')

  user.failedLoginAttempts = 0
  user.lockUntil = null
  user.lastLoginAt = new Date()
  await user.save()

  const accessToken = await issueSession(req, res, user)
  return ok(res, { user: toPublicUser(user), accessToken })
})

// @route  POST /api/auth/refresh
// Reads the httpOnly refresh cookie, validates it against the DB, rotates it,
// and issues a new short-lived access token. This is what keeps a user
// logged in past the 15-minute access token window without re-entering a password.
const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!raw) return fail(res, 401, 'No active session')

  const tokenHash = hashToken(raw)
  const record = await RefreshToken.findOne({ where: { tokenHash, revokedAt: null } })
  if (!record || new Date(record.expiresAt) < new Date()) {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
    return fail(res, 401, 'Session expired — please sign in again')
  }

  const user = await User.findByPk(record.userId)
  if (!user || !user.isActive) return fail(res, 401, 'Session no longer valid')

  // Rotate: revoke the used refresh token and issue a brand new one.
  record.revokedAt = new Date()
  await record.save()

  const accessToken = await issueSession(req, res, user)
  return ok(res, { user: toPublicUser(user), accessToken })
})

// @route  POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME]
  if (raw) {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash: hashToken(raw) } })
  }
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions())
  return ok(res, { message: 'Logged out' })
})

// @route  GET /api/auth/sessions — list this user's active sessions/devices
const listSessions = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME]
  const currentHash = raw ? hashToken(raw) : null
  const sessions = await RefreshToken.findAll({
    where: { userId: req.user.id, revokedAt: null, expiresAt: { [Op.gt]: new Date() } },
    attributes: ['id', 'userAgent', 'ipAddress', 'createdAt', 'expiresAt', 'tokenHash'],
    order: [['createdAt', 'DESC']],
  })
  return ok(res, sessions.map((s) => ({
    id: s.id,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    isCurrent: s.tokenHash === currentHash,
  })))
})

// @route  DELETE /api/auth/sessions/:id — revoke one session (log out a specific device)
const revokeSession = asyncHandler(async (req, res) => {
  const session = await RefreshToken.findOne({ where: { id: req.params.id, userId: req.user.id } })
  if (!session) return fail(res, 404, 'Session not found')
  session.revokedAt = new Date()
  await session.save()
  return ok(res, { message: 'Session revoked' })
})

// @route  GET /api/auth/me
const me = asyncHandler(async (req, res) => ok(res, toPublicUser(req.user)))

// @route  PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body
  req.user.name = name ?? req.user.name
  req.user.phone = phone ?? req.user.phone
  await req.user.save()
  return ok(res, toPublicUser(req.user))
})

// @route  PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const match = await bcrypt.compare(currentPassword, req.user.password)
  if (!match) return fail(res, 401, 'Current password is incorrect')
  req.user.password = await bcrypt.hash(newPassword, 10)
  await req.user.save()
  await recordActivity(req, 'user.change_password')
  return ok(res, { message: 'Password updated successfully' })
})

// @route  GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const tokenHash = hashToken(req.params.token)
  const record = await EmailVerificationToken.findOne({ where: { tokenHash, usedAt: null } })
  if (!record || new Date(record.expiresAt) < new Date()) {
    return fail(res, 400, 'Invalid or expired verification link')
  }
  const user = await User.findByPk(record.userId)
  if (!user) return fail(res, 400, 'Invalid verification link')
  user.emailVerified = true
  await user.save()
  record.usedAt = new Date()
  await record.save()
  return ok(res, { message: 'Email verified successfully' })
})

// @route  POST /api/auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  if (req.user.emailVerified) return ok(res, { message: 'Email is already verified' })
  await sendVerificationEmail(req.user)
  return ok(res, { message: 'Verification email sent (simulated — check server console)' })
})

// @route  POST /api/auth/otp/request — simulated SMS OTP (see backend/README.md)
const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body
  const otp = String(Math.floor(100000 + Math.random() * 900000))
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 })
  // eslint-disable-next-line no-console
  console.log(`[SIMULATED SMS] OTP for ${phone}: ${otp}`)
  return ok(res, { message: 'OTP sent (simulated — check server console)', devOtp: otp })
})

// @route  POST /api/auth/otp/verify
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body
  const record = otpStore.get(phone)
  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return fail(res, 400, 'Invalid or expired OTP')
  }
  otpStore.delete(phone)
  return ok(res, { message: 'OTP verified' })
})

// @route  POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ where: { email } })
  if (user) {
    const token = crypto.randomBytes(24).toString('hex')
    resetTokenStore.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 })
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
    emailService.sendForgotPasswordEmail(user, resetUrl).catch(() => {})
  }
  return ok(res, { message: 'If that email exists, a reset link has been sent — please check your inbox.' })
})

// @route  POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body
  const record = resetTokenStore.get(token)
  if (!record || record.expiresAt < Date.now()) {
    return fail(res, 400, 'Invalid or expired reset token')
  }
  const user = await User.findByPk(record.userId)
  if (!user) return fail(res, 400, 'Invalid reset token')
  user.password = await bcrypt.hash(newPassword, 10)
  user.failedLoginAttempts = 0
  user.lockUntil = null
  await user.save()
  resetTokenStore.delete(token)
  // Reset password = revoke all existing sessions for safety.
  await RefreshToken.update({ revokedAt: new Date() }, { where: { userId: user.id, revokedAt: null } })
  emailService.sendPasswordResetSuccessEmail(user).catch(() => {})
  return ok(res, { message: 'Password has been reset successfully' })
})

module.exports = {
  register,
  login,
  refresh,
  logout,
  listSessions,
  revokeSession,
  me,
  updateMe,
  changePassword,
  verifyEmail,
  resendVerification,
  requestOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
}
