import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 401 - Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        window.location.href = '/login'
      }
      
      return Promise.reject(error.response.data)
    }
    
    return Promise.reject({
      success: false,
      message: 'Сүлжээний алдаа. Интернэт холболтоо шалгана уу',
    })
  }
)

export default api
