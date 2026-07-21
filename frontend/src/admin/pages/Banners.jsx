import React, { useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge, Modal, TextField, SelectField } from '../components/ui.jsx'

const emptyForm = { title: '', subtitle: '', linkUrl: '', position: 'home_hero', sortOrder: 0 }

export default function Banners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    adminApi.banners.list().then((res) => setBanners(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminApi.banners.create(form)
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(b) {
    await adminApi.banners.update(b.id, { isActive: !b.isActive })
    load()
  }

  async function remove(b) {
    if (!confirm(`Delete banner "${b.title}"?`)) return
    await adminApi.banners.remove(b.id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Banners"
        subtitle="Homepage hero & offer banners"
        action={<button onClick={() => setModalOpen(true)} className="btn-primary !py-2.5"><Plus size={16} /> New Banner</button>}
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-ink/5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg text-ink">{b.title}</p>
                  <p className="text-xs text-ink/50 mt-1">{b.subtitle}</p>
                  <p className="text-[10px] text-ink/35 mt-1">{b.position} · links to {b.linkUrl || '—'}</p>
                </div>
                <Badge tone={b.isActive ? 'green' : 'gray'}>{b.isActive ? 'Live' : 'Hidden'}</Badge>
              </div>
              <div className="flex gap-4 mt-3">
                <button onClick={() => toggleActive(b)} className="text-xs text-maroon hover:underline">{b.isActive ? 'Hide' : 'Show'}</button>
                <button onClick={() => remove(b)} className="text-xs text-red-600 hover:underline flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-ink/40 py-10 text-center col-span-2">No banners yet</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Banner">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <TextField label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
          <TextField label="Link URL" value={form.linkUrl} onChange={(v) => setForm({ ...form, linkUrl: v })} placeholder="/shop?category=bridal" />
          <SelectField
            label="Position"
            value={form.position}
            onChange={(v) => setForm({ ...form, position: v })}
            options={[{ value: 'home_hero', label: 'Home Hero' }, { value: 'home_offer', label: 'Home Offer' }, { value: 'category_top', label: 'Category Top' }]}
          />
          <TextField label="Sort Order" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Create Banner'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
