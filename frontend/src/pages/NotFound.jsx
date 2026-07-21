import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-px py-32 text-center">
      <p className="font-wordmark text-8xl text-gold">404</p>
      <h1 className="font-display text-3xl text-maroon mt-4">This drape has unravelled</h1>
      <p className="text-ink/55 mt-2 font-body">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-8 inline-flex">Back to Home</Link>
    </div>
  )
}
