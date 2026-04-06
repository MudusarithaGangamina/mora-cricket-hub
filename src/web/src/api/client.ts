import axios from 'axios'

// .NET API — all writes, auth, standard stats
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// FastAPI — read-only analytics
export const analyticsClient = axios.create({
  baseURL: import.meta.env.VITE_ANALYTICS_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every .NET request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mora_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mora_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)