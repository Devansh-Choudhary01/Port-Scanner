import axios from 'axios'

export const api = axios.create({
  baseURL: '',        // Vite proxy handles /api → http://localhost:8000
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request logger
api.interceptors.request.use(config => {
  console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Global error handler
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Unknown error'
    console.error(`[API Error]`, msg)
    return Promise.reject(err)
  }
)
