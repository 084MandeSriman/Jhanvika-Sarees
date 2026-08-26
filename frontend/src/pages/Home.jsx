import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
