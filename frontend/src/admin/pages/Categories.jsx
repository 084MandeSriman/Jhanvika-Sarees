import React, { useEffect, useState } from 'react'
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { categoriesApi } from '../../api/products.js'
import { resolveImageUrl } from '../../api/config.js'
import { PageHeader, Modal, TextField } from '../components/ui.jsx'

const emptyForm = { name: '', tagline: '' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)

  function load() {
    setLoading(true)
    categoriesApi.list().then((res) => setCategories(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(c) {
    setEditing(c)
    setForm({ name: c.name, tagline: c.tagline || '' })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await adminApi.categories.update(editing.id, form)
      else await adminApi.categories.create(form)
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(c) {
    if (!confirm(`Delete category "${c.name}"? If it has products, it will be deactivated instead.`)) return
    await adminApi.categories.remove(c.id)
    load()
  }

  async function handleImageUpload(category, file) {
    if (!file) return
    setUploadingId(category.id)
    try {
      await adminApi.categories.uploadImage(category.id, file)
      load()
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        action={<button onClick={openCreate} className="btn-primary !py-2.5"><Plus size={16} /> Add Category</button>}
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-ink/5">
              <div className="flex flex-col gap-4">
                {c.imageUrl && (
                  <img
                    src={resolveImageUrl(c.imageUrl)}
                    alt={c.name}
                    className="h-40 w-full rounded-2xl object-cover"
                  />
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-ink">{c.name}</p>
                    <p className="text-xs text-ink/50 mt-1">{c.tagline}</p>
                    <p className="text-[10px] text-ink/35 mt-1">/{c.slug}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(c)} className="text-ink/40 hover:text-maroon"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(c)} className="text-ink/40 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                <label className="text-xs text-maroon hover:underline cursor-pointer flex items-center gap-1">
                  {uploadingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(c, e.target.files[0])} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <TextField label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
