import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Axios request interceptor - Token:', token ? 'Present' : 'Missing')
    console.log('Axios request interceptor - URL:', config.url)
    if (token) {
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
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        console.log('Axios response interceptor - Refresh token:', refreshToken ? 'Present' : 'Missing')
        
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/refresh`,
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
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axiosInstance(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Axios response interceptor - Token refresh failed:', refreshError)
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
      }
    }

    // Handle 403 errors (forbidden) - token might be invalid
    if (error.response?.status === 403 && !originalRequest._retry) {
      console.error('Axios response interceptor - 403 Forbidden error, token might be invalid')
      
      // Try to refresh the token if we have a refresh token
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        console.log('Axios response interceptor - Attempting token refresh for 403 error')
        originalRequest._retry = true
        
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
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return axiosInstance(originalRequest)
          }
        } catch (refreshError) {
          console.error('Axios response interceptor - Token refresh failed for 403:', refreshError)
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
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
