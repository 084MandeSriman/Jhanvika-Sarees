import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Heart, MessageCircle, Instagram } from 'lucide-react'
import { resolveImageUrl } from '../api/config.js'

const posts = [
  { id: 1, likes: '1.2K', comments: 48, imageUrl: '/uploads/06ccda4b-bd8d-4fe3-bf9d-b13e50f8ae52.png', tag: '@jhanvika_sarees' },
  { id: 2, likes: '980',  comments: 32, imageUrl: '/uploads/180206c8-167e-489c-b611-770d8145453c.png', tag: '@ethnic_vibes' },
  { id: 3, likes: '1.5K', comments: 64, imageUrl: '/uploads/1bdfa4fe-e977-436a-bdbf-c67d22c5f679.png', tag: '@saree_stories' },
  { id: 4, likes: '870',  comments: 28, imageUrl: '/uploads/3e8d607e-7e51-438f-965a-9e9342d6b914.png', tag: '@drape_diaries' },
  { id: 5, likes: '1.1K', comments: 36, imageUrl: '/uploads/a539aa18-5107-430d-b32e-8daa78bfa249.png', tag: '@silk_moments' },
  { id: 6, likes: '1.3K', comments: 41, imageUrl: '/uploads/180206c8-167e-489c-b611-770d8145453c.png', tag: '@ethnic_vibes' },
  { id: 7, likes: '1.1K', comments: 36, imageUrl: '/uploads/1bdfa4fe-e977-436a-bdbf-c67d22c5f679.png', tag: '@saree_stories' },
]

// Arc / fan placement — same card size everywhere, only the center one is lifted & highlighted.
const CARD_WIDTH = 220
const ARC = [
  { x: -430, y: -30, rotate: -9,  z: 1 },
  { x: -295, y: 0,   rotate: -6,  z: 2 },
  { x: -155, y: 30,  rotate: -3,  z: 3 },
  { x: 0,    y: 40,  rotate: 0,   z: 5, center: true },
  { x: 155,  y: 30,  rotate: 3,   z: 3 },
  { x: 295,  y: 0,   rotate: 6,   z: 2 },
  { x: 430,  y: -30, rotate: 9,   z: 1 },
]

