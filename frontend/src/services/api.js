import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '')
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  config.headers = config.headers || {}
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export default api
