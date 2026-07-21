import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Loader2 } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { productsApi } from '../api/products.js'

export default function Wishlist() {
  const { ids } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    productsApi
      .list({ ids: ids.join(','), limit: 48 })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [ids])

  if (loading) {
    return (
      <div className="container-px py-24 text-center">
        <Loader2 className="mx-auto animate-spin text-maroon" size={28} />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="container-px py-24 text-center">
        <Heart size={40} className="mx-auto text-maroon/40 mb-4" />
        <h1 className="font-display text-3xl text-maroon">Your wishlist is empty</h1>
        <p className="text-ink/55 mt-2 font-body">Tap the heart on any saree to save it here.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Explore Collection</Link>
      </div>
    )
  }

  return (
    <div className="container-px py-10">
      <h1 className="section-title mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  )
}
