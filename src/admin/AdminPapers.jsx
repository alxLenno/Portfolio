import { useState } from 'react'
import { api } from '../lib/api'
import { useResearch } from '../hooks/useResearch'
import PaperForm from './PaperForm'

export default function AdminPapers() {
  const { papers, loading, refetch } = useResearch()
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  async function handleDelete(paper) {
    if (!confirm(`Delete "${paper.title}"? This can't be undone.`)) return

    setDeletingId(paper.id)
    setError(null)

    try {
      await api.papers.remove(paper.id)
      await refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSaved() {
    await refetch()
    setAdding(false)
    setEditingId(null)
  }

  return (
    <div>
      <div className="admin-dashboard__header">
        <p className="admin-hint">Changes appear on the portfolio within a minute.</p>
        <button className="btn btn--primary" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Close' : 'Add paper'}
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {adding && (
        <div className="admin-card">
          <h2>New paper</h2>
          <PaperForm onSaved={handleSaved} onCancel={() => setAdding(false)} />
        </div>
      )}

      {loading ? (
        <p className="admin-loading">Loading papers…</p>
      ) : (
        <div className="admin-list">
          {papers.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="admin-card">
                <h2>Edit paper</h2>
                <PaperForm
                  paper={p}
                  onSaved={handleSaved}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div key={p.id} className="admin-row">
                <div className="admin-row__body">
                  <h3>{p.title}</h3>
                  <p>{p.venue}</p>
                  <p className="admin-row__meta">
                    order {p.sort_order} · {p.status}
                    {p.date_label ? ` · ${p.date_label}` : ''}
                    {p.paper_url ? ' · link' : ''}
                    {p.abstract ? ' · abstract' : ''}
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
