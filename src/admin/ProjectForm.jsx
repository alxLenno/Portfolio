import { useState } from 'react'
import { supabase, uploadMedia, PROJECTS_TABLE } from '../lib/supabaseClient'

const emptyForm = {
  name: '',
  description: '',
  tech: '',
  live_url: '',
  github_url: '',
  sort_order: 0,
}

function toFormState(project) {
  if (!project) return emptyForm
  return {
    name: project.name ?? '',
    description: project.description ?? '',
    tech: (project.tech ?? []).join(', '),
    live_url: project.live_url ?? '',
    github_url: project.github_url ?? '',
    sort_order: project.sort_order ?? 0,
  }
}

export default function ProjectForm({ project, onSaved, onCancel }) {
  const [form, setForm] = useState(() => toFormState(project))
  const [imageFile, setImageFile] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = Boolean(project)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        tech: form.tech
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        live_url: form.live_url.trim() || null,
        github_url: form.github_url.trim() || null,
        sort_order: Number(form.sort_order) || 0,
      }

      if (imageFile) payload.image_url = await uploadMedia(imageFile, 'images')
      if (videoFile) payload.video_url = await uploadMedia(videoFile, 'videos')

      const { error: saveError } = isEdit
        ? await supabase.from(PROJECTS_TABLE).update(payload).eq('id', project.id)
        : await supabase.from(PROJECTS_TABLE).insert(payload)

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
        Name
        <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
      </label>
      <label>
        Description
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </label>
      <label>
        Tech (comma-separated)
        <input value={form.tech} onChange={(e) => update('tech', e.target.value)} />
      </label>
      <div className="admin-form__row">
        <label>
          Live URL
          <input value={form.live_url} onChange={(e) => update('live_url', e.target.value)} />
        </label>
        <label>
          GitHub URL
          <input
            value={form.github_url}
            onChange={(e) => update('github_url', e.target.value)}
          />
        </label>
      </div>
      <div className="admin-form__row">
        <label>
          Screenshot {isEdit && project.image_url ? '(replace)' : ''}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <label>
          Video {isEdit && project.video_url ? '(replace)' : ''}
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
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
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add project'}
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
