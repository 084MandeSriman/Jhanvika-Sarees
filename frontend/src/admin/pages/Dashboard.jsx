import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, IndianRupee, Loader2, Package, ShoppingCart, Users } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, StatCard, Badge } from '../components/ui.jsx'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.dashboard().then((res) => setData(res.data)).catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="text-red-600 text-sm">{error}</p>
  if (!data) return <Loader2 className="animate-spin text-maroon" />

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Store performance at a glance" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${data.revenue.toLocaleString('en-IN')}`} sub={`${data.paidOrders} paid orders`} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={data.totalOrders} sub={`${data.pendingOrders} pending`} />
        <StatCard icon={Users} label="Customers" value={data.totalCustomers} />
        <StatCard icon={Package} label="Products Live" value={data.totalProducts} sub={data.lowStockCount > 0 ? `${data.lowStockCount} low stock` : 'Stock healthy'} />
      </div>

      {data.lowStockCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 text-sm rounded-xl px-4 py-3 mb-8">
          <AlertTriangle size={16} /> {data.lowStockCount} product(s) are running low on stock (≤5 units).{' '}
          <Link to="/admin/products" className="underline">Review products</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-ink/5">
          <h2 className="font-display text-xl text-ink mb-4">Recent Orders</h2>
          <div className="flex flex-col divide-y divide-ink/5">
            {data.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-ink">{o.orderNumber}</p>
                  <p className="text-xs text-ink/45">{o.user?.name || o.guestEmail || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-ink">₹{Number(o.total).toLocaleString('en-IN')}</p>
                  <Badge tone={o.status === 'delivered' ? 'green' : o.status === 'cancelled' ? 'red' : 'amber'}>{o.status}</Badge>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && <p className="text-sm text-ink/40 py-6 text-center">No orders yet</p>}
          </div>
          <Link to="/admin/orders" className="text-sm text-maroon hover:underline mt-4 inline-block">View all orders →</Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink/5">
          <h2 className="font-display text-xl text-ink mb-4">Top Products</h2>
          <div className="flex flex-col divide-y divide-ink/5">
            {data.topProducts.map((p) => (
              <div key={p.productId} className="py-3">
                <p className="text-sm text-ink line-clamp-1">{p.name}</p>
                <div className="flex justify-between text-xs text-ink/45 mt-1">
                  <span>{p.unitsSold} sold</span>
                  <span>₹{Number(p.revenue).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
            {data.topProducts.length === 0 && <p className="text-sm text-ink/40 py-6 text-center">No sales yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
