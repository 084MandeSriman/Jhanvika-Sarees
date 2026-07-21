import React, { useEffect, useState } from 'react'
import { Archive, Loader2, Plus, RotateCcw, Search, Upload } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { categoriesApi } from '../../api/products.js'
import ProductVisual from '../../components/ProductVisual.jsx'
import { PageHeader, Badge, Modal, TextField, TextArea, SelectField } from '../components/ui.jsx'

const emptyForm = {
  name: '', price: '', mrp: '', fabric: '', occasion: '', description: '',
  stock: 0, categoryId: '', bestseller: false, isNew: false, status: 'published',
  highlightsText: '', paletteJson: { primary: '#6B1E3C', secondary: '#4A1329', accent: '#E4C97A' },
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)

  function load() {
    setLoading(true)
    adminApi.products.list({ search, limit: 100 }).then((res) => setProducts(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { categoriesApi.list().then((res) => setCategories(res.data)) }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({
      name: p.name, price: p.price, mrp: p.mrp, fabric: p.fabric || '', occasion: p.occasion || '',
      description: p.description || '', stock: p.stock, categoryId: p.categoryId,
      bestseller: p.bestseller, isNew: p.isNew, status: p.status,
      highlightsText: (p.highlights || []).join('\n'),
      paletteJson: p.paletteJson || { primary: '#6B1E3C', secondary: '#4A1329', accent: '#E4C97A' },
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      price: form.price,
      mrp: form.mrp,
      fabric: form.fabric,
      occasion: form.occasion,
      description: form.description,
      stock: form.stock,
      categoryId: form.categoryId,
      bestseller: form.bestseller,
      isNew: form.isNew,
      status: form.status,
      paletteJson: form.paletteJson,
      highlights: form.highlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (editing) await adminApi.products.update(editing.id, payload)
      else await adminApi.products.create(payload)
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive(p) {
    if (!confirm(`Archive "${p.name}"? It will be hidden from the storefront (soft delete).`)) return
    await adminApi.products.remove(p.id)
    load()
  }

  async function handleRestore(p) {
    await adminApi.products.restore(p.id)
    load()
  }

  async function handleImageUpload(product, file) {
    if (!file) return
    setUploadingId(product.id)
    try {
      await adminApi.products.uploadImage(product.id, file, product.name)
      load()
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products`}
        action={
          <button onClick={openCreate} className="btn-primary !py-2.5"><Plus size={16} /> Add Product</button>
        }
      />

      <div className="relative max-w-sm mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-white border border-ink/15 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Photo</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-ink/[0.02]">
                  <td className="px-5 py-3">
                    <button onClick={() => openEdit(p)} className="flex items-center gap-3 text-left">
                      <div className="w-10 h-12 rounded overflow-hidden shrink-0"><ProductVisual product={p} className="w-full h-full object-cover" /></div>
                      <span className="text-ink hover:text-maroon line-clamp-1">{p.name}</span>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-ink/60">{p.category?.name}</td>
                  <td className="px-5 py-3 text-ink/70">₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span className={p.stock <= 5 ? 'text-red-600 font-medium' : 'text-ink/70'}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={p.status === 'published' ? 'green' : p.status === 'draft' ? 'amber' : 'gray'}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <label className="text-xs text-maroon hover:underline cursor-pointer flex items-center gap-1">
                      {uploadingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(p, e.target.files[0])} />
                    </label>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {p.status === 'archived' ? (
                      <button onClick={() => handleRestore(p)} className="text-xs text-forest hover:underline flex items-center gap-1 ml-auto"><RotateCcw size={12} /> Restore</button>
                    ) : (
                      <button onClick={() => handleArchive(p)} className="text-xs text-red-600 hover:underline flex items-center gap-1 ml-auto"><Archive size={12} /> Archive</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} wide>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required className="sm:col-span-2" />
          <SelectField
            label="Category"
            value={form.categoryId}
            onChange={(v) => setForm({ ...form, categoryId: v })}
            options={[{ value: '', label: 'Select category' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Archived' }]}
          />
          <TextField label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
          <TextField label="MRP (₹)" type="number" value={form.mrp} onChange={(v) => setForm({ ...form, mrp: v })} required />
          <TextField label="Fabric" value={form.fabric} onChange={(v) => setForm({ ...form, fabric: v })} />
          <TextField label="Occasion" value={form.occasion} onChange={(v) => setForm({ ...form, occasion: v })} />
          <TextField label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} /> Bestseller
            </label>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> Mark as New
            </label>
          </div>
          <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} className="sm:col-span-2" />
          <TextArea label="Highlights (one per line)" value={form.highlightsText} onChange={(v) => setForm({ ...form, highlightsText: v })} className="sm:col-span-2" />

          <div className="sm:col-span-2">
            <span className="text-xs tracking-wide uppercase text-ink/50">Swatch Colors (used for generated art)</span>
            <div className="flex gap-4 mt-2">
              {['primary', 'secondary', 'accent'].map((key) => (
                <label key={key} className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={form.paletteJson[key]}
                    onChange={(e) => setForm({ ...form, paletteJson: { ...form.paletteJson, [key]: e.target.value } })}
                    className="w-10 h-10 rounded cursor-pointer border border-ink/15"
                  />
                  <span className="text-[10px] text-ink/40 capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
