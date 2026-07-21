import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge } from '../components/ui.jsx'

export default function Support() {
  const [tab, setTab] = useState('messages')
  const [messages, setMessages] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    Promise.all([adminApi.support.messages(), adminApi.support.newsletter()])
      .then(([m, s]) => { setMessages(m.data); setSubscribers(s.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function resolve(m) {
    await adminApi.support.resolveMessage(m.id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Support Inbox"
        subtitle="Contact form submissions and newsletter subscribers"
        action={
          <div className="flex gap-2">
            {['messages', 'subscribers'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`text-xs px-3 py-1.5 rounded-full border capitalize ${tab === t ? 'bg-maroon text-ivory border-maroon' : 'border-ink/15 text-ink/60'}`}>
                {t}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : tab === 'messages' ? (
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm border border-ink/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink font-medium">{m.name} <span className="text-ink/40 font-normal">· {m.email}</span></p>
                  <p className="text-xs text-ink/50 mt-1">{m.subject || 'No subject'}</p>
                  <p className="text-sm text-ink/65 mt-2">{m.message}</p>
                </div>
                <Badge tone={m.isResolved ? 'green' : 'amber'}>{m.isResolved ? 'Resolved' : 'Open'}</Badge>
              </div>
              {!m.isResolved && (
                <button onClick={() => resolve(m)} className="text-xs text-maroon hover:underline mt-3">Mark as resolved</button>
              )}
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No messages yet</p>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 divide-y divide-ink/5">
          {subscribers.map((s) => (
            <div key={s.id} className="px-5 py-3 flex justify-between text-sm">
              <span className="text-ink">{s.email}</span>
              <span className="text-ink/40">{new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
          ))}
          {subscribers.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No subscribers yet</p>}
        </div>
      )}
    </div>
  )
}