function PolaroidCard({ post, center }) {
  const [liked, setLiked] = useState(false)
  const [heartBurst, setHeartBurst] = useState(false)
  const cardRef = useRef(null)

  // 3D tilt that follows the cursor, springed for a smooth settle
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-60, 60], [10, -10]), { stiffness: 200, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [-60, 60], [-10, 10]), { stiffness: 200, damping: 18 })
  const shineX = useTransform(mx, [-60, 60], ['0%', '100%'])

  function handleMouseMove(e) {
    const rect = cardRef.current.getBoundingClientRect()
    mx.set(e.clientX - rect.left - rect.width / 2)
    my.set(e.clientY - rect.top - rect.height / 2)
  }
  function handleMouseLeave() {
    mx.set(0)
    my.set(0)
    setHeartBurst(false)
  }

  function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()
    setLiked((v) => !v)
    setHeartBurst(true)
    setTimeout(() => setHeartBurst(false), 600)
  }

  return (
    <motion.a
      ref={cardRef}
      href="https://instagram.com"
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: CARD_WIDTH,
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      whileHover={{ scale: 1.06, zIndex: 20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`group relative block bg-white p-3 pb-10 rounded-2xl shadow-[0_8px_28px_-10px_rgba(0,0,0,0.22)] hover:shadow-[0_30px_60px_-15px_rgba(139,0,0,0.32)] cursor-pointer ${
        center ? 'ring-2 ring-[#bf9b54]/50 ring-offset-4 ring-offset-ivory' : ''
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.12]"
          style={{ backgroundImage: `url(${resolveImageUrl(post.imageUrl)})` }}
        />

        {/* diagonal shine sweep that tracks the cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              shineX,
              (v) => `linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.35) ${v}, transparent 60%)`
            ),
          }}
        />

        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
          <Instagram size={13} className="text-maroon" />
        </div>

        {/* details slide up from below the frame */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-350 ease-out bg-gradient-to-t from-black/80 to-black/0 pt-10 pb-3 px-3">
          <p className="text-white/90 text-[11px] font-medium font-body mb-1.5">{post.tag}</p>
          <div className="flex items-center gap-3">
            <button onClick={handleLike} className="flex items-center gap-1 text-white text-xs font-body">
              <AnimatePresence mode="wait">
                <motion.span
                  key={liked ? 'liked' : 'unliked'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <Heart size={13} className={liked ? 'fill-red-400 text-red-400' : 'fill-white/80 text-white/80'} />
                </motion.span>
              </AnimatePresence>
              {post.likes}
            </button>
            <span className="flex items-center gap-1 text-white text-xs font-body">
              <MessageCircle size={13} className="text-white/80" /> {post.comments}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {heartBurst && (
            <motion.div
              key="burst"
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart size={40} className="fill-red-400 text-red-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3 pt-2.5 pl-0.5 text-xs text-ink/60 font-body group-hover:opacity-0 transition-opacity duration-200">
        <span className="flex items-center gap-1">
          <Heart size={11} className="fill-maroon text-maroon" /> {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={11} /> {post.comments}
        </span>
      </div>
    </motion.a>
  )
}

const ROTATE_MS = 3200 // how long each card holds a slot before the cycle advances

export default function InstagramFeed() {
  const items = posts.slice(0, 7)
  const [offset, setOffset] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % items.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [paused, items.length])

  return (
    <section className="relative bg-ivory py-8 overflow-x-clip">
      {/* soft ambient corner decoration, in place of photographic props */}
      <div className="pointer-events-none absolute -left-16 -bottom-20 w-72 h-72 rounded-full bg-emerald-900/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-[#bf9b54]/10 blur-3xl" />

      <div className="container-px relative pb-0">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-xl mx-auto mb-4 relative z-10"
        >
          
          <h2 className="font-display text-3xl md:text-4xl text-maroon leading-tight">
            Straight from Instagram
          </h2>
          <p className="font-body text-sm text-ink/55 mt-2.5">Real looks. Real love. Real drapes.</p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-maroon/50 to-transparent origin-center"
          />
        </motion.div>

        {/* Fan / arc arrangement — slots rotate on a timer, so a new card takes the center over time */}
        <div
          className="relative mx-auto"
          style={{ height: 300, maxWidth: 1180, perspective: 1400 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* decorative dotted arc threading through the cards */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1180 540"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M 40 150 Q 300 285 590 315 Q 880 285 1140 150"
              fill="none"
              stroke="rgba(191,155,84,0.45)"
              strokeWidth="1.5"
              strokeDasharray="1 10"
              strokeLinecap="round"
            />
            {[
              [40, 150], [220, 225], [590, 315], [960, 225], [1140, 150],
            ].map(([cx, cy], i) => (
              <rect
                key={i}
                x={cx - 3}
                y={cy - 3}
                width="6"
                height="6"
                fill="rgba(191,155,84,0.55)"
                transform={`rotate(45 ${cx} ${cy})`}
              />
            ))}
          </svg>

          {items.map((post, i) => {
            // Each card's slot shifts by `offset` every cycle — same card, new arc position.
            const slot = (i - offset + items.length) % items.length
            const pos = ARC[slot]
            return (
              <motion.div
                key={post.id}
                className="absolute top-1/2 left-1/2"
                style={{ zIndex: pos.z }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: pos.x,
                  y: pos.y,
                  rotate: pos.rotate,
                  scale: pos.center ? 1.05 : 1,
                }}
                transition={{
                  opacity: { duration: 0.5, delay: i * 0.06 },
                  default: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                <div style={{ transform: 'translate(-50%, -50%)' }}>
                  <PolaroidCard post={post} center={pos.center} />
                </div>
              </motion.div>
            )
          })}
        </div>

        
      </div>
    </section>
  )
}