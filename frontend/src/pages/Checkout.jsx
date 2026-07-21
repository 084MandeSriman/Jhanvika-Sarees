import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronLeft, Landmark, Loader2, Lock, MapPin, ShieldCheck, Tag, Wallet } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ordersApi } from '../api/orders.js'
import { couponsApi } from '../api/products.js'
import { settingsApi } from '../api/cart.js'
import { payOnline } from '../utils/payOnline.js'

const steps = ['Address', 'Payment', 'Review']

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('online') // 'online' (Razorpay) | 'cod'

  const [address, setAddress] = useState({
    fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    line1: '', city: '', state: '', pincode: '',
  })

  const [couponCode, setCouponCode] = useState('')
  const [couponStatus, setCouponStatus] = useState(null) // { discount, code } | { error }
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const [siteSettings, setSiteSettings] = useState({ free_shipping_threshold: 2999, flat_shipping_fee: 149, gst_percent: 0 })
  useEffect(() => {
    settingsApi.getPublic().then((res) => setSiteSettings((s) => ({ ...s, ...res.data }))).catch(() => {})
  }, [])

  const discount = couponStatus?.discount || 0
  const freeShippingThreshold = Number(siteSettings.free_shipping_threshold ?? 2999)
  const flatShippingFee = Number(siteSettings.flat_shipping_fee ?? 149)
  const gstPercent = Number(siteSettings.gst_percent ?? 0)
  const taxableAmount = Math.max(subtotal - discount, 0)
  const shipping = taxableAmount >= freeShippingThreshold || subtotal === 0 ? 0 : flatShippingFee
  const tax = Math.round((taxableAmount * gstPercent) / 100)
  const total = taxableAmount + shipping + tax

  if (items.length === 0 && !placing) {
    return (
      <div className="container-px py-24 text-center">
        <h1 className="font-display text-3xl text-maroon">Nothing to check out</h1>
        <p className="text-ink/55 mt-2 font-body">Add a saree to your bag before checking out.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Explore Collection</Link>
      </div>
    )
  }

  function isAddressValid() {
    const required = ['fullName', 'email', 'phone', 'line1', 'city', 'state', 'pincode']
    return required.every((k) => address[k]?.trim().length > 0)
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    setCouponStatus(null)
    try {
      const res = await couponsApi.validate(couponCode, subtotal)
      setCouponStatus({ code: res.data.code, discount: res.data.discount })
    } catch (err) {
      setCouponStatus({ error: err.message })
    } finally {
      setApplyingCoupon(false)
    }
  }

  async function payWithRazorpay(order) {
    await payOnline(order, { name: address.fullName, email: address.email, contact: address.phone })
  }

  async function handlePlaceOrder() {
    setPlacing(true)
    setPlaceError('')
    try {
      const orderRes = await ordersApi.create({
        items: items.map((i) => ({ productId: i.id, qty: i.qty })),
        address,
        paymentMethod,
        couponCode: couponStatus?.code,
      })
      const order = orderRes.data

      if (paymentMethod === 'online') {
        await payWithRazorpay(order)
      }

      sessionStorage.setItem('jhanvika_last_order', JSON.stringify({ orderId: order.orderNumber, total: Number(order.total), paymentMethod }))
      clearCart()
      navigate('/order-success')
    } catch (err) {
      setPlaceError(err.message)
      setPlacing(false)
    }
  }

  return (
    <div className="container-px py-10">
      <h1 className="section-title mb-2">Checkout</h1>
      <p className="text-ink/50 font-body mb-8 flex items-center gap-2 text-sm">
        <Lock size={14} /> Payments are processed securely by Razorpay — Jhanvika never sees your card or UPI details.
      </p>

      <div className="flex items-center gap-4 mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body transition-colors ${i <= step ? 'bg-maroon text-ivory' : 'bg-ink/10 text-ink/50'}`}>
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-body ${i === step ? 'text-maroon' : 'text-ink/50'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="w-8 md:w-16 h-px bg-ink/15" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl text-maroon mb-5 flex items-center gap-2"><MapPin size={20} /> Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={address.fullName} onChange={(v) => setAddress({ ...address, fullName: v })} />
                  <Input label="Email" type="email" value={address.email} onChange={(v) => setAddress({ ...address, email: v })} />
                  <Input label="Phone Number" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} type="tel" />
                  <Input label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} />
                  <Input label="Address Line" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} className="sm:col-span-2" />
                  <Input label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} />
                  <Input label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} />
                </div>
                {!user && (
                  <p className="text-xs text-ink/45 mt-4">
                    Checking out as a guest. <Link to="/login" className="text-maroon hover:underline">Sign in</Link> to save this address and track your order later.
                  </p>
                )}
                <button disabled={!isAddressValid()} onClick={() => setStep(1)} className="btn-primary mt-8 disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl text-maroon mb-5 flex items-center gap-2"><Wallet size={20} /> Payment Method</h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <PaymentTab icon={ShieldCheck} label="Pay Online" sublabel="UPI, Card, Netbanking, Wallet" active={paymentMethod === 'online'} onClick={() => setPaymentMethod('online')} />
                  <PaymentTab icon={Landmark} label="Cash on Delivery" sublabel="Pay when it arrives" active={paymentMethod === 'cod'} onClick={() => setPaymentMethod('cod')} />
                </div>

                {paymentMethod === 'online' && (
                  <p className="text-sm text-ink/60 font-body bg-sand/60 rounded-xl p-4 flex items-center gap-2">
                    <Lock size={14} className="shrink-0" /> You'll choose UPI, card, netbanking, or wallet inside Razorpay's secure checkout window — we never store your payment details.
                  </p>
                )}
                {paymentMethod === 'cod' && (
                  <p className="text-sm text-ink/60 font-body bg-sand/60 rounded-xl p-4">
                    Pay in cash when your saree is delivered to your doorstep.
                  </p>
                )}

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(0)} className="btn-outline"><ChevronLeft size={16} /> Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary">Review Order</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl text-maroon mb-5">Review Order</h2>

                <div className="bg-sand/60 rounded-xl p-5 mb-4">
                  <h3 className="font-body text-sm tracking-widest uppercase text-ink/60 mb-2">Deliver To</h3>
                  <p className="font-body text-ink">{address.fullName} · {address.phone}</p>
                  <p className="text-sm text-ink/60 mt-1">{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
                </div>

                <div className="bg-sand/60 rounded-xl p-5 mb-4">
                  <h3 className="font-body text-sm tracking-widest uppercase text-ink/60 mb-2">Payment Method</h3>
                  <p className="font-body text-ink">{paymentMethod === 'online' ? 'Pay Online via Razorpay' : 'Cash on Delivery'}</p>
                </div>

                <div className="bg-sand/60 rounded-xl p-5 mb-4">
                  <h3 className="font-body text-sm tracking-widest uppercase text-ink/60 mb-3">Have a Coupon?</h3>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="JHANVIKA10"
                        className="w-full bg-ivory border border-ink/15 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <button onClick={applyCoupon} disabled={applyingCoupon} className="btn-outline !py-2.5 !px-5 text-xs">
                      {applyingCoupon ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponStatus?.discount > 0 && (
                    <p className="text-forest text-xs mt-2 flex items-center gap-1"><CheckCircle2 size={14} /> {couponStatus.code} applied — you saved ₹{couponStatus.discount.toLocaleString('en-IN')}</p>
                  )}
                  {couponStatus?.error && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1"><AlertCircle size={14} /> {couponStatus.error}</p>
                  )}
                </div>

                <div className="bg-sand/60 rounded-xl p-5">
                  <h3 className="font-body text-sm tracking-widest uppercase text-ink/60 mb-3">Items ({items.length})</h3>
                  <div className="flex flex-col gap-2">
                    {items.map((i) => (
                      <div key={i.key} className="flex justify-between text-sm">
                        <span className="text-ink/70">{i.name} × {i.qty}</span>
                        <span className="text-ink">₹{(i.price * i.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {placeError && (
                  <p className="flex items-center gap-2 text-red-600 text-sm mt-4"><AlertCircle size={16} /> {placeError}</p>
                )}

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(1)} className="btn-outline" disabled={placing}><ChevronLeft size={16} /> Back</button>
                  <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary min-w-[200px]">
                    {placing ? (
                      <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> {paymentMethod === 'online' ? 'Opening Secure Checkout...' : 'Placing Order...'}</span>
                    ) : (
                      `Place Order · ₹${total.toLocaleString('en-IN')}`
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-sand/60 rounded-2xl p-6 h-fit sticky top-28">
          <h2 className="font-display text-2xl text-maroon mb-5">Order Summary</h2>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-4">
            {items.map((i) => (
              <div key={i.key} className="flex justify-between text-sm text-ink/65">
                <span>{i.name} × {i.qty}</span>
                <span>₹{(i.price * i.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink/10 my-2" />
          <div className="flex justify-between text-sm text-ink/65 mb-2 mt-3">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-forest mb-2">
              <span>Coupon Discount</span>
              <span>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-ink/65 mb-4">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
          </div>
          {gstPercent > 0 && (
            <div className="flex justify-between text-sm text-ink/65 mb-4">
              <span>GST ({gstPercent}%)</span>
              <span>₹{tax.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between font-body text-lg text-maroon">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder = '', className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs tracking-wide uppercase text-ink/50">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
      />
    </label>
  )
}

function PaymentTab({ icon: Icon, label, sublabel, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-5 rounded-xl border text-xs font-body transition-colors ${active ? 'border-maroon bg-maroon/5 text-maroon' : 'border-ink/15 text-ink/60 hover:border-maroon/50'}`}
    >
      <Icon size={22} />
      <span className="font-medium">{label}</span>
      <span className="text-[10px] text-ink/45">{sublabel}</span>
    </button>
  )
}
