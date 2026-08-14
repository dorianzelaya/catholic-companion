import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import API_URL from '../config'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || 'Could not reset your password.')

      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="page">
        <div className="page-content auth-page">
          <div className="auth-form">
            <h1 className="auth-title">Invalid link</h1>
            <p className="auth-subtitle">
              This password reset link is missing its token. Please request a new one.
            </p>
            <Link to="/forgot-password" className="auth-link-back">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="page">
        <div className="page-content auth-page">
          <div className="auth-form">
            <h1 className="auth-title">Password reset</h1>
            <p className="auth-subtitle">
              Your password has been changed. Taking you to log in...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-content auth-page">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1 className="auth-title">Choose a new password</h1>

          {error && <p className="auth-error">{error}</p>}

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
