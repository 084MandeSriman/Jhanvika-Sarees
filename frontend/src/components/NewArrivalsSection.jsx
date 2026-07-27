import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard.jsx'

export default function NewArrivalsSection({ newArrivals }) {
  if (newArrivals.length === 0) return null

  return (
    <section className="container-px py-16">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="eyebrow">Fresh on the Loom</span>
        <h2 className="section-title mt-3">New Arrivals</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
        {newArrivals.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm text-maroon hover:gap-2 transition-all"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
