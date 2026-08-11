const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config()

const { notFound, errorHandler } = require('./middleware/errorHandler')
const { apiLimiter } = require('./middleware/rateLimiter')

const app = express()

// ---------- Security & core middleware ----------
app.use(helmet({ crossOriginResourcePolicy: false })) // allow serving /uploads images cross-origin to the frontend
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use('/api', apiLimiter)

// Serve uploaded product images
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }))

// ---------- SEO (served at site root, not /api) ----------
const seoCtrl = require('./controllers/seoController')
app.get('/sitemap.xml', seoCtrl.sitemap)
app.get('/robots.txt', seoCtrl.robots)

// ---------- Public routes ----------
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/coupons', require('./routes/coupons'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/pages', require('./routes/cms'))
app.use('/api/search', require('./routes/search'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/email', require('./routes/email'))
app.use('/api', require('./routes/contact')) // /contact, /newsletter/subscribe
app.use('/api/products', require('./routes/reviews')) // POST /:productId/reviews

// ---------- Authenticated (customer) routes ----------
app.use('/api/cart', require('./routes/cart'))
app.use('/api/wishlist', require('./routes/wishlist'))
app.use('/api/addresses', require('./routes/addresses'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/recently-viewed', require('./routes/recentlyViewed'))

// ---------- Admin routes ----------
app.use('/api/admin', require('./routes/admin'))

app.use(notFound)
app.use(errorHandler)

module.exports = app
