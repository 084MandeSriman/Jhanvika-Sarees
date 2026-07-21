const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// Short-lived access token — sent in the Authorization header, kept in memory/localStorage.
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  )
}

// Long-lived refresh token — random opaque string, never a JWT, so it carries
// no decodable claims. Only its SHA-256 hash is stored in the DB.
function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString('hex')
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

module.exports = { generateAccessToken, generateRefreshTokenValue, hashToken }
