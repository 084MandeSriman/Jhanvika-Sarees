import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { resolveImageUrl } from '../api/config.js'

const occasions = [
  {
    id: 1,
    title: 'Wedding',
    subtitle: 'Statement weaves for the festival of life',
    imageUrl: '/uploads/wedding.png',
    path: '/shop?occasion=wedding',
    titleColor: '#7a1d3a',
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="#7a1d3a" strokeWidth="1.3">
        <path d="M20 6c-3 3-3 7 0 9 3-2 3-6 0-9Z" />
        <path d="M12 16c4-2 12-2 16 0" />
        <path d="M13 16l-2 12M27 16l2 12M17 16l-1 14M23 16l1 14" />
        <circle cx="12" cy="29" r="1.4" />
        <circle cx="28" cy="29" r="1.4" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Festive',
    subtitle: 'Colour and craft for celebrations',
    imageUrl: '/uploads/festival.png',
    path: '/shop?occasion=festive',
    titleColor: '#2f4a2f',
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="#2f4a2f" strokeWidth="1.3">
        <path d="M20 28c-8-4-8-14-8-14s6 0 8 6c2-6 8-6 8-6s0 10-8 14Z" />
        <path d="M20 28v4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Daily',
    subtitle: 'Soft handlooms for everyday wear',
    imageUrl: '/uploads/daily.png',
    path: '/shop?occasion=daily',
    titleColor: '#8a5a1e',
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="#8a5a1e" strokeWidth="1.3">
        <circle cx="20" cy="20" r="9" />
        <circle cx="20" cy="20" r="4" />
        <path d="M20 8v3M20 29v3M8 20h3M29 20h3" />
      </svg>
    ),
  },
]

// ── Flower clip-path traced directly from the reference lotus photo:
// segmented with GrabCut, largest contour extracted, simplified, and
// normalized to its own bounding box (1027 × 830 px source → aspect below).
// This is the actual flower's outline, not a generated approximation.
const FLOWER_PATH =
  'M0.0506,0.2843 L0.0915,0.3699 L0.0886,0.3855 L0.0594,0.3964 L0.0604,0.4120 L0.1013,0.4639 ' +
  'L0.1821,0.5313 L0.1860,0.5470 L0.1022,0.5614 L0.0370,0.5892 L0.0010,0.6157 L0.0000,0.6506 ' +
  'L0.1032,0.6723 L0.1110,0.6940 L0.1616,0.7169 L0.2756,0.7325 L0.2220,0.8349 L0.1908,0.9205 ' +
  'L0.1947,0.9759 L0.3759,0.8687 L0.4469,0.8590 L0.5102,0.8217 L0.6563,0.9855 L0.6855,0.9988 ' +
  'L0.7118,0.9614 L0.7215,0.9084 L0.7196,0.8554 L0.6904,0.7747 L0.6923,0.7542 L0.8939,0.7651 ' +
  'L0.9903,0.7542 L0.9620,0.7181 L0.9036,0.6831 L0.9007,0.6446 L0.8423,0.6193 L0.7429,0.6084 ' +
  'L0.7449,0.5952 L0.8530,0.5410 L0.9124,0.4964 L0.9659,0.4337 L0.9990,0.3711 L0.9250,0.3639 ' +
  'L0.8325,0.3735 L0.8306,0.3157 L0.7984,0.3578 L0.7868,0.3590 L0.7838,0.3446 L0.8306,0.2301 ' +
  'L0.8364,0.1494 L0.8296,0.1120 L0.8121,0.1096 L0.7371,0.1614 L0.7050,0.0867 L0.6855,0.0795 ' +
  'L0.6611,0.0193 L0.6407,0.0229 L0.5891,0.0904 L0.5774,0.0916 L0.5385,0.0205 L0.4898,0.0000 ' +
  'L0.4606,0.0349 L0.4421,0.0795 L0.4294,0.0831 L0.3759,0.0084 L0.3496,0.0012 L0.3330,0.0494 ' +
  'L0.3223,0.1627 L0.2132,0.0855 L0.1928,0.0867 L0.1986,0.1602 L0.1870,0.1807 L0.2288,0.3157 ' +
  'L0.2259,0.3313 L0.1120,0.2855 Z'

const FlowerClipDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <clipPath id="flowerClip" clipPathUnits="objectBoundingBox">
        <path d={FLOWER_PATH} />
      </clipPath>
    </defs>
  </svg>
)

// Card sized to the traced photo's own bounding-box ratio (1027 × 830)
// so the petals don't get stretched or squashed out of shape.
const OccasionFlowerCard = ({ occasion }) => (
  <Link to={occasion.path} className="group flex flex-col items-center text-center" style={{ width: 320 }}>
    <div
      className="relative"
      style={{
        width: 320,
        aspectRatio: '1027 / 830',
        clipPath: 'url(#flowerClip)',
        WebkitClipPath: 'url(#flowerClip)',
      }}
    >
      <img
        src={resolveImageUrl(occasion.imageUrl)}
        alt={occasion.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>

    <div className="mt-4">{occasion.icon}</div>
    <h3 className="font-display text-2xl mt-1" style={{ color: occasion.titleColor }}>
      {occasion.title}
    </h3>
    <div className="h-px w-10 my-2 mx-auto" style={{ background: '#c9a35c' }} />
    <p className="text-[13px] leading-snug text-ink/65 max-w-[220px]">
      {occasion.subtitle}
    </p>
  </Link>
)

export default function OccasionSection() {
  return (
    <section className="container-px py-20" style={{ background: '#fdf6ee' }}>
      <FlowerClipDefs />

      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="eyebrow">Shop by Occasion</span>
        <h2 className="section-title mt-3">What are you dressing for?</h2>
        <p className="text-ink/55 text-sm mt-2">Handpicked weaves for every moment in your life.</p>
      </div>

      {/* Flower photo cards */}
      <div className="flex flex-wrap items-start justify-center gap-x-12 gap-y-12">
        {occasions.map((occasion, index) => (
          <motion.div
            key={occasion.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <OccasionFlowerCard occasion={occasion} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}