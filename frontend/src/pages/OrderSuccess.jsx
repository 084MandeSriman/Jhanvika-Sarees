import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Truck, Home as HomeIcon, Download } from 'lucide-react'
import { downloadInvoice } from '../api/orders.js'

export default function OrderSuccess() {
  const [order, setOrder] = useState(undefined)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('jhanvika_last_order')
      setOrder(raw ? JSON.parse(raw) : null)
    } catch {
      setOrder(null)
    }
  }, [])

  if (order === undefined) return null
  if (order === null) return <Navigate to="/shop" replace />

  const eta = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long',
  })

  return (
    <div className="container-px py-16 max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 size={44} className="text-forest" />
      </motion.div>

      <h1 className="font-display text-4xl text-maroon">Order Confirmed!</h1>
      <p className="text-ink/60 font-body mt-3">
        Thank you for shopping with Jhanvika. Your saree is being prepared with care.
      </p>

      <div className="bg-sand/60 rounded-2xl p-6 mt-8 text-left">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-ink/50">Order ID</span>
          <span className="font-body text-maroon">{order.orderId}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-ink/50">Total Paid</span>
          <span className="font-body text-maroon">₹{order.total.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-ink/50">Payment Method</span>
          <span className="font-body text-ink capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-ink/50">Estimated Delivery</span>
          <span className="font-body text-ink">{eta}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-10">
        <Step icon={CheckCircle2} label="Order Placed" active />
        <Step icon={Package} label="Packed" />
        <Step icon={Truck} label="Shipped" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <button onClick={() => downloadInvoice(order.orderId, order.orderId)} className="btn-outline">
          <Download size={16} /> Download Invoice
        </button>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        <Link to="/" className="btn-outline"><HomeIcon size={16} /> Back to Home</Link>
      </div>
    </div>
  )
}

function Step({ icon: Icon, label, active }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-maroon text-ivory' : 'bg-ink/10 text-ink/40'}`}>
        <Icon size={18} />
      </div>
      <span className={`text-xs font-body ${active ? 'text-maroon' : 'text-ink/40'}`}>{label}</span>
    </div>
  )
}
