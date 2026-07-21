import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import { recentlyViewedApi } from '../api/cart.js'
import { productsApi } from '../api/products.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function RecentlyViewedSection({ excludeId }) {
  const { user } = useAuth()
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function load() {
      try {
        if (user) {
          const res = await recentlyViewedApi.list()
          setProducts(res.data.filter((p) => p.id !== excludeId))
        } else {
          const raw = localStorage.getItem('jhanvika_recently_viewed')
          const ids = (raw ? JSON.parse(raw) : []).filter((id) => id !== excludeId)
          if (ids.length === 0) return setProducts([])
          const res = await productsApi.list({ ids: ids.join(','), limit: 10 })
          setProducts(res.data)
        }
      } catch {
        setProducts([])
      }
    }
    load()
  }, [user, excludeId])

  if (products.length === 0) return null

  return (
    <section className="mt-20">
      <h2 className="section-title mb-8">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
        {products.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  )
}
