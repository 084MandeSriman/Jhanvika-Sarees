import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import ProductVisual from './ProductVisual.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const wished = isWished(product.id)
  const price = Number(product.price)
  const mrp = Number(product.mrp)
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
  const outOfStock = Number(product.stock) <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
      className="group relative"
    >
      <div className="relative flex flex-col rounded-t-[999px] rounded-b-2xl border border-ink/10 bg-sand p-1.5 shadow-card transition-shadow duration-300 hover:shadow-[0_25px_45px_-20px_rgba(0,0,0,0.25)]">
        {/* decorative flourish at the peak of the arch */}
        <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-gold text-sm">
          ❖
        </span>

        <Link
          to={`/product/${product.slug}`}
          className="relative block overflow-hidden rounded-t-[999px] rounded-b-md"
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.5 }}
            className="aspect-[4/5] overflow-hidden"
          >
            <ProductVisual product={product} className="w-full h-full object-cover" />
          </motion.div>

          <div className="absolute left-1/2 top-4 -translate-x-1/2 flex flex-col items-center gap-2">
            {outOfStock ? (
              <span className="inline-flex items-center rounded-full bg-ink/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-ivory shadow-sm">
                Out of Stock
              </span>
            ) : discount > 0 && (
              <span className="inline-flex items-center rounded-full bg-maroon px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-ivory shadow-sm">
                {discount}% OFF
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault()
                toggle(product.id)
              }}
              aria-label="Toggle wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-ink/10 shadow-sm transition-transform duration-200 hover:scale-105"
            >
              <Heart size={16} className={wished ? 'fill-maroon text-maroon' : 'text-ink/60'} />
            </button>
          </div>
        </Link>

        <div className="flex flex-1 flex-col px-3 pb-2 pt-3 text-center">
          <Link
            to={`/product/${product.slug}`}
            className="font-heading text-base text-ink hover:text-maroon line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-xs text-ink/55 mt-1">{product.fabric}</p>

          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-ink/70">
            <Star size={13} className="fill-gold text-gold" />
            <span className="font-medium">{Number(product.rating).toFixed(1)}</span>
            <span className="text-ink/40">({product.reviewsCount})</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-base font-semibold text-maroon">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {mrp > price && (
              <span className="text-sm text-ink/35 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {outOfStock ? (
            <span className="mt-3 flex items-center justify-center gap-2 border-t border-ink/10 pt-2 text-xs font-semibold uppercase tracking-wide text-ink/30 cursor-not-allowed select-none">
              <ShoppingBag size={14} />
              Out of Stock
            </span>
          ) : (
            <button
              onClick={() => addItem(product, 1)}
              className="mt-3 flex items-center justify-center gap-2 border-t border-ink/10 pt-2 text-xs font-semibold uppercase tracking-wide text-ink/80 transition-colors hover:text-maroon"
            >
              <ShoppingBag size={14} />
              Add to Bag
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}