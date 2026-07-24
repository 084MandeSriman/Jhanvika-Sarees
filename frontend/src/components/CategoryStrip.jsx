import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categoriesApi } from '../api/products.js'
import { resolveImageUrl } from '../api/config.js'

const visuals = {
  banarasi: { start: '#6B1E3C', end: '#E4C97A' },
  kanjivaram: { start: '#3A5A40', end: '#E4C97A' },
  chanderi: { start: '#E8B4B8', end: '#9C7C33' },
  linen: { start: '#F0E6D6', end: '#6B1E3C' },
  georgette: { start: '#1F2A44', end: '#E4C97A' },
  bridal: { start: '#4A1329', end: '#E4C97A' },
}

// smaller cards, wide open fan — every card is the exact same size,
// only rotate/scale/lift change, so nothing ever looks like a different shape
const CARD_WIDTH = 300
const CARD_HEIGHT = 420

// only 2 cards on each side now (instead of 3). Rotation AND a horizontal
// shift move each card, so side cards sit next to the center one instead of
// buried underneath it — every card is fully visible, nothing chopped off
const SLOT_STYLES = {
  0: { rotate: 0, scale: 1.15, lift: -32, shiftX: 0, z: 3 },
  1: { rotate: 20, scale: 0.92, lift: 16, shiftX: 180, z: 2 },
  2: { rotate: 34, scale: 0.78, lift: 44, shiftX: 340, z: 1 },
}

const MAX_SLOT = 2 // only show active card + 2 on each side

function getSlot(diff) {
  const abs = Math.min(Math.abs(diff), MAX_SLOT)
  const base = SLOT_STYLES[abs]
  const sign = diff < 0 ? -1 : 1
  return { ...base, rotate: sign * base.rotate, shiftX: sign * base.shiftX }
}

// shortest signed distance between two slide indices on a circular track
function wrappedDiff(i, activeIndex, count) {
  let diff = i - activeIndex
  if (diff > count / 2) diff -= count
  if (diff < -count / 2) diff += count
  return diff
}

const AUTOPLAY_MS = 1500
const INITIAL_SLIDE = 4 // 5th slide is the featured/main one on load

export default function CategoryStrip() {
  const [categories, setCategories] = useState([])
  const [activeIndex, setActiveIndex] = useState(INITIAL_SLIDE)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    categoriesApi.list().then((res) => {
      setCategories(res.data)
      setActiveIndex(Math.min(INITIAL_SLIDE, Math.max(res.data.length - 1, 0)))
    }).catch(() => {})
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + categories.length) % categories.length)
  }, [categories.length])

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % categories.length)
  }, [categories.length])

  // auto-advance, pausing while the user is hovering or interacting
  useEffect(() => {
    if (categories.length <= 1 || isPaused) return
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % categories.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [categories.length, isPaused])

  if (categories.length === 0) return null

  return (
    <section className="relative isolate overflow-hidden container-px py-24">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="eyebrow">Curated Edits</span>
        <h2 className="section-title mt-3">Shop by Weave</h2>
        <p className="text-ink/60 mt-4 font-body">
          Every region of India weaves its own language of silk. Find the one that speaks to you.
        </p>
      </div>

      <div
        className="relative mx-auto flex items-end justify-center"
        style={{ height: 580, maxWidth: 1400 }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Prev arrow */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous category"
          className="absolute left-2 md:left-6 bottom-[46%] z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-ink/60 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-ink hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Cards — all anchored to the same pivot point at the bottom, fanning open */}
        <div className="relative h-full w-full">
          {categories.map((cat, i) => {
            const diff = wrappedDiff(i, activeIndex, categories.length)
            if (Math.abs(diff) > MAX_SLOT) return null

            const style = visuals[cat.slug] || visuals.banarasi
            const imageUrl = cat.imageUrl ? resolveImageUrl(cat.imageUrl) : null
            const slot = getSlot(diff)
            const isActive = diff === 0

            return (
              <div
                key={cat.id}
                className="absolute left-1/2 bottom-10 -translate-x-1/2"
                style={{ zIndex: slot.z }}
              >
                <motion.div
                  style={{ transformOrigin: '50% 100%' }}
                  initial={{ x: 0, y: 0, rotate: 0, scale: 0.15, opacity: 0 }}
                  animate={{ x: slot.shiftX, y: slot.lift, rotate: slot.rotate, scale: slot.scale, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 190,
                    damping: 22,
                    delay: Math.min(Math.abs(diff), MAX_SLOT) * 0.08,
                  }}
                >
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    onClick={(e) => {
                      // clicking a side card first brings it to center instead of navigating away
                      if (!isActive) {
                        e.preventDefault()
                        setActiveIndex(i)
                      }
                    }}
                    className={`group relative block overflow-hidden rounded-[24px] bg-sand ring-1 transition-all duration-500 ${
                      isActive
                        ? 'ring-white/40 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.5)]'
                        : 'ring-black/5 shadow-card'
                    }`}
                    style={{
                      width: CARD_WIDTH,
                      height: CARD_HEIGHT,
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="relative h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${style.start} 0%, ${style.end} 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_35%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_30%)]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
                      </div>
                    )}

                    {/* permanent bottom shade so every card's edge reads cleanly, no opacity fade anywhere */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    {/* caption + CTA only on the active/center card, centered */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 14 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center px-5 pb-6 pt-14 text-center"
                          style={{ minHeight: '160px' }}
                        >
                          <p className="text-base font-semibold tracking-wide text-white md:text-lg">
                            {cat.name}
                          </p>
                          <span className="mt-2 h-px w-10 bg-white/50" />
                          {cat.tagline && (
                            <p className="mt-2 max-w-[220px] text-sm text-white/75">{cat.tagline}</p>
                          )}
                          <span className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold uppercase tracking-wide text-ink shadow-md transition-transform duration-300 group-hover:scale-105">
                            Shop Now
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Next arrow */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Next category"
          className="absolute right-2 md:right-6 bottom-[46%] z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-ink/60 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-ink hover:scale-105 active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* dot indicators */}
      <div className="mt-10 flex justify-center gap-2">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            type="button"
            aria-label={`Go to ${cat.name}`}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-7 bg-ink' : 'w-1.5 bg-ink/25 hover:bg-ink/40'
            }`}
          />
        ))}
      </div>
    </section>
  )
}