import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, TextField } from '../components/ui.jsx'

const groups = {
  general: [
    { key: 'site_name', label: 'Site Name' },
    { key: 'support_email', label: 'Support Email' },
    { key: 'support_phone', label: 'Support Phone' },
  ],
  shipping: [
    { key: 'free_shipping_threshold', label: 'Free Shipping Threshold (₹)', type: 'number' },
    { key: 'flat_shipping_fee', label: 'Flat Shipping Fee (₹)', type: 'number' },
  ],
  tax: [
    { key: 'gst_percent', label: 'GST (%)', type: 'number' },
  ],
  social: [
    { key: 'instagram_url', label: 'Instagram URL' },
    { key: 'facebook_url', label: 'Facebook URL' },
  ],
}

export default function Settings() {
  const [tab, setTab] = useState('general')
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logs, setLogs] = useState([])

  function load(group) {
    setLoading(true)
    adminApi.settings.get(group).then((res) => setValues((v) => ({ ...v, ...res.data }))).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (tab === 'activity') {
      setLoading(true)
      adminApi.activityLogs({ limit: 50 }).then((res) => setLogs(res.data)).finally(() => setLoading(false))
    } else {
      load(tab)
    }
  }, [tab])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {}
    groups[tab].forEach((f) => { payload[f.key] = values[f.key] || '' })
    try {
      await adminApi.settings.update(tab, payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Site configuration and audit trail"
        action={
          <div className="flex gap-2 flex-wrap">
            {[...Object.keys(groups), 'activity'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded-full border capitalize ${tab === t ? 'bg-maroon text-ivory border-maroon' : 'border-ink/15 text-ink/60'}`}>
                {t === 'activity' ? 'Activity Log' : t}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : tab === 'activity' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 divide-y divide-ink/5">
          {logs.map((l) => (
            <div key={l.id} className="px-5 py-3 flex items-center justify-between text-sm">
              <div>
                <span className="text-ink">{l.action}</span>
                <span className="text-ink/40 ml-2">by {l.User?.name || 'system'}</span>
              </div>
              <span className="text-xs text-ink/40">{new Date(l.createdAt).toLocaleString('en-IN')}</span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No activity recorded yet</p>}
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-ink/5 max-w-lg flex flex-col gap-4">
          {groups[tab].map((f) => (
            <TextField key={f.key} label={f.label} type={f.type || 'text'} value={values[f.key]} onChange={(v) => setValues({ ...values, [f.key]: v })} />
          ))}
          <button type="submit" disabled={saving} className="btn-primary self-start">{saving ? 'Saving...' : 'Save Settings'}</button>
          {saved && <p className="text-forest text-sm">Settings saved</p>}
        </form>
      )}
    </div>
  )
}
