const asyncHandler = require('../utils/asyncHandler')
const { Product, Category } = require('../models')

const SITE_URL = process.env.SITE_URL || 'http://localhost:5173'

// @route  GET /sitemap.xml
// Regenerated on every request from live DB data — no stale static file to forget to update.
const sitemap = asyncHandler(async (req, res) => {
  const [products, categories] = await Promise.all([
    Product.findAll({ where: { status: 'published' }, attributes: ['slug', 'updatedAt'] }),
    Category.findAll({ where: { isActive: true }, attributes: ['slug', 'updatedAt'] }),
  ])

  const staticUrls = ['', '/shop', '/about', '/contact']

  const urls = [
    ...staticUrls.map((path) => ({ loc: `${SITE_URL}${path}`, priority: path === '' ? '1.0' : '0.7' })),
    ...categories.map((c) => ({ loc: `${SITE_URL}/shop?category=${c.slug}`, lastmod: c.updatedAt, priority: '0.8' })),
    ...products.map((p) => ({ loc: `${SITE_URL}/product/${p.slug}`, lastmod: p.updatedAt, priority: '0.9' })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  res.set('Content-Type', 'application/xml')
  res.send(xml)
})

// @route  GET /robots.txt
const robots = (req, res) => {
  const body = `User-agent: *
Allow: /
Disallow: /account
Disallow: /checkout
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml`
  res.set('Content-Type', 'text/plain')
  res.send(body)
}

module.exports = { sitemap, robots }
