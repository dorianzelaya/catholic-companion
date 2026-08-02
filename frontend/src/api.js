import API_URL from './config'

/**
 * fetch() wrapper that attaches the auth token.
 *
 * Use this for every call to our own backend. Do NOT use it for
 * third-party APIs — it would leak the token to them.
 *
 *   const res = await authFetch('/readings/today')
 *   const res = await authFetch('/journal', { method: 'POST', json: {...} })
 */
export async function authFetch(path, options = {}) {
  const { json, headers, ...rest } = options
  const token = localStorage.getItem('token')

  const finalHeaders = { ...headers }
  if (token) finalHeaders.Authorization = `Bearer ${token}`
  if (json !== undefined) finalHeaders['Content-Type'] = 'application/json'

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  })

  // Sliding expiration: the backend hands back a refreshed token once the
  // current one has been in use a while. Swapping it in here means an active
  // user is never logged out.
  const refreshed = res.headers.get('X-Refresh-Token')
  if (refreshed) {
    localStorage.setItem('token', refreshed)
  }

  // Expired or invalid token: clear it and bounce to login.
  // Without this the user sits on a broken screen with no explanation.
  if (res.status === 401) {
    localStorage.removeItem('token')
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    throw new Error('Session expired')
  }

  return res
}

export default authFetch