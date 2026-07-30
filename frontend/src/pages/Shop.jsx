import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard.jsx'
import Seo from '../components/Seo.jsx'
import { categoriesApi, productsApi } from '../api/products.js'

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const activeCategory = params.get('category') || 'all'
  const activeOccasion = params.get('occasion') || ''
  const [sort, setSort] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(50000)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    const query = {
      limit: 48,
      maxPrice,
      sort: sort === 'featured' ? 'bestseller' : sort,
    }
    if (activeCategory !== 'all') query.category = activeCategory
    if (activeOccasion) query.occasion = activeOccasion
    productsApi
      .list(query)
      .then((res) => {
        setProducts(res.data)
        setTotal(res.meta?.total ?? res.data.length)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeCategory, activeOccasion, sort, maxPrice])

  function setCategory(id) {
    if (id === 'all') params.delete('category')
    else params.set('category', id)
    setParams(params)
  }

  const activeCategoryName = useMemo(
    () => categories.find((c) => c.slug === activeCategory)?.name || 'All Sarees',
    [categories, activeCategory]
  )

  return (
    <div className="container-px py-10">
      <Seo
        title={activeCategoryName === 'All Sarees' ? 'Shop All Sarees' : activeCategoryName}
        description={`Shop ${activeCategoryName} at Jhanvika — handwoven sarees delivered across India.`}
        path={activeCategory !== 'all' ? `/shop?category=${activeCategory}` : '/shop'}
      />
      <div className="mb-8">
        <span className="eyebrow">Collections</span>
        <h1 className="section-title mt-2">{activeCategoryName}</h1>
        <p className="text-ink/55 font-body mt-2">{loading ? 'Loading...' : `${total} sarees found`}</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel categories={categories} activeCategory={activeCategory} setCategory={setCategory} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setFiltersOpen(true)} className="lg:hidden inline-flex items-center gap-2 text-sm border border-ink/20 px-4 py-2 rounded-full">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-auto bg-ivory border border-ink/20 rounded-full px-4 py-2 text-sm outline-none">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">Could not load products: {error}. Is the backend running on localhost:5000?</p>}

          {!loading && products.length === 0 && !error ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-maroon">No sarees match these filters</p>
              <p className="text-ink/50 mt-2 font-body">Try widening your price range or picking another weave.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-ink/50 z-50" onClick={() => setFiltersOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed left-0 top-0 bottom-0 w-80 bg-ivory z-50 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-maroon">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={20} /></button>
              </div>
              <FilterPanel categories={categories} activeCategory={activeCategory} setCategory={(id) => { setCategory(id); setFiltersOpen(false) }} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterPanel({ categories, activeCategory, setCategory, maxPrice, setMaxPrice }) {
  return (
    <div>
      <div className="mb-8">
        <h4 className="font-body text-sm tracking-widest uppercase text-ink/70 mb-4">Category</h4>
        <div className="flex flex-col gap-2">
          <button onClick={() => setCategory('all')} className={`text-left text-sm py-1.5 ${activeCategory === 'all' ? 'text-maroon font-medium' : 'text-ink/60 hover:text-maroon'}`}>
            All Sarees
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={`text-left text-sm py-1.5 ${activeCategory === c.slug ? 'text-maroon font-medium' : 'text-ink/60 hover:text-maroon'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-body text-sm tracking-widest uppercase text-ink/70 mb-4">Max Price</h4>
        <input type="range" min="2000" max="50000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-maroon" />
        <p className="text-sm text-ink/60 mt-2">Up to ₹{maxPrice.toLocaleString('en-IN')}</p>
      </div>
    </div>
  )
}
