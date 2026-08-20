import { useState } from 'react'
import { supabase, uploadMedia, BOOKS_TABLE } from '../lib/supabaseClient'

const emptyForm = {
  title: '',
  authors: '',
  status: 'Published',
  year_label: '',
  description: '',
  link: '',
  sort_order: 0,
}

function toFormState(book) {
  if (!book) return emptyForm
  return {
    title: book.title ?? '',
    authors: book.authors ?? '',
    status: book.status ?? 'Published',
    year_label: book.year_label ?? '',
    description: book.description ?? '',
    link: book.link ?? '',
    sort_order: book.sort_order ?? 0,
  }
}

export default function BookForm({ book, onSaved, onCancel }) {
  const [form, setForm] = useState(() => toFormState(book))
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = Boolean(book)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        title: form.title.trim(),
        authors: form.authors.trim() || null,
        status: form.status,
        year_label: form.year_label.trim() || null,
        description: form.description.trim() || null,
        link: form.link.trim() || null,
        sort_order: Number(form.sort_order) || 0,
      }

      if (coverFile) payload.cover_url = await uploadMedia(coverFile, 'books')

      const { error: saveError } = isEdit
        ? await supabase.from(BOOKS_TABLE).update(payload).eq('id', book.id)
        : await supabase.from(BOOKS_TABLE).insert(payload)

      if (saveError) throw saveError

      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <label>
        Title
        <input required value={form.title} onChange={(e) => update('title', e.target.value)} />
      </label>
      <label>
        Authors
        <input
          value={form.authors}
          onChange={(e) => update('authors', e.target.value)}
          placeholder="Leave blank if solely authored"
        />
      </label>
      <div className="admin-form__row">
        <label>
          Status
          <select value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option>Published</option>
            <option>Upcoming</option>
          </select>
        </label>
        <label>
          Year
          <input
            value={form.year_label}
            onChange={(e) => update('year_label', e.target.value)}
            placeholder="e.g. 2026"
          />
        </label>
      </div>
      <label>
        Description
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </label>
      <label>
        Link (where to read/buy it)
        <input value={form.link} onChange={(e) => update('link', e.target.value)} />
      </label>
      <label>
        Cover image {isEdit && book.cover_url ? '(replace)' : ''}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <label className="admin-form__sort">
        Sort order
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => update('sort_order', e.target.value)}
        />
      </label>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add book'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
