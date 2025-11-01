import axiosInstance from './axiosInstance'

// Auth Service with Backend Integration Only
class AuthService {

  async login(credentials) {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials)
      // Support both { success, data: { accessToken, refreshToken, user } } and { accessToken, refreshToken, user }
      const payload = response.data?.data ?? response.data
      const accessToken = payload?.accessToken || payload?.token
      const refreshToken = payload?.refreshToken
      const user = payload?.user
      
      if (!accessToken || !user) {
        throw new Error('Invalid login response: missing token or user')
      }
      
      // Store auth data
      localStorage.setItem('token', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token: accessToken, refreshToken }
    } catch (error) {
      // Check if it's a backend error with a message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Login failed')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async signup(userData) {
    try {
      const response = await axiosInstance.post('/api/auth/signup', userData)
      const user = response.data?.data || response.data?.user || response.data
      
      // Backend signup doesn't return tokens, so we need to login to get them
      const loginResponse = await axiosInstance.post('/api/auth/login', {
        email: userData.email,
        password: userData.password
      })
      const loginPayload = loginResponse.data?.data ?? loginResponse.data
      const accessToken = loginPayload?.accessToken || loginPayload?.token
      const refreshToken = loginPayload?.refreshToken
      
      if (!accessToken || !user) {
        throw new Error('Invalid signup/login response: missing token or user')
      }
      
      // Store auth data
      localStorage.setItem('token', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token: accessToken, refreshToken }
    } catch (error) {
      // Check if it's a backend error with a message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Signup failed')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async googleLogin(googleData) {
    try {
      console.log('authService.googleLogin - Starting Google login with data:', googleData)
      
      // Use the proper Google OAuth endpoint with idToken
      
      
      const requestBody = {
        idToken: googleData.idToken,
        role: googleData.role || 'player', // Default role for Google users
        // Send additional fields even though backend doesn't use them yet
        // This allows the request to work once backend is updated
        ...(googleData.sport && { sport: googleData.sport }),
        ...(googleData.gender && { gender: googleData.gender }),
        ...(googleData.cricketRole && { cricketRole: googleData.cricketRole })
      }
      
      const response = await axiosInstance.post('/api/auth/google', requestBody)
      
      console.log('authService.googleLogin - Google OAuth successful')
      const payload = response.data?.data ?? response.data
      const user = payload?.user
      const accessToken = payload?.accessToken || payload?.token
      const refreshToken = payload?.refreshToken
      
      if (!accessToken || !user) {
        throw new Error('Invalid Google login response: missing token or user')
      }
      
      // Store auth data
      localStorage.setItem('token', accessToken)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token: accessToken, refreshToken }
      
    } catch (error) {
      console.log('authService.googleLogin - Error:', error)
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || 'Google authentication failed'
        // Preserve the error object for the caller to handle
        const customError = new Error(errorMessage)
        customError.isRegistrationRequired = errorMessage.includes('Sport is required')
        throw customError
      }
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Google login failed')
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
      const payload = response.data?.data ?? response.data
      const token = payload?.accessToken || payload?.token
      const newRefreshToken = payload?.refreshToken
      
      if (!token) {
        throw new Error('Invalid refresh response: missing access token')
      }
      
      localStorage.setItem('token', token)
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
      
      return { token, refreshToken: newRefreshToken }
    } catch (error) {
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('')
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
        console.warn('')
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
        throw new Error('server is not running.')
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