import React, { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Modal, TextField, TextArea } from '../components/ui.jsx'

const emptyForm = { slug: '', title: '', content: '' }

export default function CmsPages() {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    adminApi.cms.list().then((res) => setPages(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(p) {
    setEditing(p)
    setForm({ slug: p.slug, title: p.title, content: p.content })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await adminApi.cms.update(editing.id, form)
      else await adminApi.cms.create(form)
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="CMS Pages"
        subtitle="About, policies, and other static content"
        action={<button onClick={openCreate} className="btn-primary !py-2.5"><Plus size={16} /> New Page</button>}
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 divide-y divide-ink/5">
          {pages.map((p) => (
            <button key={p.id} onClick={() => openEdit(p)} className="w-full text-left px-5 py-4 hover:bg-ink/[0.02] flex items-center justify-between">
              <div>
                <p className="text-sm text-ink">{p.title}</p>
                <p className="text-xs text-ink/40">/{p.slug}</p>
              </div>
              <p className="text-xs text-ink/40 line-clamp-1 max-w-xs">{p.content}</p>
            </button>
          ))}
          {pages.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No pages yet</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Page' : 'New Page'} wide>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <TextField label="Slug (URL path)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required placeholder="about-us" />
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <TextArea label="Content" value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={10} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Page'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
