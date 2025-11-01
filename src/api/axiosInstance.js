import axios from 'axios'
import { clearAuthData, isTokenExpired, validateTokenFormat, cleanupInvalidTokens } from '../utils/tokenUtils'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ||'https://sportsinn-backend.onrender.com',
  timeout: 1000000,
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
    // Clean up invalid tokens before making requests
    cleanupInvalidTokens()
    
    const token = localStorage.getItem('token')
    console.log('Axios request interceptor - Token:', token ? 'Present' : 'Missing')
    console.log('Axios request interceptor - URL:', config.url)
    console.log('Axios request interceptor - Is refreshing:', isRefreshing)
    
    if (token) {
      // Validate token format before using
      if (!validateTokenFormat(token)) {
        console.warn('Invalid token format, clearing auth data')
        clearAuthData()
        return config
      }
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.warn('Token is expired, clearing auth data')
        clearAuthData()
        return config
      }
      
      config.headers.Authorization = `Bearer ${token}`
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
            `${import.meta.env.VITE_API_URL || 'https://sportsinn-backend.onrender.com' }/api/auth/refresh`,
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
            `${import.meta.env.VITE_API_URL || 'https://sportsinn-backend.onrender.com'}/api/auth/refresh`,
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