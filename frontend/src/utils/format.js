import { ASSET_BASE_URL } from '../services/api'

export function collection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export function meta(payload) {
  return payload?.meta || { page: 1, pageSize: 12, total: collection(payload).length, totalPages: 1 }
}

export function assetUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  const clean = String(url).replace(/^\/+/, '').replace('uploads/pdfs/', 'uploads/books/')
  return `${ASSET_BASE_URL}/${clean}`
}

export function formatDate(value) {
  if (!value) return 'Non definie'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function initials(name = 'U') {
  return String(name || 'U').trim().slice(0, 1).toUpperCase()
}

export function statusLabel(status) {
  const labels = {
    want_to_read: 'A lire',
    reading: 'En lecture',
    completed: 'Termine',
  }
  return labels[status] || status || 'Non defini'
}
