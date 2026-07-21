import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { testimonials } from '../data/testimonials.js'

export default function Testimonials() {
  return (
    <section className="bg-sand py-20">
      <div className="container-px">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="eyebrow">Loved Nationwide</span>
          <h2 className="section-title mt-3">Words from Our Circle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-ivory rounded-2xl p-6 shadow-card flex flex-col"
            >
              <Quote size={22} className="text-gold mb-3" />
              <p className="font-body text-sm text-ink/75 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={14} className={idx < t.rating ? 'fill-gold text-gold' : 'text-ink/20'} />
                ))}
              </div>
              <p className="font-body text-sm text-maroon mt-2">{t.name}</p>
              <p className="text-xs text-ink/45">{t.location}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
