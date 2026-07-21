import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-ink/5">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-wide uppercase text-ink/45">{label}</p>
        {Icon && <Icon size={16} className="text-maroon" />}
      </div>
      <p className="font-display text-3xl text-ink mt-2">{value}</p>
      {sub && <p className="text-xs text-ink/40 mt-1">{sub}</p>}
    </div>
  )
}

export function Badge({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-forest/15 text-forest',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    gold: 'bg-gold/20 text-gold-dark',
  }
  return <span className={`text-xs px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${tones[tone] || tones.gray}`}>{children}</span>
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink/50 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-ink/50 z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-[92vw] ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[85vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10 sticky top-0 bg-white">
              <h3 className="font-display text-xl text-ink">{title}</h3>
              <button onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function TextField({ label, value, onChange, type = 'text', required = false, placeholder = '', className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs tracking-wide uppercase text-ink/50">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  )
}

export function TextArea({ label, value, onChange, rows = 4, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs tracking-wide uppercase text-ink/50">{label}</span>
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold resize-none"
      />
    </label>
  )
}

export function SelectField({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs tracking-wide uppercase text-ink/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full bg-ivory border border-ink/15 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}
