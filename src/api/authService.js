import axiosInstance from './axiosInstance'

class AuthService {
  // Login with email and password
  async login(credentials) {
    try {
      const response = await axiosInstance.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  // Signup with role-based data
  async signup(signupData) {
    try {
      const response = await axiosInstance.post('/auth/signup', signupData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed')
    }
  }

  // Google OAuth login
  async googleLogin(googleToken) {
    try {
      const response = await axiosInstance.post('/auth/google', {
        token: googleToken
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google login failed')
    }
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const response = await axiosInstance.post('/auth/refresh', { refreshToken })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed')
    }
  }

  // Logout
  async logout() {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/auth/me')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile')
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await axiosInstance.put('/auth/profile', profileData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
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
}

export default new AuthService()
