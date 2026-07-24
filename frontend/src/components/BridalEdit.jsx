import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { resolveImageUrl } from '../api/config.js'

const defaultOffers = [
  { id: 1, label: 'Linen & Cotton', discount: '20', subtitle: 'On Selected Styles', imageUrl: '/uploads/06ccda4b-bd8d-4fe3-bf9d-b13e50f8ae52.png', path: '/shop?category=linen-cotton' },
  { id: 2, label: 'Chanderi', discount: '25', subtitle: 'Festive Collection', imageUrl: '/uploads/180206c8-167e-489c-b611-770d8145453c.png', path: '/shop?category=chanderi' },
  { id: 3, label: 'Georgette', discount: '30', subtitle: 'Premium Range', imageUrl: '/uploads/1bdfa4fe-e977-436a-bdbf-c67d22c5f679.png', path: '/shop?category=georgette' },
  { id: 4, label: 'Tissue Silk', discount: '25', subtitle: 'Wedding Edit', imageUrl: '/uploads/3e8d607e-7e51-438f-965a-9e9342d6b914.png', path: '/shop?category=tissue-silk' },
  { id: 5, label: 'Banarasi', discount: '35', subtitle: 'Luxury Collection', imageUrl: '/uploads/a539aa18-5107-430d-b32e-8daa78bfa249.png', path: '/shop?category=banarasi' },
]

// ── Decorative diamond divider ────────────────────────────────────────────────
const DiamondDivider = () => (
  <div className="flex items-center justify-center gap-3 mb-3">
    <div className="h-px w-12 bg-gold/60" />
    <span className="text-gold text-lg">✦</span>
    <div className="h-px w-12 bg-gold/60" />
  </div>
)

// ── Cloud clip-path (defined once, reused by every card via url(#offerCloudClip)) ──
const CLOUD_PATH =
  'M0.15,0.66 C0.03,0.66 0.02,0.46 0.15,0.42 C0.10,0.20 0.35,0.11 0.46,0.24 ' +
  'C0.55,0.04 0.80,0.07 0.83,0.27 C1.00,0.27 1.02,0.53 0.85,0.59 ' +
  'C0.93,0.79 0.66,0.86 0.55,0.73 C0.46,0.91 0.20,0.87 0.20,0.69 ' +
  'C0.18,0.69 0.16,0.68 0.15,0.66 Z'

const CloudClipDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <clipPath id="offerCloudClip" clipPathUnits="objectBoundingBox">
        <path d={CLOUD_PATH} />
      </clipPath>
    </defs>
  </svg>
)

// ── Arrange offers radially around a center point, like petals on a flower ──
const FLOWER_RADIUS_PCT = 27
const POSITION_SHIFT_LEFT = {
  0: -15.5,
  1: -1.5,
  2: -8.5,
  3: -30.5,
  4: -35.5,
}
// Pulls the whole flower cluster upward inside its (square) container, since
// the topmost petal otherwise sits ~23% down and leaves dead space under the
// heading. Tweak this if you want the cluster higher/lower.
const Y_SHIFT_UP_PCT = 14

const defaultOffersPositioned = (list) =>
  list.map((offer, idx) => {
    const angle = (-90 + idx * (360 / list.length)) * (Math.PI / 180)
    const leftShift = POSITION_SHIFT_LEFT[idx] || 0

    return {
      ...offer,
      _x: 50 + FLOWER_RADIUS_PCT * Math.cos(angle) + leftShift,
      _y: 50 + FLOWER_RADIUS_PCT * Math.sin(angle) - Y_SHIFT_UP_PCT,
    }
  })

// ── Cloud-shaped offer card ─────────────────────────────────────────────────
// NOTE: all text content lives in the vertical CENTER of the card
// (justify-center, not justify-between) because the cloud shape pinches in
// sharply near the very top and very bottom — anything pinned to those
// extreme edges gets sliced off by the clip-path. Centering keeps the
// category pill, the discount block, and the hover button inside the widest,
// safest part of the cloud.
const CloudOfferCard = ({ offer, compact = false }) => {
  const width = compact ? 250 : 330
  return (
    <Link
      to={offer.path}
      className="group relative block overflow-hidden"
      style={{ width, aspectRatio: '1 / 1.2', clipPath: 'url(#offerCloudClip)', WebkitClipPath: 'url(#offerCloudClip)' }}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 group-hover:-translate-y-1"
        style={{ background: '#c9a35c' }}
      />
      <div
        className="absolute inset-[8px] transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.45) 100%), url(${resolveImageUrl(offer.imageUrl)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white ${compact ? 'px-5' : 'px-8'}`}>
        <div className={`bg-white rounded-full font-semibold tracking-[0.22em] uppercase text-maroon shadow-sm whitespace-nowrap ${compact ? 'px-3 py-0.5 text-[8px] mb-2' : 'px-4 py-1 text-[10px] mb-3'}`}>
          {offer.label}
        </div>

        <p className={compact ? 'text-[9px] font-medium text-white leading-none' : 'text-[10px] font-medium text-white leading-none'}>UP TO</p>
        <p className={`font-display font-bold leading-none text-white mt-1.5 ${compact ? 'text-[28px]' : 'text-3xl'}`}>
          {offer.discount}%
        </p>
        <p className={compact ? 'text-[9px] font-semibold tracking-wider text-white uppercase mt-1' : 'text-[10px] font-semibold tracking-wider text-white uppercase mt-1'}>
          OFF
        </p>
        <p className={`font-medium text-white/95 mt-2 leading-snug tracking-wide uppercase ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
          {offer.subtitle}
        </p>

        <button
          className={`font-bold tracking-widest uppercase text-white rounded-full bg-maroon/95 opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 ${compact ? 'mt-2 px-4 py-1.5 text-[8px]' : 'mt-3 px-5 py-2 text-[10px]'}`}
        >
          SHOP NOW
        </button>
      </div>
    </Link>
  )
}

export default function BridalEdit({ bridal = [], offers = [] }) {
  const offerList = offers && offers.length ? offers : defaultOffers

  return (
    <>

      {/* ── SECTION 2: EXCITING OFFERS ─────────────────────────────────────── */}
      <section
        className="pt-0 pb-0 -mt-5 bg-ivory"
      >
        <div className="container-px">
          <CloudClipDefs />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center mb-0"
          >
            <span className="eyebrow">You Love We</span>
            <h2 className="section-title mt-3">Offers Zone</h2>
          </motion.div>

          {/* Offer cards — static flower arrangement, clouds as petals */}
          <div
            className="relative mx-auto -mt-8"
            style={{ width: '100%', maxWidth: 780, aspectRatio: '1 / 1' }}
          >
            {/* Petals */}
            {defaultOffersPositioned(offerList).map((offer, idx) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="absolute z-10"
                style={{
                  left: `${offer._x}%`,
                  top: `${offer._y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <CloudOfferCard offer={offer} compact />
              </motion.div>
            ))}
          </div>

          {/* Explore all link */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-center -mt-6"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase"
              style={{ color: '#6b1a2b' }}
            >
              Explore All Collections
              <ArrowRight size={15} />
            </Link>
          </motion.div>

        </div>
      </section>
    </>
  )
}