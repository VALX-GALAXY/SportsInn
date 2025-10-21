import axiosInstance from './axiosInstance'

// Auth Service with Backend Integration Only
class AuthService {

  async login(credentials) {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials)
      const { data } = response.data  // Backend returns { success: true, data: { accessToken, refreshToken, user }, message: "..." }
      const { accessToken, refreshToken, user } = data
      
      // Store auth data
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token: accessToken, refreshToken }
    } catch (error) {
      // Check if it's a backend error with a message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async signup(userData) {
    try {
      const response = await axiosInstance.post('/api/auth/signup', userData)
      const { data: user } = response.data  
      
      // Backend signup doesn't return tokens, so we need to login to get them
      const loginResponse = await axiosInstance.post('/api/auth/login', {
        email: userData.email,
        password: userData.password
      })
      const { accessToken, refreshToken } = loginResponse.data
      
      // Store auth data
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token: accessToken, refreshToken }
    } catch (error) {
      // Check if it's a backend error with a message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async googleLogin(googleData) {
    try {
      console.log('authService.googleLogin - Starting Google login with data:', googleData)
      
      // First, try to login with existing user (if they have Google OAuth enabled)
      try {
        console.log('authService.googleLogin - Attempting login for existing user...')
        
        const loginResponse = await axiosInstance.post('/api/auth/login', {
          email: googleData.email,
          password: 'google_oauth_user' // Special password for Google users
        })
        
        console.log('authService.googleLogin - Existing user login successful')
        const { user, token, refreshToken } = loginResponse.data.data
        
        // Store auth data
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        return { user, token, refreshToken }
        
      } catch (loginError) {
        console.log('authService.googleLogin - Login failed, checking if user exists with regular password...')
        
        // If login fails, it could be because:
        // 1. User doesn't exist (we'll create them)
        // 2. User exists but has a regular password (we'll show error)
        
        // Try to determine if user exists by attempting signup
        try {
          console.log('authService.googleLogin - Attempting to create new user...')
          
          const signupResponse = await axiosInstance.post('/api/auth/signup', {
            name: googleData.name,
            email: googleData.email,
            password: 'google_oauth_user', // Special password for Google users
            role: 'player', // Default role for Google users
            age: 25, // Default age
            playingRole: 'All-rounder' // Default playing role
          })
          
          console.log('authService.googleLogin - New user created successfully')
          const { user } = signupResponse.data.data
          
          // Now login with the newly created user
          const loginResponse = await axiosInstance.post('/api/auth/login', {
            email: googleData.email,
            password: 'google_oauth_user'
          })
          
          const { token, refreshToken } = loginResponse.data.data
          
          // Store auth data
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', refreshToken)
          localStorage.setItem('user', JSON.stringify(user))
          
          return { user, token, refreshToken }
          
        } catch (signupError) {
          console.log('authService.googleLogin - Signup failed, user likely exists with regular password')
          
          // If signup fails with "Email already exists", user has regular account
          if (signupError.response?.data?.message?.includes('Email already exists')) {
            throw new Error(`An account with email ${googleData.email} already exists. Please use your regular password to login, or contact support to link your Google account.`)
          }
          
          // For other signup errors, re-throw
          throw signupError
        }
      }
      
    } catch (error) {
      console.error('authService.googleLogin - Error:', error)
      
      // Check if it's a backend error with a message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await axiosInstance.post('/api/auth/refresh', { refreshToken })
      const { token, refreshToken: newRefreshToken } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', newRefreshToken)
      
      return { token, refreshToken: newRefreshToken }
    } catch (error) {
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      console.log('authService.logout - RefreshToken:', refreshToken ? 'Present' : 'Missing')
      
      await axiosInstance.post('/api/auth/logout', { refreshToken })
      
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      return { message: 'Logged out successfully' }
    } catch (error) {
      console.error('authService.logout - Error:', error)
      
      // Even if backend logout fails, clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // If backend is not running, still allow logout but show warning
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.warn('Backend server is not running, but user has been logged out locally.')
        return { message: 'Logged out successfully (local only)' }
      }
      
      // For other errors, still allow logout
      return { message: 'Logged out successfully' }
    }
  }

  async getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        throw new Error('No user data available')
      }
      
      return JSON.parse(user)
    } catch (error) {
      throw new Error(error.message || 'Failed to get user data')
    }
  }

  async updateProfile(userData) {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'))
      // Handle both _id (from backend) and id (from mock data)
      const userId = currentUser._id || currentUser.id
      if (!userId) {
        throw new Error('User ID not found')
      }
      
      const response = await axiosInstance.put(`/api/profile/${userId}`, userData)
      const updatedUser = response.data.data
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error) {
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token')
  }

  // Get stored user data
  getStoredUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      return null
    }
  }

  // Store user data and tokens
  storeAuthData(authData) {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('user', JSON.stringify(authData.user))
  }

  // Clear all app data (for debugging)
  clearAllData() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
}

export default new AuthService()