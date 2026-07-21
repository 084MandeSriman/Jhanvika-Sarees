import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      const redirectTo = location.state?.from?.pathname || '/account'
      navigate(redirectTo, { replace: true })
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
          <h1 className="font-display text-3xl text-ink mt-3">Welcome Back</h1>
          <p className="text-ink/55 font-body mt-1 text-sm">Sign in to view your orders and wishlist</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-xs tracking-wide uppercase text-ink/50">Email</span>
            <div className="relative mt-1.5">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-ivory border border-ink/15 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                placeholder="you@example.com"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs tracking-wide uppercase text-ink/50">Password</span>
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-ivory border border-ink/15 rounded-lg pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button type="submit" disabled={loading} className="btn-primary mt-2 disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/55 mt-6">
          New to Jhanvika? <Link to="/register" className="text-maroon hover:underline">Create an account</Link>
        </p>
        <p className="text-center text-xs text-ink/40 mt-3">
          Demo login: demo@jhanvika.example / Customer@123
        </p>
      </motion.div>
    </div>
  )
}
