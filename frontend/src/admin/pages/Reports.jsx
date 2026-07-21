import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader } from '../components/ui.jsx'

const tabs = ['sales', 'inventory', 'customers', 'search']

export default function Reports() {
  const [tab, setTab] = useState('sales')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetcher = tab === 'sales' ? adminApi.reports.sales()
      : tab === 'inventory' ? adminApi.reports.inventory()
      : tab === 'customers' ? adminApi.reports.customers()
      : adminApi.searchAnalytics()
    fetcher.then((res) => setRows(res.data)).finally(() => setLoading(false))
  }, [tab])

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Sales, inventory, and customer analytics"
        action={
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded-full border capitalize ${tab === t ? 'bg-maroon text-ivory border-maroon' : 'border-ink/15 text-ink/60'}`}>
                {t}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-x-auto">
          {tab === 'sales' && (
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
                <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Discounts</th><th className="px-5 py-3">Revenue</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3">{r.date}</td>
                    <td className="px-5 py-3">{r.orders}</td>
                    <td className="px-5 py-3">₹{Number(r.discounts || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-maroon">₹{Number(r.revenue).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'inventory' && (
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
                <tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Stock</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3">{r.name}</td>
                    <td className="px-5 py-3 text-ink/50">{r.sku}</td>
                    <td className="px-5 py-3 text-ink/50">{r.category?.name}</td>
                    <td className={`px-5 py-3 ${r.stock <= 5 ? 'text-red-600 font-medium' : ''}`}>{r.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'customers' && (
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
                <tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Lifetime Value</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3">{r.name}</td>
                    <td className="px-5 py-3 text-ink/50">{r.email}</td>
                    <td className="px-5 py-3">{r.orderCount || 0}</td>
                    <td className="px-5 py-3 text-maroon">₹{Number(r.lifetimeValue || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'search' && rows && (
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-ink/5">
              <div>
                <p className="px-5 py-3 text-xs uppercase tracking-wide text-ink/50 bg-ink/[0.03]">Top Searches</p>
                {(rows.topSearches || []).map((r, i) => (
                  <div key={i} className="px-5 py-2.5 flex justify-between text-sm border-t border-ink/5">
                    <span>{r.query}</span>
                    <span className="text-ink/50">{r.count}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="px-5 py-3 text-xs uppercase tracking-wide text-ink/50 bg-ink/[0.03]">No-Result Searches</p>
                {(rows.noResultSearches || []).map((r, i) => (
                  <div key={i} className="px-5 py-2.5 flex justify-between text-sm border-t border-ink/5">
                    <span>{r.query}</span>
                    <span className="text-ink/50">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab !== 'search' && Array.isArray(rows) && rows.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No data yet</p>}
        </div>
      )}
    </div>
  )
}
