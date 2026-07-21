import React, { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge, Modal, TextField, SelectField } from '../components/ui.jsx'

const emptyForm = { code: '', type: 'percent', value: 10, minOrderValue: 0, usageLimit: '', expiresAt: '' }

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    adminApi.coupons.list().then((res) => setCoupons(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminApi.coupons.create({
        ...form,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      })
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(c) {
    await adminApi.coupons.update(c.id, { isActive: !c.isActive })
    load()
  }

  async function remove(c) {
    if (!confirm(`Delete coupon ${c.code}?`)) return
    await adminApi.coupons.remove(c.id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle={`${coupons.length} coupons`}
        action={<button onClick={() => setModalOpen(true)} className="btn-primary !py-2.5"><Plus size={16} /> New Coupon</button>}
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Used / Limit</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-ink/[0.02]">
                  <td className="px-5 py-3 text-ink font-medium">{c.code}</td>
                  <td className="px-5 py-3 text-ink/60">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="px-5 py-3 text-ink/60">₹{Number(c.minOrderValue).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-ink/60">{c.usedCount} / {c.usageLimit ?? '∞'}</td>
                  <td className="px-5 py-3"><Badge tone={c.isActive ? 'green' : 'gray'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-5 py-3 text-right flex justify-end gap-3">
                    <button onClick={() => toggleActive(c)} className="text-xs text-maroon hover:underline">{c.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => remove(c)} className="text-ink/40 hover:text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No coupons yet</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Coupon">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <TextField label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} required />
          <SelectField label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={[{ value: 'percent', label: 'Percentage' }, { value: 'flat', label: 'Flat Amount' }]} />
          <TextField label={form.type === 'percent' ? 'Percentage (%)' : 'Amount (₹)'} type="number" value={form.value} onChange={(v) => setForm({ ...form, value: v })} required />
          <TextField label="Minimum Order Value (₹)" type="number" value={form.minOrderValue} onChange={(v) => setForm({ ...form, minOrderValue: v })} />
          <TextField label="Usage Limit (blank = unlimited)" type="number" value={form.usageLimit} onChange={(v) => setForm({ ...form, usageLimit: v })} />
          <TextField label="Expires On" type="date" value={form.expiresAt} onChange={(v) => setForm({ ...form, expiresAt: v })} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create Coupon'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
