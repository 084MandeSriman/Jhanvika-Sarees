import React, { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { PageHeader, Badge, Modal, TextField, SelectField } from '../components/ui.jsx'

const emptyForm = { name: '', email: '', password: '', role: 'admin' }

export default function Staff() {
  const { user } = useAuth()
  const isSuperadmin = user?.role === 'superadmin'
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    adminApi.staff.list().then((res) => setStaff(res.data)).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminApi.staff.create(form)
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(s) {
    await adminApi.staff.toggleActive(s.id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Staff Users"
        subtitle={isSuperadmin ? 'Manage admin console access' : 'View admin console users (superadmin can manage)'}
        action={isSuperadmin && <button onClick={() => setModalOpen(true)} className="btn-primary !py-2.5"><Plus size={16} /> Add Staff</button>}
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th>{isSuperadmin && <th className="px-5 py-3 text-right">Action</th>}</tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {staff.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 text-ink">{s.name}</td>
                  <td className="px-5 py-3 text-ink/60">{s.email}</td>
                  <td className="px-5 py-3"><Badge tone="gold">{s.role}</Badge></td>
                  <td className="px-5 py-3"><Badge tone={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Disabled'}</Badge></td>
                  {isSuperadmin && (
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => toggleActive(s)} className={`text-xs hover:underline ${s.isActive ? 'text-red-600' : 'text-forest'}`}>
                        {s.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No staff users found</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <TextField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <TextField label="Temporary Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
          <SelectField label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={[{ value: 'admin', label: 'Admin' }, { value: 'superadmin', label: 'Superadmin' }]} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Staff User'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
