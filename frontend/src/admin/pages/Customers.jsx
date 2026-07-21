import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge } from '../components/ui.jsx'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    adminApi.customers.list({ limit: 100 }).then((res) => setCustomers(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function toggleActive(c) {
    setBusyId(c.id)
    try {
      await adminApi.customers.toggleActive(c.id)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} registered customers`} />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 text-ink">{c.name}</td>
                  <td className="px-5 py-3 text-ink/60">{c.email}</td>
                  <td className="px-5 py-3 text-ink/60">{c.phone || '—'}</td>
                  <td className="px-5 py-3 text-ink/50">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3"><Badge tone={c.isActive ? 'green' : 'red'}>{c.isActive ? 'Active' : 'Disabled'}</Badge></td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={busyId === c.id}
                      className={`text-xs hover:underline ${c.isActive ? 'text-red-600' : 'text-forest'}`}
                    >
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No customers yet</p>}
        </div>
      )}
    </div>
  )
}
