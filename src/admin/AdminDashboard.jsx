import { useState } from 'react'
import AdminProjects from './AdminProjects'
import AdminPapers from './AdminPapers'
import AdminBooks from './AdminBooks'

const tabs = [
  { id: 'projects', label: 'Projects', Component: AdminProjects },
  { id: 'papers', label: 'Research Papers', Component: AdminPapers },
  { id: 'books', label: 'Books', Component: AdminBooks },
]

export default function AdminDashboard({ onSignOut }) {
  const [tab, setTab] = useState('projects')
  const ActiveTab = tabs.find((t) => t.id === tab).Component

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__top">
        <h1>Admin</h1>
        <button className="btn btn--ghost" onClick={onSignOut}>
          Sign out
        </button>
      </div>

      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ActiveTab />
    </div>
  )
}
