import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bookmark, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import SareeArt from './SareeArt.jsx'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, removeItem, saveForLater, subtotal } = useCart()
  const { user } = useAuth()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-ivory z-50 flex flex-col shadow-soft"
          >
            <div className="flex items-center justify-between p-6 border-b border-ink/10">
              <h2 className="font-display text-2xl text-maroon flex items-center gap-2">
                <ShoppingBag size={20} /> Your Bag
              </h2>
              <button onClick={() => setIsOpen(false)} aria-label="Close cart">
                <X size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="font-body text-ink/60">Your bag is waiting to be draped in silk.</p>
                <Link to="/shop" onClick={() => setIsOpen(false)} className="btn-primary">
                  Explore Collection
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-4">
                      <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0 shadow-card">
                        <SareeArt palette={item.palette} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.slug || item.id}`}
                            onClick={() => setIsOpen(false)}
                            className="font-body text-sm text-ink hover:text-maroon leading-snug"
                          >
                            {item.name}
                          </Link>
                          <button onClick={() => removeItem(item.key)} aria-label="Remove item" className="text-ink/40 hover:text-maroon shrink-0">
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-ink/50 mt-1">{item.fabric}</p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center border border-ink/15 rounded-full">
                            <button
                              className="p-1.5 hover:text-maroon"
                              onClick={() => updateQty(item.key, item.qty - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm w-6 text-center">{item.qty}</span>
                            <button
                              className="p-1.5 hover:text-maroon"
                              onClick={() => updateQty(item.key, item.qty + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-body text-sm text-maroon">
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {user && (
                          <button
                            onClick={() => saveForLater(item.key)}
                            className="flex items-center gap-1 text-[11px] text-ink/45 hover:text-maroon mt-2"
                          >
                            <Bookmark size={11} /> Save for later
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-ink/10">
                  <div className="flex items-center justify-between mb-4 font-body">
                    <span className="text-ink/60">Subtotal</span>
                    <span className="text-lg text-maroon">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <Link to="/checkout" onClick={() => setIsOpen(false)} className="btn-primary w-full">
                    Proceed to Checkout
                  </Link>
                  <Link to="/cart" onClick={() => setIsOpen(false)} className="block text-center text-sm text-ink/60 hover:text-maroon mt-3">
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
