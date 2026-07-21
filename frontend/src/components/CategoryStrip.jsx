import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categoriesApi } from '../api/products.js'
import { resolveImageUrl } from '../api/config.js'

const visuals = {
  banarasi: {
    start: '#6B1E3C',
    end: '#E4C97A',
  },
  kanjivaram: {
    start: '#3A5A40',
    end: '#E4C97A',
  },
  chanderi: {
    start: '#E8B4B8',
    end: '#9C7C33',
  },
  linen: {
    start: '#F0E6D6',
    end: '#6B1E3C',
  },
  georgette: {
    start: '#1F2A44',
    end: '#E4C97A',
  },
  bridal: {
    start: '#4A1329',
    end: '#E4C97A',
  },
}

export default function CategoryStrip() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="container-px py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="eyebrow">Curated Edits</span>
        <h2 className="section-title mt-3">Shop by Weave</h2>
        <p className="text-ink/60 mt-4 font-body">
          Every region of India weaves its own language of silk. Find the one that speaks to you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {categories.map((cat, i) => {
          const style = visuals[cat.slug] || visuals.banarasi
          const imageUrl = cat.imageUrl ? resolveImageUrl(cat.imageUrl) : null

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group block text-ink transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="overflow-hidden rounded-[28px] shadow-card bg-sand">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      className="w-full h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="relative h-[420px] bg-cover bg-center"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${style.start} 0%, ${style.end} 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_35%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_30%)]" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm md:text-base font-medium text-ink">{cat.name}</p>
                  {cat.tagline && <p className="text-xs text-ink/50 mt-2">{cat.tagline}</p>}
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
