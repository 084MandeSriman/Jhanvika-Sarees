import React, { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth.js'
import { setAccessToken, getAccessToken } from '../api/client.js'
import { cartApi } from '../api/cart.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load: if we have a (possibly stale) access token, verify it via
  // /auth/me. If that fails, fall back to a silent refresh using the
  // httpOnly cookie before giving up and treating the visitor as a guest.
  useEffect(() => {
    async function bootstrap() {
      if (getAccessToken()) {
        try {
          const res = await authApi.me()
          setUser(res.data)
          setLoading(false)
          return
        } catch {
          setAccessToken(null)
        }
      }
      try {
        const res = await authApi.refresh()
        setAccessToken(res.data.accessToken)
        setUser(res.data.user)
      } catch {
        // No valid session — visitor is a guest, which is fine.
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  async function mergeGuestCart() {
    try {
      const raw = localStorage.getItem('jhanvika_cart_v1')
      const items = raw ? JSON.parse(raw) : []
      if (items.length > 0) {
        await cartApi.merge(items.map((i) => ({ productId: i.id, qty: i.qty })))
        localStorage.removeItem('jhanvika_cart_v1')
      }
    } catch {
      // non-fatal — guest cart merge is best-effort
    }
  }

  async function login(email, password) {
    const res = await authApi.login({ email, password })
    setAccessToken(res.data.accessToken)
    await mergeGuestCart()
    setUser(res.data.user)
    return res.data.user
  }

  async function register(payload) {
    const res = await authApi.register(payload)
    setAccessToken(res.data.accessToken)
    await mergeGuestCart()
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // ignore — we're clearing local state regardless
    }
    setAccessToken(null)
    setUser(null)
  }

  const isAdmin = user && ['admin', 'superadmin'].includes(user.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
