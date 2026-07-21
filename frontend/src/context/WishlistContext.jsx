import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { wishlistApi } from '../api/orders.js'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'jhanvika_wishlist_v1'

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Persist guest wishlist locally
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, user])

  // On login, pull the server-side wishlist as the source of truth
  useEffect(() => {
    if (user) {
      wishlistApi
        .get()
        .then((res) => setIds(res.data.map((w) => w.productId)))
        .catch(() => {})
    }
  }, [user])

  async function toggle(productId) {
    if (user) {
      const res = await wishlistApi.toggle(productId)
      setIds((prev) => (res.data.wished ? [...prev, productId] : prev.filter((id) => id !== productId)))
    } else {
      setIds((prev) => (prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]))
    }
  }

  function isWished(id) {
    return ids.includes(id)
  }

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWished }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
