import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Download, LogOut, MapPin, Monitor, Package, Plus, RefreshCw, Trash2, User as UserIcon, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { addressesApi, ordersApi, paymentsApi, downloadInvoice } from '../api/orders.js'
import { authApi } from '../api/auth.js'
import { payOnline } from '../utils/payOnline.js'

const tabs = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'payments', label: 'Payment History', icon: CreditCard },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'sessions', label: 'Sessions', icon: Monitor },
]

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-forest/15 text-forest',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-700',
}

const paymentStatusColors = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-forest/15 text-forest',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
}

export default function Account() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function loadOrders() {
    return ordersApi.mine().then((res) => setOrders(res.data))
  }

  useEffect(() => {
    Promise.all([loadOrders(), addressesApi.list().then((res) => setAddresses(res.data))])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-px py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="eyebrow">My Account</span>
          <h1 className="section-title mt-2">Hi, {user?.name?.split(' ')[0]}</h1>
        </div>
        <button onClick={logout} className="btn-outline">
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-ink/10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-body whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? 'border-maroon text-maroon' : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {!user?.emailVerified && <VerifyBanner />}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading ? (
        <p className="text-ink/50 font-body">Loading...</p>
      ) : (
        <>
          {tab === 'orders' && <OrdersTab orders={orders} onChange={loadOrders} />}
          {tab === 'payments' && <PaymentsTab />}
          {tab === 'addresses' && <AddressesTab addresses={addresses} setAddresses={setAddresses} />}
          {tab === 'profile' && <ProfileTab />}
          {tab === 'sessions' && <SessionsTab />}
        </>
      )}
    </div>
  )
}

function VerifyBanner() {
  const [sent, setSent] = useState(false)
  async function resend() {
    await authApi.resendVerification()
    setSent(true)
  }
  return (
    <div className="flex items-center justify-between gap-4 bg-amber-50 text-amber-800 text-sm rounded-xl px-4 py-3 mb-6">
      <span>Your email isn't verified yet.</span>
      {sent ? <span className="text-xs">Check your inbox for the verification link.</span> : (
        <button onClick={resend} className="text-xs underline shrink-0">Resend verification email</button>
      )}
    </div>
  )
}

