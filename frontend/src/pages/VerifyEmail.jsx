import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { authApi } from '../api/auth.js'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState('checking') // checking | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token.')
      return
    }
    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message)
      })
  }, [token])

  return (
    <div className="container-px py-24 max-w-md mx-auto text-center">
      {status === 'checking' && <Loader2 className="mx-auto animate-spin text-maroon" size={32} />}
      {status === 'success' && (
        <>
          <CheckCircle2 className="mx-auto text-forest mb-4" size={40} />
          <h1 className="font-display text-3xl text-maroon">Email Verified</h1>
          <p className="text-ink/55 font-body mt-2">{message}</p>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="mx-auto text-red-600 mb-4" size={40} />
          <h1 className="font-display text-3xl text-maroon">Verification Failed</h1>
          <p className="text-ink/55 font-body mt-2">{message}</p>
        </>
      )}
      {status !== 'checking' && (
        <Link to="/account" className="btn-primary mt-8 inline-flex">Go to My Account</Link>
      )}
    </div>
  )
}
