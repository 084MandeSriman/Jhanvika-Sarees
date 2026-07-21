import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLogin() {
  const { login, isAdmin } = useAuth()
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
      const user = await login(form.email, form.password)
      if (!['admin', 'superadmin'].includes(user.role)) {
        setError('This account does not have admin access.')
        setLoading(false)
        return
      }
      const redirectTo = location.state?.from?.pathname || '/admin'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ShieldCheck size={28} className="mx-auto text-gold-light mb-3" />
          <span className="font-wordmark text-3xl text-gold-light">Jhanvika</span>
          <p className="text-ivory/50 text-xs tracking-widest uppercase mt-2">Admin Console</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-900/40 text-red-200 text-sm rounded-lg px-4 py-3 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/40" />
            <input
              type="email"
              required
              placeholder="admin@jhanvika.example"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-ivory/5 border border-ivory/15 rounded-lg pl-11 pr-4 py-3 text-sm text-ivory outline-none focus:ring-2 focus:ring-gold placeholder:text-ivory/30"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/40" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-ivory/5 border border-ivory/15 rounded-lg pl-11 pr-4 py-3 text-sm text-ivory outline-none focus:ring-2 focus:ring-gold placeholder:text-ivory/30"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-gold disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-ivory/40 mt-6">
          Seeded login: admin@jhanvika.example / Admin@12345
        </p>
      </div>
    </div>
  )
}