function SessionsTab() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    authApi.sessions().then((res) => setSessions(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function revoke(id) {
    await authApi.revokeSession(id)
    load()
  }

  if (loading) return <p className="text-ink/50 font-body">Loading...</p>

  return (
    <div className="flex flex-col gap-3 max-w-lg">
      {sessions.map((s) => (
        <div key={s.id} className="bg-sand/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink">{s.userAgent ? s.userAgent.slice(0, 50) : 'Unknown device'} {s.isCurrent && <span className="text-forest text-xs ml-1">(this device)</span>}</p>
            <p className="text-xs text-ink/45 mt-1">Signed in {new Date(s.createdAt).toLocaleString('en-IN')}</p>
          </div>
          {!s.isCurrent && (
            <button onClick={() => revoke(s.id)} className="text-xs text-red-600 hover:underline shrink-0">Sign out</button>
          )}
        </div>
      ))}
      {sessions.length === 0 && <p className="text-sm text-ink/40">No active sessions found.</p>}
    </div>
  )
}

function OrdersTab({ orders, onChange }) {
  const { user } = useAuth()
  const [busyId, setBusyId] = useState(null)
  const [retryError, setRetryError] = useState('')

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-2xl text-maroon">No orders yet</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Start Shopping</Link>
      </div>
    )
  }

  async function handleRetry(order) {
    setBusyId(order.id)
    setRetryError('')
    try {
      await payOnline(order, { name: user?.name, email: user?.email, contact: user?.phone })
      await onChange()
    } catch (err) {
      setRetryError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleCancel(order) {
    if (!confirm(`Cancel order ${order.orderNumber}?`)) return
    setBusyId(order.id)
    try {
      await ordersApi.cancel(order.id)
      await onChange()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {retryError && <p className="text-red-600 text-sm">{retryError}</p>}
      {orders.map((o) => {
        const canRetry = o.paymentMethod === 'online' && ['pending', 'failed'].includes(o.paymentStatus) && o.status !== 'cancelled'
        const canCancel = ['pending', 'confirmed'].includes(o.status)
        return (
          <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-sand/60 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-body text-ink">{o.orderNumber}</p>
                <p className="text-xs text-ink/50 mt-1">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full capitalize ${paymentStatusColors[o.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                  {o.paymentStatus}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                  {o.status}
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              {o.items?.map((it) => (
                <p key={it.id} className="text-sm text-ink/65">{it.name} × {it.qty}</p>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink/10">
              <span className="text-sm text-ink/50">Total</span>
              <span className="font-body text-maroon">₹{Number(o.total).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <button onClick={() => downloadInvoice(o.id, o.orderNumber)} className="flex items-center gap-1 text-xs text-ink/60 hover:text-maroon">
                <Download size={13} /> Invoice
              </button>
              {canRetry && (
                <button onClick={() => handleRetry(o)} disabled={busyId === o.id} className="flex items-center gap-1 text-xs text-maroon hover:underline">
                  <RefreshCw size={13} /> {busyId === o.id ? 'Opening...' : 'Retry Payment'}
                </button>
              )}
              {canCancel && (
                <button onClick={() => handleCancel(o)} disabled={busyId === o.id} className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                  <XCircle size={13} /> Cancel Order
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function PaymentsTab() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentsApi.history().then((res) => setPayments(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-ink/50 font-body">Loading...</p>

  if (payments.length === 0) {
    return <p className="text-sm text-ink/50 font-body py-10 text-center">No payment transactions yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((p) => (
        <div key={p.id} className="bg-sand/60 rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm text-ink">{p.order?.orderNumber || 'Order'}</p>
            <p className="text-xs text-ink/45 mt-1">{new Date(p.createdAt).toLocaleString('en-IN')} · {p.paymentMethod || 'online'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-body text-maroon">₹{Number(p.amount).toLocaleString('en-IN')}</span>
            <span className={`text-xs px-3 py-1 rounded-full capitalize ${paymentStatusColors[p.status] || 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AddressesTab({ addresses, setAddresses }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', line1: '', city: '', state: '', pincode: '', isDefault: false })
  const [saving, setSaving] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await addressesApi.create(form)
      setAddresses((prev) => [res.data, ...prev])
      setShowForm(false)
      setForm({ fullName: '', phone: '', line1: '', city: '', state: '', pincode: '', isDefault: false })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await addressesApi.remove(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {addresses.map((a) => (
          <div key={a.id} className="bg-sand/60 rounded-2xl p-5 relative">
            {a.isDefault && <span className="absolute top-4 right-4 text-[10px] bg-maroon text-ivory px-2 py-0.5 rounded-full">Default</span>}
            <p className="font-body text-ink">{a.fullName}</p>
            <p className="text-sm text-ink/60 mt-1">{a.phone}</p>
            <p className="text-sm text-ink/60 mt-1">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
            <button onClick={() => handleDelete(a.id)} className="text-xs text-red-600 hover:underline mt-3 flex items-center gap-1">
              <Trash2 size={12} /> Remove
            </button>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-outline">
          <Plus size={16} /> Add New Address
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-sand/60 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          <Field label="Address Line" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} required className="sm:col-span-2" />
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
          <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
          <Field label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} required />
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default address
          </label>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Address'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

function ProfileTab() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saved, setSaved] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    const res = await authApi.updateMe(form)
    setUser(res.data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSave} className="max-w-md flex flex-col gap-4">
      <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
      <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
      <label className="block">
        <span className="text-xs tracking-wide uppercase text-ink/50">Email</span>
        <input disabled value={user?.email || ''} className="mt-1.5 w-full bg-ink/5 border border-ink/10 rounded-lg px-4 py-3 text-sm text-ink/50" />
      </label>
      <button type="submit" className="btn-primary">Save Changes</button>
      {saved && <p className="text-forest text-sm">Profile updated!</p>}
    </form>
  )
}

function Field({ label, value, onChange, required = false, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs tracking-wide uppercase text-ink/50">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  )
}
