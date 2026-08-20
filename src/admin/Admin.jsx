import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import './admin.css'

export default function Admin() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <h1>Admin not configured</h1>
          <p>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> (see{' '}
            <code>.env.example</code>) and run <code>supabase/schema.sql</code> in your Supabase
            project before using this page.
          </p>
        </div>
      </div>
    )
  }

  if (session === undefined) {
    return (
      <div className="admin-shell">
        <p className="admin-loading">Loading…</p>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      {session ? <AdminDashboard /> : <AdminLogin />}
    </div>
  )
}
