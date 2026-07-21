import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-zari-gradient">
      <div className="container-px grid grid-cols-1 lg:grid-cols-2 items-center gap-10 py-16 lg:py-0 lg:min-h-[86vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-ivory order-2 lg:order-1"
        >
          <span className="eyebrow text-gold-light">Handwoven Since 1994</span>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mt-4 leading-[1.05]">
            Six Yards.<br />
            <span className="text-gold-shimmer italic">Endless</span> Stories.
          </h1>
          <p className="mt-6 text-ivory/75 font-body max-w-md leading-relaxed">
            Jhanvika brings you Banarasi, Kanjivaram and Chanderi sarees, handwoven
            by master artisans and curated for the woman who wears her heritage
            with quiet confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/shop" className="btn-gold">
              Shop Collection <ArrowRight size={16} />
            </Link>
            <Link to="/shop?category=bridal" className="inline-flex items-center gap-2 text-ivory text-sm tracking-wide uppercase border-b border-gold pb-1 hover:text-gold-light transition-colors">
              Explore Bridal Edit
            </Link>
          </div>

          <div className="flex gap-8 mt-12">
            <div>
              <p className="font-display text-3xl text-gold-light">30+</p>
              <p className="text-xs text-ivory/60 tracking-wide uppercase mt-1">Weaving Clusters</p>
            </div>
            <div>
              <p className="font-display text-3xl text-gold-light">15k+</p>
              <p className="text-xs text-ivory/60 tracking-wide uppercase mt-1">Happy Drapes</p>
            </div>
            <div>
              <p className="font-display text-3xl text-gold-light">4.8★</p>
              <p className="text-xs text-ivory/60 tracking-wide uppercase mt-1">Average Rating</p>
            </div>
          </div>
        </motion.div>

        <div className="relative order-1 lg:order-2 flex items-center justify-center py-10 lg:py-0">
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-64 md:w-80"
          >
            <DrapeSVG />
          </motion.div>
          <div className="absolute -inset-10 bg-gold/10 blur-3xl rounded-full -z-10" />
        </div>
      </div>

      {/* bottom motif divider */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-repeat-x opacity-70" style={{
        backgroundImage: 'repeating-linear-gradient(90deg, #E4C97A 0px, #E4C97A 10px, transparent 10px, transparent 24px)'
      }} />
    </section>
  )
}

function DrapeSVG() {
  return (
    <svg viewBox="0 0 300 420" className="w-full h-auto drop-shadow-2xl">
      <defs>
        <linearGradient id="heroFold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E4C97A" />
          <stop offset="100%" stopColor="#9C7C33" />
        </linearGradient>
      </defs>
      <path
        d="M40 20 C 20 120, 20 300, 60 400 C 120 380, 180 380, 240 400 C 280 300, 280 120, 260 20 C 200 40, 100 40, 40 20 Z"
        fill="#4A1329"
        stroke="url(#heroFold)"
        strokeWidth="3"
        pathLength="1000"
        strokeDasharray="1000"
        className="animate-drape"
      />
      {[70, 110, 150, 190, 230].map((x, i) => (
        <path
          key={i}
          d={`M${x} 30 C ${x - 10} 140, ${x - 10} 280, ${x} 395`}
          fill="none"
          stroke="#E4C97A"
          strokeWidth="1"
          opacity="0.35"
        />
      ))}
      <g opacity="0.9">
        {[[90, 90], [170, 130], [130, 220], [200, 250], [100, 320], [190, 340]].map(([cx, cy], i) => (
          <path
            key={i}
            transform={`translate(${cx} ${cy})`}
            d="M0 -14 C 9 -14, 14 -6, 11 2 C 8 9, -3 10, -8 4 C -12 -1, -9 -14, 0 -14 Z"
            fill="#E4C97A"
          />
        ))}
      </g>
      <rect x="30" y="370" width="240" height="14" fill="#E4C97A" />
      <rect x="30" y="30" width="240" height="10" fill="#E4C97A" opacity="0.8" />
    </svg>
  )
}
