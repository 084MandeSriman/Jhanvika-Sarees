import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/account', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-px py-20 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <span className="font-wordmark text-3xl text-maroon">Jhanvika</span>
          <h1 className="font-display text-3xl text-ink mt-3">Create Your Account</h1>
          <p className="text-ink/55 font-body mt-1 text-sm">Join the circle for faster checkout &amp; order tracking</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label="Phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field
            label="Password (min. 6 characters)"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
          />

          <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/55 mt-6">
          Already have an account? <Link to="/login" className="text-maroon hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="block">
      <span className="text-xs tracking-wide uppercase text-ink/50">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  )
}
