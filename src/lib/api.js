// Thin client for the Flask API. On Vercel, VITE_API_BASE_URL points at the
// PythonAnywhere backend; during local dev it is empty and Vite proxies /api
// and /media to Flask. Auth uses a bearer token because the API is cross-origin.

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
const TOKEN_KEY = 'portfolio-admin-token'

export function getAdminToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage can be unavailable (private mode); login still works for the tab.
  }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getAdminToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const options = { method, headers, signal }

  if (body instanceof FormData) {
    options.body = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(
      'Could not reach the portfolio API. Is the Flask server running?',
      0,
      null,
    )
  }

  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    if (response.status === 401 && path !== '/api/auth/login') setAdminToken(null)

    const message =
      (data && typeof data === 'object' && data.error) ||
      (typeof data === 'string' && data) ||
      `Request failed (${response.status}).`

    throw new ApiError(message, response.status, data)
  }

  return data
}

function resource(path) {
  return {
    list: (options = {}) => request(path, options),
    create: (payload) => request(path, { method: 'POST', body: payload }),
    update: (id, payload) =>
      request(`${path}/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
    remove: (id) => request(`${path}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  }
}

export const api = {
  auth: {
    session: () => request('/api/auth/session'),
    async login(password) {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: { password },
      })
      if (data?.token) setAdminToken(data.token)
      return data
    },
    async logout() {
      try {
        await request('/api/auth/logout', { method: 'POST' })
      } finally {
        setAdminToken(null)
      }
    },
  },
  projects: resource('/api/projects'),
  papers: resource('/api/papers'),
  books: resource('/api/books'),
  media: {
    async upload(file, folder) {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', folder)
      return request('/api/media', { method: 'POST', body: form })
    },
    remove: (url) => request('/api/media', { method: 'DELETE', body: { url } }),
  },
}
