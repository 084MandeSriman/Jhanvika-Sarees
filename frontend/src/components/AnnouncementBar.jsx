import React from 'react'

const messages = [
  'Free shipping across India on orders above ₹2,999',
  'New Chanderi edit just dropped',
  'Use code JHANVIKA10 for 10% off your first order',
  'Handwoven. Hand-checked. Hand-delivered with love.',
]

export default function AnnouncementBar() {
  const loop = [...messages, ...messages]
  return (
    <div className="bg-ink text-ivory overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {loop.map((m, i) => (
          <span key={i} className="text-xs tracking-wide font-body px-8 py-2 flex items-center gap-8">
            {m}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
