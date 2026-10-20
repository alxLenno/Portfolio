import { useState } from 'react'
import { api } from '../lib/api'

export default function AdminLogin({ onSignedIn }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.auth.login(password)
      setPassword('')
      onSignedIn()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-card admin-card--narrow">
      <h1>Admin sign in</h1>
      <p className="admin-hint">Enter the admin password configured for this site.</p>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
