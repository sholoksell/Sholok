const BASE = '/api'

export async function api(path, opts = {}) {
  const token = localStorage.getItem('sa_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem('sa_token')
    localStorage.removeItem('sa_user')
    window.location.href = '/login'
    return
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}
