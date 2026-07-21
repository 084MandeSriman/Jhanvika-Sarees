import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { contactApi } from '../api/products.js'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    try {
      await contactApi.subscribe(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="container-px py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-zari-gradient rounded-3xl px-6 md:px-16 py-14 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, #E4C97A 0, transparent 35%), radial-gradient(circle at 80% 80%, #E4C97A 0, transparent 35%)'
        }} />
        <div className="relative z-10 max-w-lg mx-auto">
          <Mail className="mx-auto text-gold-light mb-4" size={28} />
          <h2 className="font-display text-3xl md:text-4xl text-ivory">Join the Jhanvika Circle</h2>
          <p className="text-ivory/70 mt-3 font-body text-sm">
            New weaves, styling notes, and early access to festive drops — straight to your inbox.
          </p>

          {submitted ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-gold-light font-body">
              <CheckCircle2 size={20} /> You're on the list! Welcome to the circle.
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-full px-5 py-3 bg-ivory/95 text-ink font-body text-sm outline-none focus:ring-2 focus:ring-gold"
                />
                <button type="submit" className="btn-gold whitespace-nowrap">Subscribe</button>
              </form>
              {error && (
                <p className="flex items-center justify-center gap-2 text-red-200 text-xs mt-3">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </section>
  )
}
