import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const LotusIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M16 28 C16 28 6 20 6 13 C6 9 9 7 12 8 C13 5 14.5 4 16 4 C17.5 4 19 5 20 8 C23 7 26 9 26 13 C26 20 16 28 16 28Z"/>
    <path d="M16 4 L16 28"/>
    <path d="M16 28 C16 28 10 18 10 13"/>
    <path d="M16 28 C16 28 22 18 22 13"/>
  </svg>
)

const WeaveIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="4" y="4" width="24" height="24" rx="2"/>
    <path d="M4 11 H28 M4 17 H28 M4 23 H28"/>
    <path d="M11 4 V28 M17 4 V28 M23 4 V28"/>
  </svg>
)

const LeafIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M6 26 C6 26 8 10 20 6 C28 4 28 4 28 4 C28 4 28 14 22 20 C16 26 6 26 6 26Z"/>
    <path d="M6 26 L20 12"/>
  </svg>
)

const TruckIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="8" width="20" height="14" rx="2"/>
    <path d="M22 12 L28 12 L30 18 L30 22 L22 22 Z"/>
    <circle cx="8" cy="24" r="2.5"/>
    <circle cx="24" cy="24" r="2.5"/>
  </svg>
)

const StarOutlineIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M16 4 L19.5 12 H28.5 L21.5 17.5 L24 26 L16 21 L8 26 L10.5 17.5 L3.5 12 H12.5 Z"/>
  </svg>
)

// ── Pentagon / diamond saree symbol ──────────────────────────────────────────
const SareeSymbol = ({ style }) => (
  <svg
    viewBox="0 0 40 40"
    style={{ width: 36, height: 36, ...style }}
    fill="none"
  >
    <polygon
      points="20,2 38,14 32,34 8,34 2,14"
      stroke="rgba(255,215,120,0.85)"
      strokeWidth="1.5"
      fill="rgba(255,215,120,0.12)"
    />
    <polygon
      points="20,8 32,17 27,30 13,30 8,17"
      stroke="rgba(255,215,120,0.6)"
      strokeWidth="1"
      fill="rgba(255,215,120,0.08)"
    />
    <circle cx="20" cy="20" r="3" fill="rgba(255,215,120,0.7)" />
  </svg>
)

// ── Lotus divider ─────────────────────────────────────────────────────────────
const LotusDivider = () => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-px w-12" style={{ background: '#b8902a' }} />
    <svg viewBox="0 0 40 28" className="w-9 h-6" fill="none" stroke="#b8902a" strokeWidth="1.3">
      <path d="M20 26 C20 26 4 16 4 8 C4 5 8 4 12 6 C13 2 16 1 20 1 C24 1 27 2 28 6 C32 4 36 5 36 8 C36 16 20 26 20 26Z"/>
      <path d="M20 1 L20 26"/>
      <path d="M20 26 C20 26 11 15 11 8"/>
      <path d="M20 26 C20 26 29 15 29 8"/>
    </svg>
    <div className="h-px w-12" style={{ background: '#b8902a' }} />
  </div>
)

// ── Saree slideshow images (right side) ───────────────────────────────────────
// Replace these with your actual uploaded saree image paths
const SAREE_SLIDES = [
  '/uploads/hero-saree-1.jpg',
  '/uploads/hero-saree-2.jpg',
  '/uploads/hero-saree-3.jpg',
  '/uploads/hero-saree-4.jpg',
  '/uploads/hero-saree-5.jpg',
  '/uploads/hero-saree-6.jpg',
]

