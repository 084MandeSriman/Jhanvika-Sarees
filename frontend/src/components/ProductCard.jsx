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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-card bg-sand">
        <Link to={`/product/${product.slug}`}>
          <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.5 }} className="aspect-[4/5] overflow-hidden">
            <ProductVisual product={product} className="w-full h-full object-cover" />
          </motion.div>
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-ivory/90 text-maroon text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">New</span>
          )}
          {discount > 0 && (
            <span className="bg-maroon text-ivory text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full">
              {discount}% off
            </span>
          )}
        </div>

        <button
          onClick={() => toggle(product.id)}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-ivory/90 flex items-center justify-center shadow-card hover:scale-110 transition-transform"
        >
          <Heart size={16} className={wished ? 'fill-maroon text-maroon' : 'text-ink/60'} />
        </button>

        <motion.button
          initial={{ y: 60, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => addItem(product, 1)}
          className="hidden md:flex absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-ink/90 text-ivory items-center justify-center gap-2 py-3 text-xs tracking-widest uppercase hover:bg-maroon"
        >
          <ShoppingBag size={14} /> Add to Bag
        </motion.button>
      </div>

      <div className="mt-3">
        <Link to={`/product/${product.slug}`} className="font-body text-sm text-ink hover:text-maroon line-clamp-1">
          {product.name}
        </Link>
        <p className="text-xs text-ink/50 mt-0.5">{product.fabric}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-gold text-gold" />
          <span className="text-xs text-ink/60">{Number(product.rating).toFixed(1)} ({product.reviewsCount})</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-body text-maroon">₹{price.toLocaleString('en-IN')}</span>
          {mrp > price && (
            <span className="text-xs text-ink/40 line-through">₹{mrp.toLocaleString('en-IN')}</span>
          )}
        </div>
        <button
          onClick={() => addItem(product, 1)}
          className="md:hidden mt-2 w-full text-xs tracking-widest uppercase border border-maroon text-maroon py-2 rounded-full"
        >
          Add to Bag
        </button>
      </div>
    </motion.div>
  )
}
