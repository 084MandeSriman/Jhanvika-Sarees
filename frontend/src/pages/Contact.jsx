import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { contactApi } from '../api/products.js'
import Seo from '../components/Seo.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await contactApi.send(form)
      setSent(true)
      setTimeout(() => setSent(false), 4000)
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-px py-16">
      <Seo title="Contact Us" description="Get in touch with the Jhanvika team." path="/contact" />
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="eyebrow">We'd Love to Hear From You</span>
        <h1 className="section-title mt-3">Get in Touch</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-maroon/10 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-maroon" />
              </div>
              <div>
                <p className="font-body text-ink">Visit Our Studio</p>
                <p className="text-sm text-ink/55 mt-1">Road No. 12, Banjara Hills, Hyderabad, Telangana 500034</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-maroon/10 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-maroon" />
              </div>
              <div>
                <p className="font-body text-ink">Call Us</p>
                <p className="text-sm text-ink/55 mt-1">+91 98765 43210 (Mon–Sat, 10am–7pm)</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-maroon/10 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-maroon" />
              </div>
              <div>
                <p className="font-body text-ink">Email Us</p>
                <p className="text-sm text-ink/55 mt-1">hello@jhanvika.example</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-sand/60 rounded-2xl p-6 md:p-8 flex flex-col gap-4"
        >
          <label className="block">
            <span className="text-xs tracking-wide uppercase text-ink/50">Your Name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
          <label className="block">
            <span className="text-xs tracking-wide uppercase text-ink/50">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
            />
          </label>
          <label className="block">
            <span className="text-xs tracking-wide uppercase text-ink/50">Message</span>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold resize-none"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
          {error && (
            <p className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} /> {error}
            </p>
          )}
          {sent && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-forest text-sm"
            >
              <CheckCircle2 size={16} /> Thanks! We'll get back to you soon.
            </motion.p>
          )}
        </motion.form>
      </div>
    </div>
  )
}
