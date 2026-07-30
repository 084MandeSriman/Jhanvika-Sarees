import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Heart, Loader2, Minus, Plus, Shield, ShoppingBag, Star, Truck } from 'lucide-react'
import ProductVisual from '../components/ProductVisual.jsx'
import ProductCard from '../components/ProductCard.jsx'
import RecentlyViewedSection from '../components/RecentlyViewedSection.jsx'
import Seo from '../components/Seo.jsx'
import { productsApi } from '../api/products.js'
import { recentlyViewedApi } from '../api/cart.js'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const blousePieces = ['Unstitched (Matching)', 'Unstitched (Contrast)', 'No Blouse Piece']
const tabs = ['Description', 'Highlights', 'Shipping & Returns']

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [qty, setQty] = useState(1)
  const [blouse, setBlouse] = useState(blousePieces[0])
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [activeThumb, setActiveThumb] = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    setProduct(null)
    productsApi
      .getBySlug(slug)
      .then((res) => {
        setProduct(res.data)
        return productsApi.related(slug)
      })
      .then((res) => setRelated(res?.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product) return
    if (user) {
      recentlyViewedApi.track(product.id).catch(() => {})
    } else {
      try {
        const raw = localStorage.getItem('jhanvika_recently_viewed')
        const ids = raw ? JSON.parse(raw) : []
        const next = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 10)
        localStorage.setItem('jhanvika_recently_viewed', JSON.stringify(next))
      } catch {
        // ignore
      }
    }
  }, [product, user])

  if (loading) {
    return (
      <div className="container-px py-24 text-center">
        <Loader2 className="mx-auto animate-spin text-maroon" size={28} />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-px py-24 text-center">
        <p className="font-display text-3xl text-maroon">Product not found</p>
        <p className="text-ink/50 mt-2 font-body text-sm">{error && `Could not reach the backend: ${error}`}</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Back to Shop</Link>
      </div>
    )
  }

  const price = Number(product.price)
  const mrp = Number(product.mrp)
  const wished = isWished(product.id)
  const outOfStock = product.stock <= 0

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Jhanvika' },
    aggregateRating: product.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${window.location.origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${window.location.origin}/shop` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${window.location.origin}/product/${product.slug}` },
    ],
  }

  function handleAddToCart() {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleBuyNow() {
    addItem(product, qty)
    navigate('/checkout')
  }

  return (
    <div className="container-px py-10">
      <Seo
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.description}
        path={`/product/${product.slug}`}
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <nav className="text-xs text-ink/45 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-maroon">Home</Link> /
        <Link to="/shop" className="hover:text-maroon">Shop</Link> /
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <motion.div
            key={activeThumb}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl overflow-hidden shadow-card aspect-[4/5]"
            style={{ transform: activeThumb === 1 ? 'scaleX(-1)' : activeThumb === 2 ? 'rotate(1deg)' : 'none' }}
          >
            <ProductVisual product={product} imageIndex={activeThumb} className="w-full h-full object-cover" />
          </motion.div>
          <div className="flex gap-3 mt-4">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeThumb === i ? 'border-maroon' : 'border-transparent'}`}
                style={{ transform: i === 1 ? 'scaleX(-1)' : 'none' }}
              >
                <ProductVisual product={product} imageIndex={i} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow">{product.fabric}</span>
          <h1 className="font-display text-4xl text-maroon mt-2">{product.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-ink/20'} />
              ))}
            </div>
            <span className="text-sm text-ink/55">{Number(product.rating).toFixed(1)} · {product.reviewsCount} reviews</span>
          </div>

          {outOfStock && (
            <span className="inline-flex items-center gap-1.5 mt-4 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Out of Stock
            </span>
          )}

          <div className="flex items-center gap-3 mt-5">
            <span className="font-display text-3xl text-maroon">₹{price.toLocaleString('en-IN')}</span>
            {mrp > price && (
              <>
                <span className="text-ink/40 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                <span className="text-forest text-sm font-medium">{Math.round(((mrp - price) / mrp) * 100)}% off</span>
              </>
            )}
          </div>
          <p className="text-xs text-ink/45 mt-1">Inclusive of all taxes. Free shipping above ₹2,999.</p>

          <p className="text-ink/65 font-body mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-6">
            <h4 className="font-body text-sm tracking-widest uppercase text-ink/70 mb-3">Blouse Piece</h4>
            <div className="flex flex-wrap gap-2">
              {blousePieces.map((b) => (
                <button key={b} onClick={() => setBlouse(b)} className={`text-xs px-4 py-2 rounded-full border transition-colors ${blouse === b ? 'bg-maroon text-ivory border-maroon' : 'border-ink/20 text-ink/70 hover:border-maroon'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex items-center gap-4 mt-8 ${outOfStock ? 'opacity-40 pointer-events-none select-none' : ''}`}>
            <div className="flex items-center border border-ink/20 rounded-full">
              <button className="p-3 hover:text-maroon" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={outOfStock}><Minus size={16} /></button>
              <span className="w-8 text-center font-body">{qty}</span>
              <button
                className="p-3 hover:text-maroon"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                aria-label="Increase quantity"
                disabled={outOfStock || qty >= product.stock}
              >
                <Plus size={16} />
              </button>
            </div>
            {!outOfStock && (
              <span className="text-xs text-ink/50">{product.stock} pieces left in stock</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {outOfStock ? (
              <>
                <button
                  disabled
                  className="btn-outline flex-1 opacity-40 cursor-not-allowed"
                >
                  <span className="flex items-center gap-2"><ShoppingBag size={16} /> Add to Bag</span>
                </button>
                <button
                  disabled
                  className="btn-primary flex-1 opacity-40 cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => toggle(product.id)}
                  aria-label="Toggle wishlist"
                  className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 transition-colors ${wished ? 'border-maroon bg-maroon/5' : 'border-ink/20'}`}
                >
                  <Heart size={18} className={wished ? 'fill-maroon text-maroon' : 'text-ink/60'} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleAddToCart} className="btn-outline flex-1">
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Check size={16} /> Added to Bag
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <ShoppingBag size={16} /> Add to Bag
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button onClick={handleBuyNow} className="btn-primary flex-1">Buy Now</button>
                <button
                  onClick={() => toggle(product.id)}
                  aria-label="Toggle wishlist"
                  className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 transition-colors ${wished ? 'border-maroon bg-maroon/5' : 'border-ink/20'}`}
                >
                  <Heart size={18} className={wished ? 'fill-maroon text-maroon' : 'text-ink/60'} />
                </button>
              </>
            )}
          </div>

          {outOfStock && (
            <button className="mt-3 w-full flex items-center justify-center gap-2 border border-maroon/40 text-maroon text-sm font-medium py-3 rounded-full hover:bg-maroon/5 transition-colors">
              <Bell size={15} /> Notify Me When Available
            </button>
          )}

          {!outOfStock && (
            <div className="grid grid-cols-2 gap-4 mt-8 border-t border-ink/10 pt-6">
              <div className="flex items-center gap-2 text-sm text-ink/60"><Truck size={18} className="text-maroon" /> Delivered in 4-7 days</div>
              <div className="flex items-center gap-2 text-sm text-ink/60"><Shield size={18} className="text-maroon" /> 100% Authentic Weave</div>
            </div>
          )}

          <div className="mt-10">
            <div className="flex gap-6 border-b border-ink/10">
              {tabs.map((t) => (
                <button key={t} onClick={() => setActiveTab(t)} className={`pb-3 text-sm font-body transition-colors ${activeTab === t ? 'text-maroon border-b-2 border-maroon' : 'text-ink/50'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="py-6 text-sm text-ink/65 leading-relaxed font-body">
              {activeTab === 'Description' && <p>{product.description} Occasion: {product.occasion}.</p>}
              {activeTab === 'Highlights' && (
                <ul className="space-y-2">
                  {(product.highlights || []).map((h) => (
                    <li key={h} className="flex items-start gap-2"><Check size={16} className="text-forest mt-0.5 shrink-0" /> {h}</li>
                  ))}
                </ul>
              )}
              {activeTab === 'Shipping & Returns' && (
                <p>
                  Orders are dispatched within 24-48 hours and delivered in 4-7 business days across India.
                  We offer a 7-day easy return window from the date of delivery — the saree must be unworn,
                  unwashed, and with original tags intact.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-8 text-center">You May Also Love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      <RecentlyViewedSection excludeId={product.id} />
    </div>
  )
}
