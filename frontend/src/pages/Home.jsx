import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Truck, ShieldCheck, RotateCcw } from 'lucide-react'
import Hero from '../components/Hero.jsx'
import Seo from '../components/Seo.jsx'
import CategoryStrip from '../components/CategoryStrip.jsx'
import BridalEdit from '../components/BridalEdit.jsx'
import NewArrivalsSection from '../components/NewArrivalsSection.jsx'
import OccasionSection from '../components/OccasionSection.jsx'
// import Testimonials from '../components/Testimonials.jsx'
import Newsletter from '../components/Newsletter.jsx'
import BestsellersSection from '../components/BestsellersSection.jsx'
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
      productsApi.list({ bestseller: true, limit: 8 }),
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

      <BestsellersSection bestsellers={bestsellers} />

      {bridal.length > 0 && (
        <BridalEdit bridal={bridal} />
      )}

      <OccasionSection />

      <NewArrivalsSection newArrivals={newArrivals} />

      {/* <Testimonials /> */}
      <Newsletter />
    </div>
  )
}
