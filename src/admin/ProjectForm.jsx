import { useState } from 'react'
import { api } from '../lib/api'

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
  const [removedMedia, setRemovedMedia] = useState({ image: false, video: false })
  const [removingMedia, setRemovingMedia] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEdit = Boolean(project)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleRemoveMedia(type) {
    const isImage = type === 'image'
    const url = isImage ? project.image_url : project.video_url
    const column = isImage ? 'image_url' : 'video_url'
    const label = isImage ? 'cover image' : 'video'

    if (!url || !confirm(`Remove this ${label}? This can't be undone.`)) return

    setRemovingMedia(type)
    setError(null)

    try {
      await api.projects.update(project.id, { [column]: null })

      setRemovedMedia((current) => ({ ...current, [type]: true }))

      try {
        await api.media.remove(url)
      } catch (storageError) {
        setError(`The ${label} was removed from the project, but file cleanup failed: ${storageError.message}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setRemovingMedia(null)
    }
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

      if (imageFile) payload.image_url = (await api.media.upload(imageFile, 'images')).url
      if (videoFile) payload.video_url = (await api.media.upload(videoFile, 'videos')).url

      if (isEdit) {
        await api.projects.update(project.id, payload)
      } else {
        await api.projects.create(payload)
      }

      if (isEdit) {
        const replacedUrls = [
          imageFile && !removedMedia.image ? project.image_url : null,
          videoFile && !removedMedia.video ? project.video_url : null,
        ].filter(Boolean)

        await Promise.allSettled(replacedUrls.map((url) => api.media.remove(url)))
      }

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

      {isEdit && (
        <div className="admin-media-manager">
          <p className="admin-media-manager__title">Current media</p>
          {!removedMedia.image && project.image_url && (
            <div className="admin-media-item">
              <img src={project.image_url} alt={`${project.name} cover`} />
              <div>
                <strong>Cover image</strong>
                <span>Shown first on the project card</span>
              </div>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => handleRemoveMedia('image')}
                disabled={saving || removingMedia !== null}
              >
                {removingMedia === 'image' ? 'Removing…' : 'Remove image'}
              </button>
            </div>
          )}
          {!removedMedia.video && project.video_url && (
            <div className="admin-media-item">
              <video src={project.video_url} muted preload="metadata" />
              <div>
                <strong>Video</strong>
                <span>{project.image_url && !removedMedia.image ? 'Hidden under More media' : 'Used as the project cover'}</span>
              </div>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => handleRemoveMedia('video')}
                disabled={saving || removingMedia !== null}
              >
                {removingMedia === 'video' ? 'Removing…' : 'Remove video'}
              </button>
            </div>
          )}
          {(removedMedia.image || !project.image_url) &&
            (removedMedia.video || !project.video_url) && (
              <p className="admin-media-manager__empty">No media attached.</p>
            )}
        </div>
      )}
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
