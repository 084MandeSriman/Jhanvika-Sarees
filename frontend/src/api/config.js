export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}
