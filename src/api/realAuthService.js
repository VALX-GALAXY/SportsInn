import axiosInstance from './axiosInstance'

class RealAuthService {
  // Real backend login
  async login(credentials) {
    try {
      const response = await axiosInstance.post('/auth/login', credentials)
      const { accessToken, refreshToken, user } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return {
        token: accessToken,
        refreshToken: refreshToken,
        user: user
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  // Real backend signup
  async signup(userData) {
    try {
      const response = await axiosInstance.post('/auth/signup', userData)
      const { accessToken, refreshToken, user } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return {
        token: accessToken,
        refreshToken: refreshToken,
        user: user
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw new Error(error.response?.data?.message || 'Signup failed')
    }
  }

  // Real backend logout
  async logout() {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  // Store user data and tokens
  storeAuthData(authData) {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('user', JSON.stringify(authData.user))
  }

  // Get stored user data
  getStoredUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  }

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('token')
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getStoredToken()
    const user = this.getStoredUser()
    return !!(token && user)
  }

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
}

export default new RealAuthService()
