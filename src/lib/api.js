// Thin client for the Flask API. Requests are always same-origin: Flask serves
// both this SPA and /api in production, and Vite proxies /api during dev.

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
  const options = { method, credentials: 'include', headers, signal }

  if (body instanceof FormData) {
    options.body = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(path, options)
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
    login: (password) => request('/api/auth/login', { method: 'POST', body: { password } }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
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
