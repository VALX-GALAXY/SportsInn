import axios from 'axios'
import { isTokenExpired, validateTokenFormat } from '../utils/tokenUtils'

// Debug: Log the API URL being used
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
console.log('🔧 Axios Instance - API URL:', apiUrl)
console.log('🔧 Axios Instance - VITE_API_URL from env:', import.meta.env.VITE_API_URL)
console.log('🔧 Axios Instance - All env vars:', import.meta.env)

const axiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token refresh queue to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Axios request interceptor - Token:', token ? 'Present' : 'Missing')
    console.log('Axios request interceptor - URL:', config.url)
    console.log('Axios request interceptor - Is refreshing:', isRefreshing)
    
    if (token) {
      // Trim token to remove any whitespace
      const trimmedToken = token.trim()
      
      // Basic validation: ensure token has basic JWT structure (3 parts separated by dots)
      // Be lenient - let backend validate the actual token signature
      if (!trimmedToken || trimmedToken.length === 0) {
        console.warn('Token is empty after trimming')
        return config
      }
      
      // Quick check for JWT structure (should have 2 dots = 3 parts)
      const dotCount = (trimmedToken.match(/\./g) || []).length
      if (dotCount !== 2) {
        console.warn(`Token does not have 2 dots (has ${dotCount}), likely invalid format`)
        return config
      }
      
      // Check if token parts are non-empty
      const parts = trimmedToken.split('.')
      if (parts.length !== 3 || parts.some(p => !p || p.trim().length === 0)) {
        console.warn('Token has empty parts')
        return config
      }
      
      // Try stricter validation but don't block if it fails
      if (!validateTokenFormat(trimmedToken)) {
        console.warn('Token format validation failed, but attempting to use anyway - backend will validate')
        // Continue anyway - backend will reject if truly invalid
      }
      
      // Even if token is expired, attach it to trigger a 401 and let response interceptor handle refresh
      if (isTokenExpired(trimmedToken)) {
        console.warn('Token appears expired; proceeding to let response interceptor refresh')
      }
      
      config.headers.Authorization = `Bearer ${trimmedToken}`
      console.log('Axios request interceptor - Authorization header set')
    } else {
      console.warn('Axios request interceptor - No token found in localStorage')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    console.log('Axios response interceptor - Error:', error.response?.status, error.response?.data)
    const originalRequest = error.config

    // Handle 401 errors (unauthorized) - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Axios response interceptor - Handling 401 error, attempting token refresh')
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        console.log('Axios response interceptor - Refresh token:', refreshToken ? 'Present' : 'Missing')
        
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000' }/api/auth/refresh`,
            { refreshToken }
          )
          
          // Handle different response structures
          const responseData = response.data
          let newToken, newRefreshToken
          
          if (responseData.data) {
            // Backend format: { success: true, data: { accessToken, refreshToken } }
            newToken = responseData.data.accessToken || responseData.data.token
            newRefreshToken = responseData.data.refreshToken
          } else {
            // Direct format: { accessToken, refreshToken }
            newToken = responseData.accessToken || responseData.token
            newRefreshToken = responseData.refreshToken
          }
          
          if (newToken) {
            localStorage.setItem('token', newToken)
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken)
            }
            
            // Process queued requests
            processQueue(null, newToken)
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axiosInstance(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Axios response interceptor - Token refresh failed:', refreshError)
        processQueue(refreshError, null)
        
        // Only logout if refresh actually failed, not for network errors
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          console.log('Axios response interceptor - Refresh token invalid, logging out')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          // Use a more graceful logout
          if (window.location.pathname !== '/login') {
            // Dispatch a custom event for graceful logout
            window.dispatchEvent(new CustomEvent('auth:logout', { 
              detail: { reason: 'token_expired' } 
            }))
            setTimeout(() => {
              window.location.href = '/login'
            }, 1000)
          }
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 errors (forbidden) - token might be invalid
    if (error.response?.status === 403 && !originalRequest._retry) {
      console.error('Axios response interceptor - 403 Forbidden error, token might be invalid')
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      // Try to refresh the token if we have a refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        console.log('Axios response interceptor - Attempting token refresh for 403 error')
        originalRequest._retry = true
        isRefreshing = true
        
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/refresh`,
            { refreshToken }
          )
          
          // Handle different response structures
          const responseData = response.data
          let newToken, newRefreshToken
          
          if (responseData.data) {
            newToken = responseData.data.accessToken || responseData.data.token
            newRefreshToken = responseData.data.refreshToken
          } else {
            newToken = responseData.accessToken || responseData.token
            newRefreshToken = responseData.refreshToken
          }
          
          if (newToken) {
            localStorage.setItem('token', newToken)
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken)
            }
            
            // Process queued requests
            processQueue(null, newToken)
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axiosInstance(originalRequest)
          }
        } catch (refreshError) {
          console.error('Axios response interceptor - Token refresh failed for 403:', refreshError)
          processQueue(refreshError, null)
          
          // Only logout if refresh actually failed
          if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            if (window.location.pathname !== '/login') {
              // Dispatch a custom event for graceful logout
              window.dispatchEvent(new CustomEvent('auth:logout', { 
                detail: { reason: 'token_expired' } 
              }))
              setTimeout(() => {
                window.location.href = '/login'
              }, 1000)
            }
          }
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
