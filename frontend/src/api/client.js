import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const client = axios.create({ baseURL, withCredentials: true }) // withCredentials sends the httpOnly refresh cookie

let accessToken = localStorage.getItem('jhanvika_access_token') || null

export function setAccessToken(token) {
  accessToken = token
  if (token) localStorage.setItem('jhanvika_access_token', token)
  else localStorage.removeItem('jhanvika_access_token')
}

export function getAccessToken() {
  return accessToken
}

client.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Queues concurrent requests while a single refresh call is in flight, so a
// page that fires 5 requests at once doesn't trigger 5 refresh attempts.
let refreshPromise = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.data.accessToken)
        return res.data.data.accessToken
      })
      .catch((err) => {
        setAccessToken(null)
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

client.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const original = err.config
    const isAuthRoute = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register') || original?.url?.includes('/auth/refresh')

    if (err.response?.status === 401 && !original._retry && !isAuthRoute && accessToken) {
      original._retry = true
      try {
        const newToken = await refreshAccessToken()
        original.headers.Authorization = `Bearer ${newToken}`
        return client(original)
      } catch {
        // fall through to normal error handling — refresh failed, session is over
      }
    }

    const message =
      err.response?.data?.message ||
      (err.response?.data?.errors && err.response.data.errors[0]?.msg) ||
      err.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export default client
