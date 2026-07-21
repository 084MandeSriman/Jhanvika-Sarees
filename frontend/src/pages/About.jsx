import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Award, Feather, Heart, Users } from 'lucide-react'
import SareeArt from '../components/SareeArt.jsx'
import Seo from '../components/Seo.jsx'

const values = [
  { icon: Feather, title: 'Handwoven, Always', desc: 'Every saree passes through the hands of a named artisan before it reaches you.' },
  { icon: Award, title: 'Certified Authentic', desc: 'Each weave carries a certificate detailing its origin, fabric, and technique.' },
  { icon: Users, title: 'Fair to Weavers', desc: 'We work directly with weaving clusters, cutting out exploitative middlemen.' },
  { icon: Heart, title: 'Made to Last', desc: 'Our sarees are built to be worn for decades, not seasons.' },
]

export default function About() {
  return (
    <div>
      <Seo title="Our Story" description="Three generations of weaving craft — the story behind Jhanvika." path="/about" />
      <section className="bg-zari-gradient py-20">
        <div className="container-px grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="eyebrow text-gold-light">Our Story</span>
            <h1 className="font-display text-5xl text-ivory mt-3 leading-tight">
              Three Generations. One Loom. Endless Craft.
            </h1>
            <p className="text-ivory/70 font-body mt-6 leading-relaxed">
              Jhanvika began in 1994 in a small workshop behind Varanasi's ghats, where our founder's
              grandmother wove her first Banarasi on a wooden pit loom. Today, we work with over 30
              weaving clusters across India — from the temple town of Kanchipuram to the Chanderi
              belt of Madhya Pradesh — bringing their craft directly to your wardrobe, without the
              markup of a dozen middlemen.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="rounded-2xl overflow-hidden shadow-soft aspect-[4/3]">
            <SareeArt palette={{ primary: '#6B1E3C', secondary: '#4A1329', accent: '#E4C97A' }} className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      <section className="container-px py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="eyebrow">What We Stand For</span>
          <h2 className="section-title mt-3">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-sand/60 rounded-2xl p-6 text-center"
            >
              <v.icon size={26} className="text-maroon mx-auto mb-4" />
              <h3 className="font-body text-ink mb-2">{v.title}</h3>
              <p className="text-sm text-ink/55 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-sand/60 py-20">
        <div className="container-px text-center max-w-2xl mx-auto">
          <h2 className="section-title">Wear the Weave, Carry the Story</h2>
          <p className="text-ink/60 font-body mt-4 leading-relaxed">
            Behind every saree in our collection is a name, a village, and a technique that
            took years to master. When you drape a Jhanvika saree, you carry that story forward.
          </p>
          <Link to="/shop" className="btn-primary mt-8 inline-flex">Explore the Collection</Link>
        </div>
      </section>
    </div>
  )
}
