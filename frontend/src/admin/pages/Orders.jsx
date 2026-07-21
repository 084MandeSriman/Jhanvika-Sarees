import React, { useEffect, useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge, SelectField } from '../components/ui.jsx'

const statuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned']
const toneFor = { pending: 'amber', confirmed: 'blue', packed: 'purple', shipped: 'purple', delivered: 'green', cancelled: 'red', returned: 'gray' }

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [expanded, setExpanded] = useState(null)

  function load() {
    setLoading(true)
    adminApi.orders.list({ status: statusFilter || undefined, limit: 100 }).then((res) => setOrders(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(order, status) {
    setUpdatingId(order.id)
    try {
      const payload = { status }
      if (status === 'shipped') {
        const courierName = window.prompt('Courier name (optional):', order.courierName || '')
        if (courierName) payload.courierName = courierName
        const trackingUrl = window.prompt('Tracking URL (optional):', order.trackingUrl || '')
        if (trackingUrl) payload.trackingUrl = trackingUrl
      }
      await adminApi.orders.updateStatus(order.id, payload)
      load()
    } finally {
      setUpdatingId(null)
    }
  }

  async function resendEmail(order) {
    await adminApi.orders.resendEmail(order.id)
    alert(`Order confirmation email resent for ${order.orderNumber}`)
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders`}
        action={
          <SelectField
            label=""
            value={statusFilter}
            onChange={setStatusFilter}
            options={[{ value: '', label: 'All statuses' }, ...statuses.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]}
            className="w-48"
          />
        }
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Update</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.map((o) => (
                <React.Fragment key={o.id}>
                  <tr className="hover:bg-ink/[0.02] cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td className="px-5 py-3 text-ink">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-ink/60">{o.user?.name || 'Guest'}</td>
                    <td className="px-5 py-3 text-ink/70">₹{Number(o.total).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <Badge tone={o.paymentStatus === 'paid' ? 'green' : 'amber'}>{o.paymentStatus}</Badge>
                    </td>
                    <td className="px-5 py-3"><Badge tone={toneFor[o.status]}>{o.status}</Badge></td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => updateStatus(o, e.target.value)}
                        className="text-xs border border-ink/15 rounded-lg px-2 py-1.5 outline-none"
                      >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => resendEmail(o)} title="Resend confirmation email" className="text-ink/40 hover:text-maroon">
                        <Mail size={14} />
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={7} className="px-5 py-4 bg-ink/[0.02]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-ink/60">
                          <div>
                            <p className="uppercase tracking-wide text-ink/40 mb-1">Items</p>
                            {o.items?.map((it) => <p key={it.id}>{it.name} × {it.qty} — ₹{Number(it.price * it.qty).toLocaleString('en-IN')}</p>)}
                          </div>
                          <div>
                            <p className="uppercase tracking-wide text-ink/40 mb-1">Shipping Address</p>
                            <p>{o.shippingAddress?.fullName}, {o.shippingAddress?.line1}, {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}</p>
                            <p className="mt-1">{o.shippingAddress?.phone}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No orders found</p>}
        </div>
      )}
    </div>
  )
}
