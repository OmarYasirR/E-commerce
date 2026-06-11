import axios from 'axios'
import { API_URL } from './constants'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shop-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })
        
        localStorage.setItem('shop-token', response.data.token)
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`
        
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('shop-token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default axiosInstance