require('dotenv').config()
const bcrypt = require('bcryptjs')
const {
  sequelize, User, Category, Product, ProductImage, Coupon, Banner, CmsPage, Setting,
} = require('../models')

const categories = [
  { name: 'Banarasi Silk', slug: 'banarasi', tagline: 'Woven on ancient looms of Varanasi' },
  { name: 'Kanjivaram', slug: 'kanjivaram', tagline: 'Temple silk from Tamil Nadu' },
  { name: 'Chanderi', slug: 'chanderi', tagline: 'Featherlight weaves from Madhya Pradesh' },
  { name: 'Linen & Cotton', slug: 'linen', tagline: 'Everyday elegance, breathable ease' },
  { name: 'Georgette', slug: 'georgette', tagline: 'Fluid drapes for the modern evening' },
  { name: 'Bridal Edit', slug: 'bridal', tagline: 'Heirlooms for the big day' },
]

const productsByCategory = {
  banarasi: [
    { name: 'Meenakari Zari Banarasi', price: 18499, mrp: 24999, fabric: 'Pure Banarasi Silk', occasion: 'Wedding, Reception', bestseller: true, palette: { primary: '#6B1E3C', secondary: '#4A1329', accent: '#E4C97A' }, description: 'A regal Banarasi silk saree with hand-enamelled meenakari motifs woven into a dense zari border.', highlights: ['100% pure mulberry silk', 'Hand-finished zari border', 'Unstitched blouse piece included', 'Weight: 950g'], stock: 6 },
    { name: 'Malhar Banarasi Teal', price: 15999, mrp: 19999, fabric: 'Pure Banarasi Silk', occasion: 'Festive, Reception', palette: { primary: '#0E4D4A', secondary: '#083634', accent: '#E4C97A' }, description: 'A striking teal Banarasi with a jaal of paisley butis and a rich gold border.', highlights: ['All-over paisley buti jaal', 'Floral vine pallu', 'Rich zari border', 'Weight: 900g'], stock: 7 },
  ],
  kanjivaram: [
    { name: 'Sunehri Rekha Kanjivaram', price: 21999, mrp: 27999, fabric: 'Pure Kanjivaram Silk', occasion: 'Wedding, Festive', bestseller: true, palette: { primary: '#3A5A40', secondary: '#24382A', accent: '#E4C97A' }, description: 'A temple-town classic in deep forest green with a broad gold zari border.', highlights: ['Korvai weave technique', 'Temple border design', 'Peacock motif pallu', 'Weight: 780g'], stock: 4 },
  ],
  chanderi: [
    { name: 'Chandani Chanderi Blush', price: 6499, mrp: 8999, fabric: 'Chanderi Silk Cotton', occasion: 'Day Function, Office', isNew: true, palette: { primary: '#E8B4B8', secondary: '#D492A0', accent: '#9C7C33' }, description: 'Featherlight Chanderi weave with delicate gold booti work scattered across the body.', highlights: ['Sheer, lightweight drape', 'Hand-block booti detailing', 'Breathable all-day wear', 'Weight: 320g'], stock: 12 },
    { name: 'Vasundhara Chanderi Mint', price: 5999, mrp: 7499, fabric: 'Chanderi Silk Cotton', occasion: 'Day Function, Brunch', isNew: true, palette: { primary: '#A8C3A0', secondary: '#7FA377', accent: '#9C7C33' }, description: 'A cool mint Chanderi with a delicate gold tissue border and floral sprigs.', highlights: ['Hand-embroidered floral sprigs', 'Tissue-gold border', 'Naturally wrinkle resistant', 'Weight: 340g'], stock: 14 },
  ],
  linen: [
    { name: 'Angoori Linen Ivory', price: 3299, mrp: 4199, fabric: 'Pure Linen', occasion: 'Office, Casual', bestseller: true, palette: { primary: '#F0E6D6', secondary: '#D8C7A8', accent: '#6B1E3C' }, description: 'A crisp linen weave in warm ivory with a slim maroon-and-gold border.', highlights: ['100% breathable linen', 'Slim contrast border', 'Easy pleats, low maintenance', 'Weight: 400g'], stock: 20 },
    { name: 'Kunji Linen Mustard', price: 3499, mrp: 4499, fabric: 'Pure Linen', occasion: 'Office, Casual', palette: { primary: '#C99A3B', secondary: '#9C7526', accent: '#4A1329' }, description: 'Sunny mustard linen with a slim maroon piping border.', highlights: ['Sun-fast mustard dye', 'Slim piping border', 'Crease-resistant weave', 'Weight: 390g'], stock: 18 },
  ],
  georgette: [
    { name: 'Neelambari Georgette Flow', price: 5299, mrp: 6999, fabric: 'Georgette', occasion: 'Cocktail, Evening', isNew: true, palette: { primary: '#1F2A44', secondary: '#131A2C', accent: '#E4C97A' }, description: 'A fluid georgette saree in midnight navy with a sequinned border.', highlights: ['Sequin & thread embroidery', 'Flowy, wrinkle-resistant fabric', 'Stitched-ready blouse fabric', 'Weight: 480g'], stock: 9 },
    { name: 'Rani Bandhani Chunri', price: 4799, mrp: 5999, fabric: 'Georgette Bandhani', occasion: 'Festive, Sangeet', palette: { primary: '#C2185B', secondary: '#8E123F', accent: '#E4C97A' }, description: 'Traditional Rajasthani bandhani tie-dye in vivid rani pink with gota-patti lace.', highlights: ['Authentic hand tie-dye bandhani', 'Gota-patti lace border', 'Vibrant colourfast dyes', 'Weight: 420g'], stock: 15 },
    { name: 'Sitara Georgette Sequin', price: 7499, mrp: 9499, fabric: 'Georgette', occasion: 'Party, Cocktail', isNew: true, palette: { primary: '#1B1B1B', secondary: '#0C0C0C', accent: '#E4C97A' }, description: 'Midnight black georgette scattered with hand-sewn star sequins.', highlights: ['All-over star sequin scatter', 'Contemporary drape', 'Net blouse piece included', 'Weight: 460g'], stock: 11 },
  ],
  bridal: [
    { name: 'Ashirwad Bridal Kanjivaram', price: 42999, mrp: 54999, fabric: 'Pure Kanjivaram Silk with Zari', occasion: 'Wedding', bestseller: true, palette: { primary: '#4A1329', secondary: '#2F0C1A', accent: '#E4C97A' }, description: 'Our most treasured bridal weave — dense gold zari and a temple procession pallu.', highlights: ['90g pure silver zari, gold-plated', 'Temple procession pallu motif', 'Keepsake box + certificate', 'Weight: 1100g'], stock: 3 },
    { name: 'Panchhi Bridal Red', price: 36999, mrp: 46999, fabric: 'Pure Kanjivaram Silk with Zari', occasion: 'Wedding', bestseller: true, palette: { primary: '#8A0F1F', secondary: '#5C0A15', accent: '#E4C97A' }, description: 'The timeless bridal red, woven with a continuous parrot-and-vine motif.', highlights: ['Parrot-vine woven motif', 'Wide 6-inch zari border', 'Matching zari blouse piece', 'Weight: 1050g'], stock: 5 },
  ],
}

