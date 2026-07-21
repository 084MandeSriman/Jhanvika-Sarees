import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge, SelectField } from '../components/ui.jsx'

const statuses = ['pending', 'paid', 'failed', 'refunded', 'cancelled']
const toneFor = { pending: 'amber', paid: 'green', failed: 'red', refunded: 'purple', cancelled: 'gray' }

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  function load() {
    setLoading(true)
    adminApi.payments.list({ status: statusFilter || undefined, limit: 100 }).then((res) => setPayments(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={`${payments.length} transactions`}
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
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Razorpay Payment ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 text-ink">{p.order?.orderNumber || '—'}</td>
                  <td className="px-5 py-3 text-ink/60">{p.user?.name || 'Guest'}</td>
                  <td className="px-5 py-3 text-ink/70">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-ink/60 capitalize">{p.paymentMethod || '—'}</td>
                  <td className="px-5 py-3 text-ink/45 text-xs">{p.razorpayPaymentId || '—'}</td>
                  <td className="px-5 py-3"><Badge tone={toneFor[p.status]}>{p.status}</Badge></td>
                  <td className="px-5 py-3 text-ink/50">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No transactions found</p>}
        </div>
      )}
    </div>
  )
}
