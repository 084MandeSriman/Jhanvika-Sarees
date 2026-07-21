import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, LayoutDashboard, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { productsApi } from '../api/products.js'
import { searchApi } from '../api/cart.js'

const links = [
  { to: '/shop', label: 'Shop All' },
  { to: '/shop?category=banarasi', label: 'Banarasi' },
  { to: '/shop?category=kanjivaram', label: 'Kanjivaram' },
  { to: '/shop?category=bridal', label: 'Bridal Edit' },
  { to: '/about', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [trending, setTrending] = useState([])
  const { count, setIsOpen } = useCart()
  const { ids } = useWishlist()
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    if (searchOpen) {
      searchApi.trending().then((res) => setTrending(res.data)).catch(() => {})
    }
  }, [searchOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const handle = setTimeout(() => {
      productsApi.list({ search: query, limit: 5 }).then((res) => setResults(res.data)).catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(handle)
  }, [query])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-ivory/95 backdrop-blur shadow-card' : 'bg-ivory'
      }`}
    >
      <div className="container-px flex items-center justify-between py-4">
        <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={24} className="text-ink" />
        </button>

        <Link to="/" className="flex flex-col items-center lg:items-start">
          <span className="font-wordmark text-2xl md:text-3xl text-maroon tracking-wide">Jhanvika</span>
          <span className="hidden md:block text-[10px] tracking-[0.35em] uppercase text-gold-dark -mt-1">
            Sarees &amp; Story
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `text-sm tracking-wide uppercase font-body transition-colors hover:text-maroon ${
                  isActive ? 'text-maroon' : 'text-ink/70'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-5">
          <button aria-label="Search" onClick={() => setSearchOpen(true)} className="text-ink hover:text-maroon transition-colors">
            <Search size={22} />
          </button>
          <Link to={user ? '/account' : '/login'} aria-label="Account" className="text-ink hover:text-maroon transition-colors hidden sm:block">
            <User size={22} />
          </Link>
          {isAdmin && (
            <Link to="/admin" aria-label="Admin dashboard" className="text-ink hover:text-maroon transition-colors hidden sm:block">
              <LayoutDashboard size={22} />
            </Link>
          )}
          <Link to="/wishlist" aria-label="Wishlist" className="relative text-ink hover:text-maroon transition-colors">
            <Heart size={22} />
            {ids.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-maroon text-ivory text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {ids.length}
              </span>
            )}
          </Link>
          <button aria-label="Cart" onClick={() => setIsOpen(true)} className="relative text-ink hover:text-maroon transition-colors">
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/50 z-50"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-ivory z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-wordmark text-2xl text-maroon">Jhanvika</span>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>
              <div className="flex flex-col gap-5">
                {links.map((l) => (
                  <NavLink
                    key={l.label}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="text-base tracking-wide uppercase font-body text-ink/80 hover:text-maroon"
                  >
                    {l.label}
                  </NavLink>
                ))}
                <div className="border-t border-ink/10 pt-5">
                  <NavLink to={user ? '/account' : '/login'} onClick={() => setMenuOpen(false)} className="text-base tracking-wide uppercase font-body text-ink/80 hover:text-maroon">
                    {user ? 'My Account' : 'Sign In'}
                  </NavLink>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 z-50 bg-ivory shadow-soft"
          >
            <div className="container-px py-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 border-b border-ink/20 pb-3">
                <Search size={20} className="text-ink/50" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for Banarasi, Kanjivaram, bridal edit..."
                  className="flex-1 bg-transparent outline-none font-body text-lg placeholder:text-ink/40"
                />
                <button onClick={() => { setSearchOpen(false); setQuery('') }} aria-label="Close search">
                  <X size={22} />
                </button>
              </div>
              {results.length > 0 && (
                <div className="mt-4 flex flex-col divide-y divide-ink/10">
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      to={`/product/${r.slug}`}
                      onClick={() => { setSearchOpen(false); setQuery('') }}
                      className="py-3 flex items-center justify-between hover:text-maroon"
                    >
                      <span className="font-body">{r.name}</span>
                      <span className="text-sm text-ink/50">₹{Number(r.price).toLocaleString('en-IN')}</span>
                    </Link>
                  ))}
                </div>
              )}
              {!query.trim() && trending.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs tracking-widest uppercase text-ink/40 mb-2">Trending Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((t) => (
                      <button
                        key={t}
                        onClick={() => setQuery(t)}
                        className="text-xs px-3 py-1.5 rounded-full border border-ink/15 text-ink/60 hover:border-maroon hover:text-maroon"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