// Pentagon symbol positions scattered over the right panel
const SYMBOL_POSITIONS = [
  { top: '8%',  left: '12%', scale: 0.9,  rotate: 15,  delay: 0    },
  { top: '18%', left: '72%', scale: 1.1,  rotate: -10, delay: 0.4  },
  { top: '38%', left: '5%',  scale: 0.75, rotate: 25,  delay: 0.8  },
  { top: '52%', left: '80%', scale: 1.0,  rotate: -20, delay: 1.2  },
  { top: '70%', left: '20%', scale: 0.85, rotate: 5,   delay: 0.6  },
  { top: '78%', left: '65%', scale: 1.15, rotate: -8,  delay: 1.0  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advance slides every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SAREE_SLIDES.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: '92vh', background: '#fdf3e7' }}
    >

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 grid grid-cols-1 lg:grid-cols-2"
        style={{ minHeight: '92vh' }}
      >

        {/* ── LEFT: Text content ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center px-10 lg:px-16 xl:px-20 py-24 lg:py-0"
          style={{ background: 'transparent' }}
        >
          {/* Eyebrow + lotus */}
          <div className="mb-2">
            <span
              className="block font-semibold tracking-[0.32em] uppercase mb-4"
              style={{ color: '#b8902a', fontSize: '11px' }}
            >
              Six Yards of Heritage
            </span>
            <LotusDivider />
          </div>

          {/* Headline */}
          <h1
            className="mb-5 leading-[1.06]"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(44px, 5.5vw, 74px)',
              fontWeight: 600,
              color: '#3b0d1a',
            }}
          >
            Light as air.<br />
            Loved every day.
          </h1>

          {/* Body */}
          <p
            className="mb-9 leading-relaxed"
            style={{
              color: '#5a3a2a',
              fontSize: '15px',
              maxWidth: '360px',
              lineHeight: 1.75,
            }}
          >
            Soft handlooms for your everyday grace.<br />
            Crafted for moments that feel like you.
          </p>

          {/* CTA */}
          <div className="mb-14">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 text-white font-bold uppercase transition-all duration-200 hover:opacity-90"
              style={{
                background: '#5c1a2e',
                fontSize: '11.5px',
                letterSpacing: '0.16em',
                padding: '15px 30px',
                borderRadius: '3px',
              }}
            >
              Shop Collection <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stats */}
          <div
            className="flex items-center"
            style={{ borderTop: '1px solid rgba(90,58,42,0.18)', paddingTop: '22px' }}
          >
            {[
              { icon: <LotusIcon />, value: '30+',  label: 'Weaving Clusters' },
              { icon: <WeaveIcon />, value: '15K+', label: 'Happy Drapes'     },
              { icon: <StarOutlineIcon />, value: '4.8', label: 'Average Rating' },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                <div className="flex items-center gap-2.5 pr-6 first:pl-0">
                  <span style={{ color: '#b8902a' }}>{stat.icon}</span>
                  <div>
                    <p
                      style={{
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#3b0d1a',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="uppercase tracking-widest"
                      style={{ fontSize: '8.5px', color: '#9e7a5a', letterSpacing: '0.14em', marginTop: '3px' }}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
                {i < 2 && (
                  <div
                    className="h-8 w-px mr-6"
                    style={{ background: 'rgba(90,58,42,0.2)' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* ── RIGHT: Animated saree slideshow ────────────────────────────── */}
        <div className="relative overflow-hidden hidden lg:block">

          {/* Slideshow */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={SAREE_SLIDES[currentSlide]}
                alt={`Saree ${currentSlide + 1}`}
                className="w-full h-full object-cover object-center"
                onError={e => {
                  // fallback: warm gradient when images not yet uploaded
                  e.currentTarget.style.display = 'none'
                }}
              />
              {/* Subtle left-edge gradient so text on left blends */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, rgba(253,243,231,0.45) 0%, rgba(253,243,231,0) 30%)',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* ── Pentagon / diamond saree symbols floating over image ──────── */}
          {SYMBOL_POSITIONS.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{ top: pos.top, left: pos.left }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0.9, 0.9, 0],
                scale:   [0.5, pos.scale, pos.scale, 0.5],
                rotate:  [pos.rotate - 10, pos.rotate, pos.rotate + 5, pos.rotate],
              }}
              transition={{
                duration: 4,
                delay: pos.delay + currentSlide * 0.3,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: 'easeInOut',
              }}
            >
              <SareeSymbol />
            </motion.div>
          ))}

          {/* Slide indicator dots */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20"
          >
            {SAREE_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="transition-all duration-300"
                style={{
                  width:  i === currentSlide ? '24px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === currentSlide
                    ? '#fff'
                    : 'rgba(255,255,255,0.45)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM DARK BAR ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="absolute bottom-0 right-0 z-20"
        style={{
          background: '#5c1a2e',
          borderTopLeftRadius: '12px',
        }}
      >
        <div className="flex items-center gap-0 px-2 py-4">
          {[
            { icon: <LotusIcon />, label: 'Pure Weaves'        },
            { icon: <WeaveIcon />, label: 'Timeless Craft'     },
            { icon: <LeafIcon />,  label: 'Ethical Fashion'    },
            { icon: <TruckIcon />, label: 'Worldwide Shipping' },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              <div className="flex flex-col items-center gap-1.5 px-5 py-1">
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{item.icon}</span>
                <span
                  className="text-white uppercase font-semibold tracking-widest text-center"
                  style={{ fontSize: '9px', letterSpacing: '0.12em', lineHeight: 1.2 }}
                >
                  {item.label}
                </span>
              </div>
              {i < 3 && (
                <div
                  className="h-8 w-px"
                  style={{ background: 'rgba(255,255,255,0.18)' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

    </section>
  )
}