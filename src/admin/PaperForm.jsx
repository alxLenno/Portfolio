import { useState } from 'react'
import { supabase, uploadMedia, PAPERS_TABLE } from '../lib/supabaseClient'

const emptyForm = {
  title: '',
  venue: '',
  status: 'Presented',
  date_label: '',
  authors: '',
  abstract: '',
  paper_url: '',
  sort_order: 0,
}

function toFormState(paper) {
  if (!paper) return emptyForm
  return {
    title: paper.title ?? '',
    venue: paper.venue ?? '',
    status: paper.status ?? 'Presented',
    date_label: paper.date_label ?? '',
    authors: paper.authors ?? '',
    abstract: paper.abstract ?? '',
    paper_url: paper.paper_url ?? '',
    sort_order: paper.sort_order ?? 0,
  }
}

export default function PaperForm({ paper, onSaved, onCancel }) {
  const [form, setForm] = useState(() => toFormState(paper))
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = Boolean(paper)

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
        venue: form.venue.trim(),
        status: form.status,
        date_label: form.date_label.trim() || null,
        authors: form.authors.trim() || null,
        abstract: form.abstract.trim() || null,
        paper_url: form.paper_url.trim() || null,
        sort_order: Number(form.sort_order) || 0,
      }

      if (file) payload.paper_url = await uploadMedia(file, 'papers')

      const { error: saveError } = isEdit
        ? await supabase.from(PAPERS_TABLE).update(payload).eq('id', paper.id)
        : await supabase.from(PAPERS_TABLE).insert(payload)

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
        Venue
        <input
          required
          value={form.venue}
          onChange={(e) => update('venue', e.target.value)}
          placeholder="Conference / journal, location"
        />
      </label>
      <label>
        Authors
        <input
          value={form.authors}
          onChange={(e) => update('authors', e.target.value)}
          placeholder="e.g. Segera, Lennox Kahati, Bradley Odimas, Ben Tito"
        />
      </label>
      <div className="admin-form__row">
        <label>
          Status
          <select value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option>Presented</option>
            <option>Published</option>
            <option>Under Review</option>
          </select>
        </label>
        <label>
          Date
          <input
            value={form.date_label}
            onChange={(e) => update('date_label', e.target.value)}
            placeholder="e.g. Feb 2026"
          />
        </label>
      </div>
      <label>
        Abstract
        <textarea
          rows={4}
          value={form.abstract}
          onChange={(e) => update('abstract', e.target.value)}
          placeholder="Shown as the paper's description on the site"
        />
      </label>
      <label>
        Link to paper (DOI, journal/conference page, or leave blank and upload a PDF below)
        <input value={form.paper_url} onChange={(e) => update('paper_url', e.target.value)} />
      </label>
      <label>
        Upload paper PDF {isEdit && paper.paper_url ? '(replaces link above)' : ''}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add paper'}
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