async function seed() {
  await sequelize.sync({ force: true })
  console.log('⚠️  Database reset (force sync) — seeding fresh data...')

  // ---- Admin & superadmin users ----
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10)
  await User.create({
    name: 'Jhanvika Admin',
    email: process.env.ADMIN_EMAIL || 'admin@jhanvika.example',
    password: adminPassword,
    role: 'superadmin',
    emailVerified: true,
  })

  const demoCustomerPassword = await bcrypt.hash('Customer@123', 10)
  await User.create({
    name: 'Ananya Reddy',
    email: 'demo@jhanvika.example',
    password: demoCustomerPassword,
    phone: '9876543210',
    role: 'customer',
    emailVerified: true,
  })

  console.log('👤 Seeded admin + demo customer accounts')

  // ---- Categories ----
  const categoryRows = {}
  for (const cat of categories) {
    const row = await Category.create(cat)
    categoryRows[cat.slug] = row
  }
  console.log(`📁 Seeded ${categories.length} categories`)

  // ---- Products ----
  let productCount = 0
  for (const [slug, list] of Object.entries(productsByCategory)) {
    const category = categoryRows[slug]
    for (const p of list) {
      const productSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const product = await Product.create({
        name: p.name,
        slug: productSlug,
        sku: 'JHV-' + productSlug.toUpperCase().slice(0, 12),
        categoryId: category.id,
        price: p.price,
        mrp: p.mrp,
        fabric: p.fabric,
        occasion: p.occasion,
        description: p.description,
        highlights: p.highlights,
        stock: p.stock,
        weightGrams: Number((p.highlights.find((h) => h.includes('Weight')) || '').replace(/\D/g, '')) || null,
        rating: (4.3 + Math.random() * 0.6).toFixed(1),
        reviewsCount: Math.floor(30 + Math.random() * 180),
        bestseller: !!p.bestseller,
        isNew: !!p.isNew,
        paletteJson: p.palette,
        status: 'published',
      })
      // No binary image is uploaded in this seed — the frontend renders a
      // generated SVG swatch from paletteJson when no ProductImage rows exist.
      productCount += 1
      void ProductImage // referenced for clarity that this table exists for real uploads
    }
  }
  console.log(`🧵 Seeded ${productCount} products`)

  // ---- Coupons ----
  await Coupon.bulkCreate([
    { code: 'JHANVIKA10', type: 'percent', value: 10, minOrderValue: 0, usageLimit: null, isActive: true },
    { code: 'FESTIVE500', type: 'flat', value: 500, minOrderValue: 5000, usageLimit: 200, isActive: true },
    { code: 'BRIDAL2000', type: 'flat', value: 2000, minOrderValue: 20000, usageLimit: 50, isActive: true },
  ])
  console.log('🎟️  Seeded 3 coupons (try JHANVIKA10 at checkout)')

  // ---- Banners ----
  await Banner.bulkCreate([
    { title: 'Six Yards. Endless Stories.', subtitle: 'Handwoven since 1994', linkUrl: '/shop', position: 'home_hero', sortOrder: 0, isActive: true },
    { title: 'The Bridal Edit', subtitle: 'Heirlooms in the making', linkUrl: '/shop?category=bridal', position: 'home_offer', sortOrder: 0, isActive: true },
  ])
  console.log('🖼️  Seeded banners')

  // ---- CMS pages ----
  await CmsPage.bulkCreate([
    { slug: 'about-us', title: 'Our Story', content: 'Jhanvika began in 1994 in a small workshop behind Varanasi\'s ghats...' },
    { slug: 'privacy-policy', title: 'Privacy Policy', content: 'We respect your privacy and only collect data necessary to process your orders...' },
    { slug: 'terms', title: 'Terms & Conditions', content: 'By using this website you agree to the following terms...' },
    { slug: 'return-policy', title: 'Return Policy', content: 'Items can be returned within 7 days of delivery, unworn and with tags attached...' },
    { slug: 'shipping-policy', title: 'Shipping Policy', content: 'We ship across India within 4-7 business days. Free shipping above ₹2,999...' },
  ])
  console.log('📄 Seeded CMS pages')

  // ---- Settings ----
  await Setting.bulkCreate([
    { key: 'site_name', value: 'Jhanvika', group: 'general' },
    { key: 'support_email', value: 'hello@jhanvika.example', group: 'general' },
    { key: 'support_phone', value: '+91 98765 43210', group: 'general' },
    { key: 'free_shipping_threshold', value: '2999', group: 'shipping' },
    { key: 'flat_shipping_fee', value: '149', group: 'shipping' },
    { key: 'gst_percent', value: '5', group: 'tax' },
    { key: 'instagram_url', value: 'https://instagram.com', group: 'social' },
    { key: 'facebook_url', value: 'https://facebook.com', group: 'social' },
  ])
  console.log('⚙️  Seeded settings')

  console.log('\n✅ Seed complete!')
  console.log(`   Admin login  → ${process.env.ADMIN_EMAIL || 'admin@jhanvika.example'} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`)
  console.log('   Demo user    → demo@jhanvika.example / Customer@123')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
