import React, { useEffect, useRef, useState } from 'react'
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
// DESKTOP / TABLET (sm and up) — unchanged from before.
const FLOWER_RADIUS_PCT = 27
const POSITION_SHIFT_LEFT = {
  0: -15.5,
  1: -1.5,
  2: -8.5,
  3: -30.5,
  4: -35.5,
}
const Y_SHIFT_UP_PCT = 14

// MOBILE ONLY — same 5-petal pentagon shape (same angles), just centered
// (no left-shift, since a narrow phone container has no extra page margin
// to absorb an off-center cluster) and radius tuned so that, combined with
// the container-relative card size below, adjacent petals just touch —
// the same "just touching, not overlapping" spacing the desktop layout has
// — instead of stacking on top of each other.
// NOTE: unchanged in this pass — only the horizontal-centering wrapper
// around the whole cluster (below) was added.
const MOBILE_FLOWER_RADIUS_PCT = 28
const MOBILE_Y_SHIFT_UP_PCT = 2

const getPositionedOffers = (list, isMobile) =>
  list.map((offer, idx) => {
    const angle = (-90 + idx * (360 / list.length)) * (Math.PI / 180)

    if (isMobile) {
      return {
        ...offer,
        _x: 50 + MOBILE_FLOWER_RADIUS_PCT * Math.cos(angle),
        _y: 50 + MOBILE_FLOWER_RADIUS_PCT * Math.sin(angle) - MOBILE_Y_SHIFT_UP_PCT,
      }
    }

    const leftShift = POSITION_SHIFT_LEFT[idx] || 0
    return {
      ...offer,
      _x: 50 + FLOWER_RADIUS_PCT * Math.cos(angle) + leftShift,
      _y: 50 + FLOWER_RADIUS_PCT * Math.sin(angle) - Y_SHIFT_UP_PCT,
    }
  })

// Detects <640px (Tailwind's `sm` breakpoint) so the flower switches to the
// centered mobile coordinates above. Desktop/tablet rendering is untouched.
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])
  return isMobile
}

// Measures the flower container's real pixel width so every card can be
// sized as a true percentage of it — the exact same 32% ratio the desktop
// design already uses (250px card / 780px max container ≈ 32%). At the
// 780px desktop cap this evaluates to ~250px, identical to before. On a
// narrow phone it shrinks proportionally instead of being sized off the
// viewport (which doesn't account for padding) — the whole flower becomes
// a faithfully scaled-down copy of the desktop one, so spacing, overlap,
// and centering all look the same, just smaller.
const CARD_TO_CONTAINER_RATIO = 250 / 780
const useContainerWidth = () => {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width
      if (w) setWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}

// ── Cloud-shaped offer card ─────────────────────────────────────────────────
// NOTE: all text content lives in the vertical CENTER of the card
// (justify-center, not justify-between) because the cloud shape pinches in
// sharply near the very top and very bottom — anything pinned to those
// extreme edges gets sliced off by the clip-path. Centering keeps the
// category pill, the discount block, and the hover button inside the widest,
// safest part of the cloud.
//
// `size` is the measured pixel width for this card (see useContainerWidth
// above). Every padding/font value below is that same size's ratio to the
// original 250px desktop card, with a readability floor — so a smaller
// mobile card is a scaled-down copy of the desktop one, not an
// independently-guessed size.
const CloudOfferCard = ({ offer, size = 250 }) => {
  const scale = size / 250

  const px = (desktopPx, min) => `${Math.max(min, desktopPx * scale)}px`

  return (
    <Link
      to={offer.path}
      className="group relative block overflow-hidden"
      style={{ width: size, aspectRatio: '1 / 1.2', clipPath: 'url(#offerCloudClip)', WebkitClipPath: 'url(#offerCloudClip)' }}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 group-hover:-translate-y-1"
        style={{ background: '#c9a35c' }}
      />
      <div
        className="absolute transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          inset: px(8, 3),
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.45) 100%), url(${resolveImageUrl(offer.imageUrl)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white"
        style={{ padding: px(20, 8) }}
      >
        <div
          className="bg-white rounded-full font-semibold uppercase text-maroon shadow-sm"
          style={{
            fontSize: px(8, 7),
            padding: `${px(2, 1.5).replace('px', '')}px ${px(12, 7).replace('px', '')}px`,
            marginBottom: px(8, 4),
            letterSpacing: `${Math.max(0.03, 0.22 * scale).toFixed(2)}em`,
            maxWidth: '92%',
            whiteSpace: 'normal',
            lineHeight: 1.25,
          }}
        >
          {offer.label}
        </div>

        <p className="font-medium text-white leading-none" style={{ fontSize: px(9, 6.5) }}>
          UP TO
        </p>
        <p className="font-display font-bold leading-none text-white mt-1.5" style={{ fontSize: px(28, 16) }}>
          {offer.discount}%
        </p>
        <p className="font-semibold tracking-wider text-white uppercase mt-1" style={{ fontSize: px(9, 6.5) }}>
          OFF
        </p>
        <p className="font-medium text-white/95 mt-2 leading-snug tracking-wide uppercase" style={{ fontSize: px(9, 6.5) }}>
          {offer.subtitle}
        </p>

        {/* Hover-reveal CTA: invisible until hover, which never happens on
            touch, so it's hidden below `sm` to keep the mobile card's
            vertical rhythm tight. Desktop is unaffected. */}
        <button
          className="hidden sm:inline-block font-bold tracking-widest uppercase text-white rounded-full bg-maroon/95 opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
          style={{
            marginTop: px(12, 6),
            padding: `${px(8, 4).replace('px', '')}px ${px(20, 12).replace('px', '')}px`,
            fontSize: px(10, 8),
          }}
        >
          SHOP NOW
        </button>
      </div>
    </Link>
  )
}

export default function BridalEdit({ bridal = [], offers = [] }) {
  const offerList = offers && offers.length ? offers : defaultOffers
  const isMobile = useIsMobile()
  const [flowerRef, containerWidth] = useContainerWidth()

  const cardSize = containerWidth
    ? Math.min(250, Math.max(96, containerWidth * CARD_TO_CONTAINER_RATIO))
    : 250

  return (
    <>

      {/* ── SECTION 2: EXCITING OFFERS ─────────────────────────────────────── */}
      <section
        className="pt-0 pb-0 -mt-5 bg-ivory"
      >
        {/* Mobile-only (≤768px) horizontal centering for the flower/clover
            card group. Pure flexbox + margin auto, scoped by media query so
            it can never touch tablet/desktop. Nothing about card size,
            shape, gaps, vertical spacing, typography, images, hover effects,
            animations, or section padding is changed — this only wraps the
            existing cluster in a centering flex box. */}
        <style>{`
          @media (max-width: 768px) {
            .offers-zone-flower-center {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              margin: 0 auto;
            }
          }
        `}</style>

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

          {/* Offer cards — static flower arrangement, clouds as petals.
              Same markup, same positions, same sizes at every screen size;
              only wrapped in a flex box that centers it on mobile. */}
          <div className="offers-zone-flower-center">
            <div
              ref={flowerRef}
              className="relative mx-auto -mt-8"
              style={{ width: '100%', maxWidth: 780, aspectRatio: '1 / 1' }}
            >
              {/* Petals */}
              {getPositionedOffers(offerList, isMobile).map((offer, idx) => (
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
                  <CloudOfferCard offer={offer} size={cardSize} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Explore all link — extra breathing room below the cluster on
              mobile (mt-8); desktop keeps the original -mt-6 pull-up. */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-center mt-8 sm:-mt-6"
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
