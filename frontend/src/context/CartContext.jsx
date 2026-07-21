import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { cartApi } from '../api/cart.js'

const CartContext = createContext(null)
const STORAGE_KEY = 'jhanvika_cart_v1'

// Normalizes the backend Cart shape (Cart -> items -> product) into the flat
// shape the UI already renders, so ProductCard/CartDrawer/Cart.jsx don't
// need to know whether they're looking at a guest or a server cart.
function normalizeServerItem(cartItem) {
  const p = cartItem.product || {}
  return {
    key: cartItem.id, // cart_item.id — used for update/remove/save-for-later calls
    id: cartItem.productId, // product id — used for links
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    palette: p.paletteJson,
    images: p.images,
    fabric: p.fabric,
    qty: cartItem.qty,
    savedForLater: cartItem.savedForLater,
  }
}

function readLocalCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState(() => readLocalCart().map((i) => ({ ...i, key: i.id })))
  const [savedItems, setSavedItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  // Guests: persist to localStorage on every change.
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, user])

  // Logged in: server cart is the source of truth.
  async function reloadServerCart() {
    const res = await cartApi.get()
    const all = (res.data?.items || []).map(normalizeServerItem)
    setItems(all.filter((i) => !i.savedForLater))
    setSavedItems(all.filter((i) => i.savedForLater))
  }

  useEffect(() => {
    if (!authLoading && user) {
      reloadServerCart().catch(() => {})
    }
    if (!authLoading && !user) {
      setItems(readLocalCart().map((i) => ({ ...i, key: i.id })))
      setSavedItems([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  async function addItem(product, qty = 1) {
    if (user) {
      await cartApi.addItem(product.id, qty)
      await reloadServerCart()
      setIsOpen(true)
      return
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, {
        key: product.id,
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        palette: product.paletteJson || product.palette,
        images: product.images,
        fabric: product.fabric,
        qty,
      }]
    })
    setIsOpen(true)
  }

  async function updateQty(key, qty) {
    if (qty < 1) return removeItem(key)
    if (user) {
      await cartApi.updateItem(key, qty)
      await reloadServerCart()
      return
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)))
  }

  async function removeItem(key) {
    if (user) {
      await cartApi.removeItem(key)
      await reloadServerCart()
      return
    }
    setItems((prev) => prev.filter((i) => i.key !== key))
  }

  async function clearCart() {
    if (user) {
      await cartApi.clear()
      setItems([])
      return
    }
    setItems([])
  }

  async function saveForLater(key) {
    if (!user) return // guests don't have a saved-for-later list
    await cartApi.saveForLater(key)
    await reloadServerCart()
  }

  async function moveToCart(key) {
    if (!user) return
    await cartApi.moveToCart(key)
    await reloadServerCart()
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  const value = {
    items, savedItems, addItem, updateQty, removeItem, clearCart,
    saveForLater, moveToCart, subtotal, count, isOpen, setIsOpen,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
