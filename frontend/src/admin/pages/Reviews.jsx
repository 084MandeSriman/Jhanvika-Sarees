import React, { useEffect, useState } from 'react'
import { Check, Loader2, Star, Trash2 } from 'lucide-react'
import { adminApi } from '../../api/admin.js'
import { PageHeader, Badge } from '../components/ui.jsx'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  function load() {
    setLoading(true)
    adminApi.reviews.list({ status: filter }).then((res) => setReviews(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  async function approve(r) {
    await adminApi.reviews.approve(r.id)
    load()
  }

  async function remove(r) {
    if (!confirm('Delete this review?')) return
    await adminApi.reviews.remove(r.id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Reviews"
        subtitle="Moderate customer reviews before they go live"
        action={
          <div className="flex gap-2">
            {['pending', 'approved'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full border capitalize ${filter === f ? 'bg-maroon text-ivory border-maroon' : 'border-ink/15 text-ink/60'}`}>
                {f}
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <Loader2 className="animate-spin text-maroon" />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-ink/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink font-medium">{r.name} <span className="text-ink/40 font-normal">on</span> {r.Product?.name}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-gold text-gold' : 'text-ink/20'} />)}
                  </div>
                  <p className="text-sm text-ink/65 mt-2">{r.comment}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!r.isApproved && (
                    <button onClick={() => approve(r)} className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center hover:bg-forest/20"><Check size={14} /></button>
                  )}
                  <button onClick={() => remove(r)} className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"><Trash2 size={14} /></button>
                </div>
              </div>
              <Badge tone={r.isApproved ? 'green' : 'amber'}>{r.isApproved ? 'Approved' : 'Pending'}</Badge>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-ink/40 py-10 text-center">No {filter} reviews</p>}
        </div>
      )}
    </div>
  )
}
