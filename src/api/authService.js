// Mock Auth Service - Frontend Only
class AuthService {
  // Mock users database with compression
  getUsers() {
    try {
      const users = localStorage.getItem('sportshub_users')
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error('Error parsing users data:', error)
      // Clear corrupted data
      localStorage.removeItem('sportshub_users')
      return []
    }
  }

  saveUsers(users) {
    try {
      // Limit users to prevent storage overflow
      const limitedUsers = users.slice(-100) // Keep only last 100 users
      localStorage.setItem('sportshub_users', JSON.stringify(limitedUsers))
    } catch (error) {
      console.error('Error saving users data:', error)
      // If still too large, clear and start fresh
      localStorage.removeItem('sportshub_users')
      localStorage.setItem('sportshub_users', JSON.stringify(users.slice(-10)))
    }
  }

  // Generate mock JWT token
  generateToken(user) {
    return `mock_jwt_${user.id}_${Date.now()}`
  }

  async login(credentials) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = this.getUsers()
      const user = users.find(u => 
        u.email === credentials.email && u.password === credentials.password
      )
      
      if (!user) {
        throw new Error('Invalid email or password')
      }

      const token = this.generateToken(user)
      const refreshToken = `mock_refresh_${user.id}_${Date.now()}`
      
      // Store auth data
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          verified: user.verified
        },
        token,
        refreshToken
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed')
    }
  }

  async signup(userData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = this.getUsers()
      
      // Check if user already exists
      if (users.find(u => u.email === userData.email)) {
        throw new Error('User already exists')
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        password: userData.password, // In real app, this would be hashed
        role: userData.role,
        avatar: null,
        verified: false,
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      this.saveUsers(users)

      const token = this.generateToken(newUser)
      const refreshToken = `mock_refresh_${newUser.id}_${Date.now()}`
      
      // Store auth data
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      return {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          verified: newUser.verified
        },
        token,
        refreshToken
      }
    } catch (error) {
      throw new Error(error.message || 'Signup failed')
    }
  }

  async googleLogin(googleData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = this.getUsers()
      let user = users.find(u => u.email === googleData.email)
      
      if (!user) {
        // Create new user for Google login
        user = {
          id: `user_${Date.now()}`,
          name: googleData.name,
          email: googleData.email,
          role: 'Player', // Default role
          avatar: googleData.picture,
          verified: true,
          createdAt: new Date().toISOString()
        }
        users.push(user)
        this.saveUsers(users)
      }

      const token = this.generateToken(user)
      const refreshToken = `mock_refresh_${user.id}_${Date.now()}`
      
      // Store auth data
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          verified: user.verified
        },
        token,
        refreshToken
      }
    } catch (error) {
      throw new Error(error.message || 'Google login failed')
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        throw new Error('No user data available')
      }

      const newToken = this.generateToken(user)
      localStorage.setItem('token', newToken)
      
      return { token: newToken }
    } catch (error) {
      throw new Error(error.message || 'Token refresh failed')
    }
  }

  async logout() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      return { message: 'Logged out successfully' }
    } catch (error) {
      throw new Error(error.message || 'Logout failed')
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = this.getUsers()
      const currentUser = JSON.parse(localStorage.getItem('user'))
      
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      if (userIndex === -1) {
        throw new Error('User not found')
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        ...userData,
        id: currentUser.id, // Keep original ID
        email: currentUser.email // Keep original email
      }

      this.saveUsers(users)
      
      // Update stored user data
      const updatedUser = users[userIndex]
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error) {
      throw new Error(error.message || 'Profile update failed')
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
    localStorage.removeItem('sportshub_users')
    localStorage.removeItem('sportshub_feed')
    localStorage.removeItem('sportshub_follows')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Clear all comment data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sportshub_comments_')) {
        localStorage.removeItem(key)
      }
    })
  }
}

export default new AuthService()