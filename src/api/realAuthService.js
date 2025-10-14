// Mock authentication service - no backend required
class RealAuthService {
  constructor() {
    this.usersKey = 'sportshub_mock_users'
    this.initializeMockUsers()
  }

  // Initialize mock users with default data
  initializeMockUsers() {
    const defaultUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123!',
        role: 'Player',
        profilePicture: 'https://via.placeholder.com/150',
        bio: 'Professional football player',
        age: '25',
        playerRole: 'Midfielder',
        location: 'New York',
        contactInfo: 'john@example.com',
        organization: '',
        yearsOfExperience: '5'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123!',
        role: 'Academy',
        profilePicture: 'https://via.placeholder.com/150',
        bio: 'Football academy director',
        age: '',
        playerRole: '',
        location: 'Los Angeles',
        contactInfo: 'jane@example.com',
        organization: 'Elite Football Academy',
        yearsOfExperience: '10'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123!',
        role: 'Scout',
        profilePicture: 'https://via.placeholder.com/150',
        bio: 'Professional football scout',
        age: '',
        playerRole: '',
        location: 'Chicago',
        contactInfo: 'mike@example.com',
        organization: 'Premier Scouting Agency',
        yearsOfExperience: '8'
      }
    ]

    // Get existing users from localStorage
    const existingUsers = this.getStoredUsers()
    
    // If no users exist, initialize with default users
    if (existingUsers.length === 0) {
      this.saveUsers(defaultUsers)
    }
  }

  // Get users from localStorage
  getStoredUsers() {
    try {
      const stored = localStorage.getItem(this.usersKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error parsing stored users:', error)
      return []
    }
  }

  // Save users to localStorage
  saveUsers(users) {
    try {
      localStorage.setItem(this.usersKey, JSON.stringify(users))
    } catch (error) {
      console.error('Error saving users:', error)
    }
  }

  // Get current mock users (from localStorage)
  get mockUsers() {
    return this.getStoredUsers()
  }

  // Mock login - simulates API call with delay
  async login(credentials) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { email, password } = credentials
      
      // Find user in mock database
      console.log('realAuthService - Login attempt for email:', email)
      console.log('realAuthService - Available users:', this.mockUsers.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })))
      
      const user = this.mockUsers.find(u => u.email === email && u.password === password)
      
      if (!user) {
        console.log('realAuthService - User not found or invalid password')
        throw new Error('Invalid email or password')
      }
      
      console.log('realAuthService - User found:', user)
      
      // Generate mock tokens
      const accessToken = 'mock_access_token_' + Date.now()
      const refreshToken = 'mock_refresh_token_' + Date.now()
      
      // Create user object without password
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        age: user.age,
        playerRole: user.playerRole,
        location: user.location,
        contactInfo: user.contactInfo,
        organization: user.organization,
        yearsOfExperience: user.yearsOfExperience
      }
      
      // Store in localStorage
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return {
        token: accessToken,
        refreshToken: refreshToken,
        user: userData
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed')
    }
  }

  // Mock signup - simulates API call with delay
  async signup(userData) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { email, password, name, role } = userData
      
      // Check if user already exists
      const existingUser = this.mockUsers.find(u => u.email === email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }
      
      // Create new user with proper ID generation
      const currentUsers = this.getStoredUsers()
      const newUser = {
        id: (currentUsers.length + 1).toString(),
        name: name,
        email: email,
        password: password,
        role: role,
        profilePicture: 'https://via.placeholder.com/150',
        bio: userData.bio || '',
        age: userData.age || '',
        playerRole: userData.playingRole || userData.playerRole || '',
        location: userData.location || '',
        contactInfo: userData.contactInfo || email,
        organization: userData.organization || '',
        yearsOfExperience: userData.experience || userData.yearsOfExperience || ''
      }
      
      // Add to mock database and save to localStorage
      currentUsers.push(newUser)
      this.saveUsers(currentUsers)
      
      console.log('realAuthService - User created and saved:', newUser)
      console.log('realAuthService - All users after signup:', currentUsers)
      
      // Generate mock tokens
      const accessToken = 'mock_access_token_' + Date.now()
      const refreshToken = 'mock_refresh_token_' + Date.now()
      
      // Create user object without password
      const userDataResponse = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
        bio: newUser.bio,
        age: newUser.age,
        playerRole: newUser.playerRole,
        location: newUser.location,
        contactInfo: newUser.contactInfo,
        organization: newUser.organization,
        yearsOfExperience: newUser.yearsOfExperience
      }
      
      // Store in localStorage
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(userDataResponse))
      
      return {
        token: accessToken,
        refreshToken: refreshToken,
        user: userDataResponse
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Signup failed')
    }
  }

  // Mock logout - no API call needed
  async logout() {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout error:', error)
      // Always clear localStorage even if there's an error
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

  // Clear all users (for testing/reset purposes)
  clearAllUsers() {
    localStorage.removeItem(this.usersKey)
    this.initializeMockUsers() // Reinitialize with default users
  }

  // Get user by email
  getUserByEmail(email) {
    const users = this.getStoredUsers()
    return users.find(user => user.email === email)
  }

  // Update user data
  updateUser(userId, updates) {
    const users = this.getStoredUsers()
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      this.saveUsers(users)
      return users[userIndex]
    }
    
    return null
  }

  // Mock update profile
  async updateProfile(userData) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentUser = this.getStoredUser()
      if (!currentUser) {
        throw new Error('No user logged in')
      }
      
      // Update user in mock database
      const userIndex = this.mockUsers.findIndex(u => u.id === currentUser.id)
      if (userIndex !== -1) {
        this.mockUsers[userIndex] = {
          ...this.mockUsers[userIndex],
          ...userData,
          id: currentUser.id, // Keep original ID
          email: currentUser.email // Keep original email
        }
        // Save updated users to localStorage
        this.saveUsers(this.mockUsers)
      }
      
      // Update stored user data
      const updatedUser = {
        ...currentUser,
        ...userData
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error(error.message || 'Failed to update profile')
    }
  }
}

export default new RealAuthService()
