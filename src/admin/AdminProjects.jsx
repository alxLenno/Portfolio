import { useState } from 'react'
import { supabase, PROJECTS_TABLE } from '../lib/supabaseClient'
import { useProjects } from '../hooks/useProjects'
import ProjectForm from './ProjectForm'

export default function AdminProjects() {
  const { projects, loading } = useProjects()
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(project) {
    if (!confirm(`Delete "${project.name}"? This can't be undone.`)) return
    setDeletingId(project.id)
    await supabase.from(PROJECTS_TABLE).delete().eq('id', project.id)
    setDeletingId(null)
  }

  return (
    <div>
      <div className="admin-dashboard__header">
        <p className="admin-hint">Changes go live on the portfolio immediately.</p>
        <button className="btn btn--primary" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Close' : 'Add project'}
        </button>
      </div>

      {adding && (
        <div className="admin-card">
          <h2>New project</h2>
          <ProjectForm onSaved={() => setAdding(false)} onCancel={() => setAdding(false)} />
        </div>
      )}

      {loading ? (
        <p className="admin-loading">Loading projects…</p>
      ) : (
        <div className="admin-list">
          {projects.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="admin-card">
                <h2>Edit project</h2>
                <ProjectForm
                  project={p}
                  onSaved={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div key={p.id} className="admin-row">
                {p.image_url && <img src={p.image_url} alt="" className="admin-row__thumb" />}
                <div className="admin-row__body">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <p className="admin-row__meta">
                    order {p.sort_order}
                    {p.live_url ? ' · live' : ''}
                    {p.github_url ? ' · github' : ''}
                    {p.video_url ? ' · video' : ''}
                  </p>
                </div>
                <div className="admin-row__actions">
                  <button className="btn btn--ghost" onClick={() => setEditingId(p.id)}>
                    Edit
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
