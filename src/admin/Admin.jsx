import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import './admin.css'

export default function Admin() {
  const [session, setSession] = useState(undefined)
  const [error, setError] = useState(null)

  const refreshSession = useCallback(async () => {
    try {
      setSession(await api.auth.session())
      setError(null)
    } catch (err) {
      setSession({ authenticated: false, configured: false })
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    // Ask the API whether this browser already has an admin session.
    // oxlint-disable-next-line react/set-state-in-effect
    refreshSession()
  }, [refreshSession])

  if (session === undefined) {
    return (
      <div className="admin-shell">
        <p className="admin-loading">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <h1>Admin unavailable</h1>
          <p>{error}</p>
          <p className="admin-hint">
            Start the backend with <code>npm run dev:api</code>, or check the Flask app on
            the server, then reload this page.
          </p>
        </div>
      </div>
    )
  }

  if (!session.configured) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <h1>Admin not configured</h1>
          <p>
            Set <code>ADMIN_PASSWORD_HASH</code> in the server&rsquo;s <code>.env</code> file to
            enable the admin area. Generate one with{' '}
            <code>flask --app backend hash-password</code> — see{' '}
            <code>README.md → Admin login</code>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      {session.authenticated ? (
        <AdminDashboard
          onSignOut={async () => {
            try {
              await api.auth.logout()
            } finally {
              setSession({ authenticated: false, configured: true })
            }
          }}
        />
      ) : (
        <AdminLogin onSignedIn={() => setSession({ authenticated: true, configured: true })} />
      )}
    </div>
  )
}
