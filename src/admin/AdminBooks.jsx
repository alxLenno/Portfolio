import { useState } from 'react'
import { api } from '../lib/api'
import { useBooks } from '../hooks/useBooks'
import BookForm from './BookForm'

export default function AdminBooks() {
  const { books, loading, refetch } = useBooks()
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  async function handleDelete(book) {
    if (!confirm(`Delete "${book.title}"? This can't be undone.`)) return

    setDeletingId(book.id)
    setError(null)

    try {
      await api.books.remove(book.id)
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
          {adding ? 'Close' : 'Add book'}
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {adding && (
        <div className="admin-card">
          <h2>New book</h2>
          <BookForm onSaved={handleSaved} onCancel={() => setAdding(false)} />
        </div>
      )}

      {loading ? (
        <p className="admin-loading">Loading books…</p>
      ) : (
        <div className="admin-list">
          {books.map((b) =>
            editingId === b.id ? (
              <div key={b.id} className="admin-card">
                <h2>Edit book</h2>
                <BookForm
                  book={b}
                  onSaved={handleSaved}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div key={b.id} className="admin-row">
                {b.cover_url && <img src={b.cover_url} alt="" className="admin-row__thumb" />}
                <div className="admin-row__body">
                  <h3>{b.title}</h3>
                  <p>{b.description}</p>
                  <p className="admin-row__meta">
                    order {b.sort_order} · {b.status}
                    {b.year_label ? ` · ${b.year_label}` : ''}
                    {b.link ? ' · link' : ''}
                  </p>
                </div>
                <div className="admin-row__actions">
                  <button className="btn btn--ghost" onClick={() => setEditingId(b.id)}>
                    Edit
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={() => handleDelete(b)}
                    disabled={deletingId === b.id}
                  >
                    {deletingId === b.id ? 'Deleting…' : 'Delete'}
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
