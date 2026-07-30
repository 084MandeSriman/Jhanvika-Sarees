import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Minus, Plus, ShoppingBag, ShoppingCart, X } from 'lucide-react'
import ProductVisual from '../components/ProductVisual.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Cart() {
  const { items, savedItems, updateQty, removeItem, saveForLater, moveToCart, subtotal } = useCart()
  const { user } = useAuth()
  const shipping = subtotal >= 2999 || subtotal === 0 ? 0 : 149
  const total = subtotal + shipping

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="container-px py-24 text-center">
        <ShoppingBag size={40} className="mx-auto text-maroon/40 mb-4" />
        <h1 className="font-display text-3xl text-maroon">Your bag is empty</h1>
        <p className="text-ink/55 mt-2 font-body">Looks like you haven't draped anything yet.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Explore Collection</Link>
      </div>
    )
  }

  return (
    <div className="container-px py-10">
      <h1 className="section-title mb-8">Your Bag</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.length === 0 && (
            <p className="text-sm text-ink/50 font-body">No items in your active bag — check your saved items below.</p>
          )}
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="flex gap-4 bg-sand/60 rounded-2xl p-4"
              >
                <div className="w-24 h-28 rounded-xl overflow-hidden shrink-0 shadow-card">
                  <ProductVisual product={item} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/product/${item.slug || item.id}`} className="font-body text-ink hover:text-maroon">{item.name}</Link>
                      <p className="text-xs text-ink/50 mt-1">{item.fabric}</p>
                      {item.stock === 0 && (
                        <p className="text-xs text-red-600 font-medium mt-1">Out of stock — remove to proceed</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.key)} aria-label="Remove item" className="text-ink/40 hover:text-maroon">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center border border-ink/15 rounded-full bg-ivory">
                      <button className="p-2 hover:text-maroon" onClick={() => updateQty(item.key, item.qty - 1)} aria-label="Decrease quantity">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-7 text-center">{item.qty}</span>
                      <button className="p-2 hover:text-maroon" onClick={() => updateQty(item.key, item.qty + 1)} aria-label="Increase quantity">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-body text-maroon">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                  {user && (
                    <button onClick={() => saveForLater(item.key)} className="flex items-center gap-1 text-xs text-ink/45 hover:text-maroon mt-3 self-start">
                      <Bookmark size={13} /> Save for later
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {user && savedItems.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-xl text-maroon mb-4">Saved for Later ({savedItems.length})</h2>
              <div className="flex flex-col gap-4">
                {savedItems.map((item) => (
                  <div key={item.key} className="flex gap-4 bg-ivory border border-ink/10 rounded-2xl p-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 shadow-card opacity-80">
                      <ProductVisual product={item} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/product/${item.slug || item.id}`} className="font-body text-ink hover:text-maroon">{item.name}</Link>
                        <p className="text-sm text-ink/50 mt-1">₹{Number(item.price).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => moveToCart(item.key)} className="flex items-center gap-1 text-xs text-maroon hover:underline">
                          <ShoppingCart size={13} /> Move to Bag
                        </button>
                        <button onClick={() => removeItem(item.key)} className="text-xs text-ink/40 hover:text-red-600">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="bg-sand/60 rounded-2xl p-6 h-fit sticky top-28">
            <h2 className="font-display text-2xl text-maroon mb-5">Order Summary</h2>
            <div className="flex justify-between text-sm text-ink/65 mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-ink/65 mb-2">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            <p className="text-[11px] text-ink/40 mb-4">GST is calculated at checkout based on current rates.</p>
            <div className="border-t border-ink/10 my-4" />
            <div className="flex justify-between font-body text-lg text-maroon mb-6">
              <span>Estimated Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            {items.some((i) => i.stock === 0) ? (
              <>
                <button disabled className="btn-primary w-full opacity-40 cursor-not-allowed">Proceed to Checkout</button>
                <p className="text-xs text-red-600 mt-2 text-center">Remove out-of-stock items to continue.</p>
              </>
            ) : (
              <Link to="/checkout" className="btn-primary w-full">Proceed to Checkout</Link>
            )}
            <Link to="/shop" className="block text-center text-sm text-ink/60 hover:text-maroon mt-4">Continue Shopping</Link>
          </div>
        )}
      </div>
    </div>
  )
}
