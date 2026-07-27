import React, { useState } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { Heart, MessageCircle, Instagram } from 'lucide-react'
import { resolveImageUrl } from '../api/config.js'

const posts = [
  { id: 1, likes: '1.2K', comments: 48, imageUrl: '/uploads/06ccda4b-bd8d-4fe3-bf9d-b13e50f8ae52.png', tag: '@jhanvika_sarees' },
  { id: 2, likes: '980',  comments: 32, imageUrl: '/uploads/180206c8-167e-489c-b611-770d8145453c.png', tag: '@jhanvika_sarees' },
  { id: 3, likes: '1.5K', comments: 64, imageUrl: '/uploads/1bdfa4fe-e977-436a-bdbf-c67d22c5f679.png', tag: '@jhanvika_sarees' },
  { id: 4, likes: '870',  comments: 28, imageUrl: '/uploads/3e8d607e-7e51-438f-965a-9e9342d6b914.png', tag: '@jhanvika_sarees' },
  { id: 5, likes: '1.1K', comments: 36, imageUrl: '/uploads/a539aa18-5107-430d-b32e-8daa78bfa249.png', tag: '@jhanvika_sarees' },
  { id: 6, likes: '1.3K', comments: 41, imageUrl: '/uploads/180206c8-167e-489c-b611-770d8145453c.png', tag: '@jhanvika_sarees' },
  { id: 7, likes: '1.1K', comments: 36, imageUrl: '/uploads/1bdfa4fe-e977-436a-bdbf-c67d22c5f679.png', tag: '@jhanvika_sarees' },
]

const CARD_WIDTH = 200
const CARD_GAP = 20

function PolaroidCard({ post }) {
  const [liked, setLiked] = useState(false)
  const [heartBurst, setHeartBurst] = useState(false)

  function handleLike(e) {
    e.preventDefault()
    e.stopPropagation()
    setLiked((v) => !v)
    setHeartBurst(true)
    setTimeout(() => setHeartBurst(false), 600)
  }

  return (
    <a
      href="https://instagram.com/jhanvika_sarees"
      target="_blank"
      rel="noopener noreferrer"
      style={{ width: CARD_WIDTH, flexShrink: 0 }}
      className="group relative block bg-white rounded-xl overflow-hidden border border-black/5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_28px_-10px_rgba(139,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          style={{ backgroundImage: `url(${resolveImageUrl(post.imageUrl)})` }}
        />

        <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm">
          <Instagram size={12} className="text-maroon" />
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/75 to-transparent pt-8 pb-2.5 px-3">
          <div className="flex items-center gap-3">
            <button onClick={handleLike} className="flex items-center gap-1 text-white text-xs font-body">
              <AnimatePresence mode="wait">
                <motion.span
                  key={liked ? 'liked' : 'unliked'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart size={12} className={liked ? 'fill-red-400 text-red-400' : 'fill-white/80 text-white/80'} />
                </motion.span>
              </AnimatePresence>
              {post.likes}
            </button>
            <span className="flex items-center gap-1 text-white text-xs font-body">
              <MessageCircle size={12} className="text-white/80" /> {post.comments}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {heartBurst && (
            <motion.div
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart size={32} className="fill-red-400 text-red-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3 py-2.5 flex justify-center">
        <p className="text-sm font-medium text-maroon/85 font-display truncate" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{post.tag}</p>
      </div>
    </a>
  )
}

export default function InstagramFeed() {
  const items = posts.slice(0, 7)
  const loop = items.concat(items)
  const controls = useAnimationControls()

  const oneSetWidth = items.length * CARD_WIDTH + (items.length - 1) * CARD_GAP
  const durationSeconds = oneSetWidth / 40

  function startScroll() {
    controls.start({
      x: [0, -oneSetWidth],
      transition: { duration: durationSeconds, ease: 'linear', repeat: Infinity },
    })
  }

  React.useEffect(() => {
    startScroll()
  }, [])

  return (
    <section className="relative bg-ivory py-8 overflow-hidden">
      <div className="container-px relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-xl mx-auto mb-8"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[12px] text-amber-600 uppercase tracking-wider mb-3">
              <Instagram size={14} className="text-amber-600" />
              <span>Follow Along</span>
            </div>

            <h2 className="font-display text-4xl md:text-6xl text-maroon leading-tight" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              @Jhanvika_Sarees
            </h2>

            <p className="font-body text-sm text-ink/60 mt-3 max-w-2xl">
              Step inside our world — new drops, styling ideas and behind-the-scenes from the atelier.
            </p>
          </div>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-ivory to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-ivory to-transparent" />

          <div
            className="overflow-hidden w-full"
            onMouseEnter={() => controls.stop()}
            onMouseLeave={startScroll}
          >
            <motion.div
              animate={controls}
              style={{ display: 'flex', gap: CARD_GAP, width: 'max-content' }}
            >
              {loop.map((post, i) => (
                <PolaroidCard key={`${post.id}-${i}`} post={post} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}