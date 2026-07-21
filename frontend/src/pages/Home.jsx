import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import Hero from '../components/Hero.jsx'
import Seo from '../components/Seo.jsx'
import CategoryStrip from '../components/CategoryStrip.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductVisual from '../components/ProductVisual.jsx'
import Testimonials from '../components/Testimonials.jsx'
import Newsletter from '../components/Newsletter.jsx'
import { productsApi } from '../api/products.js'

const perks = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹2,999' },
  { icon: ShieldCheck, title: 'Authenticity Certified', desc: 'Every weave verified' },
  { icon: RotateCcw, title: '7-Day Easy Returns', desc: 'No questions asked' },
  { icon: Sparkles, title: 'Gift Wrapping', desc: 'Complimentary on request' },
]

export default function Home() {
  const [bestsellers, setBestsellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bridal, setBridal] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      productsApi.list({ bestseller: true, limit: 4 }),
      productsApi.list({ isNew: true, limit: 4 }),
      productsApi.list({ category: 'bridal', limit: 2 }),
    ])
      .then(([b, n, br]) => {
        setBestsellers(b.data)
        setNewArrivals(n.data)
        setBridal(br.data)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <Seo path="/" />
      <Hero />

      <section className="container-px -mt-10 relative z-20">
        <div className="bg-ivory rounded-2xl shadow-soft grid grid-cols-2 md:grid-cols-4 divide-x divide-ink/10">
          {perks.map((p) => (
            <div key={p.title} className="flex flex-col items-center text-center gap-2 py-6 px-3">
              <p.icon size={22} className="text-maroon" />
              <p className="font-body text-sm text-ink">{p.title}</p>
              <p className="text-xs text-ink/50">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CategoryStrip />

      {error && (
        <div className="container-px">
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">
            Could not load products from the backend ({error}). Make sure the API is running on localhost:5000 and you've run <code>npm run seed</code>.
          </p>
        </div>
      )}

      {bestsellers.length > 0 && (
        <section className="container-px py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="eyebrow">Most Loved</span>
              <h2 className="section-title mt-3">Bestsellers</h2>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm text-maroon hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {bestsellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {bridal.length > 0 && (
        <section className="bg-blush/20 py-16">
          <div className="container-px grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="eyebrow">The Bridal Edit</span>
              <h2 className="section-title mt-3">Heirlooms in the Making</h2>
              <p className="text-ink/65 font-body mt-5 leading-relaxed max-w-md">
                Every Jhanvika bridal weave takes upward of 25 days on the loom. Dense zari,
                temple motifs, and a keepsake box designed to be opened again, decades from now.
              </p>
              <Link to="/shop?category=bridal" className="btn-primary mt-8 inline-flex">
                Explore Bridal Edit <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-2 gap-4">
              {bridal.map((p, idx) => (
                <Link key={p.id} to={`/product/${p.slug}`} className={`rounded-2xl overflow-hidden shadow-card aspect-[4/5] ${idx === 1 ? 'mt-8' : ''}`}>
                  <ProductVisual product={p} className="w-full h-full object-cover" />
                </Link>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="container-px py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="eyebrow">Fresh on the Loom</span>
              <h2 className="section-title mt-3">New Arrivals</h2>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm text-maroon hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      <Testimonials />
      <Newsletter />
    </div>
  )
}
