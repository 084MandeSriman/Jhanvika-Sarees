import React, { useEffect, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge, TextField } from '../components/ui.jsx'

export default function EmailLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [testTo, setTestTo] = useState('')
  const [sending, setSending] = useState(false)
  const [testResult, setTestResult] = useState('')

  function load() {
    setLoading(true)
    adminApi.emailLogs({ limit: 50 }).then((res) => setLogs(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function sendTest(e) {
    e.preventDefault()
    setSending(true)
    setTestResult('')
    try {
      const res = await adminApi.sendTestEmail(testTo)
      setTestResult(res.data.message)
      load()
    } catch (err) {
      setTestResult(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader title="Email Logs" subtitle="Every email attempt sent through Brevo, with delivery status" />

      <form onSubmit={sendTest} className="bg-white rounded-2xl p-5 shadow-sm border border-ink/5 mb-6 flex items-end gap-3 max-w-lg">
        <TextField label="Send a test email to" type="email" value={testTo} onChange={setTestTo} placeholder="you@example.com" className="flex-1" />
        <button type="submit" disabled={sending} className="btn-primary !py-2.5 shrink-0"><Send size={14} /> {sending ? 'Sending...' : 'Send Test'}</button>
      </form>
      {testResult && <p className="text-sm text-ink/60 mb-6">{testResult}</p>}

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3">To</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-ink/[0.02]" title={l.error || ''}>
                  <td className="px-5 py-3 text-ink">{l.toEmail}</td>
                  <td className="px-5 py-3 text-ink/60">{l.subject}</td>
                  <td className="px-5 py-3 text-ink/50">{l.type}</td>
                  <td className="px-5 py-3"><Badge tone={l.status === 'sent' ? 'green' : 'red'}>{l.status}</Badge></td>
                  <td className="px-5 py-3 text-ink/45">{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No emails sent yet</p>}
        </div>
      )}
    </div>
  )
}
