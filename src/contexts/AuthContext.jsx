import { createContext, useContext, useReducer, useEffect } from 'react'
// import authService from '@/api/authService'
import { useToast } from '@/components/ui/simple-toast'

// Mock auth service for now
const authService = {
  login: async (credentials) => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 'user_123',
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: 'Player'
          },
          token: 'mock_token_123',
          refreshToken: 'mock_refresh_token_123'
        })
      }, 1000)
    })
  },
  signup: async (signupData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 'user_123',
            name: signupData.name,
            email: signupData.email,
            role: signupData.role
          },
          token: 'mock_token_123',
          refreshToken: 'mock_refresh_token_123'
        })
      }, 1000)
    })
  },
  logout: async () => {
    return Promise.resolve()
  },
  updateProfile: async (userData) => {
    return Promise.resolve(userData)
  },
  storeAuthData: (authData) => {
    localStorage.setItem('token', authData.token)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('user', JSON.stringify(authData.user))
  }
}

const AuthContext = createContext()

// Auth reducer to manage state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    default:
      return state
  }
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { toast } = useToast()

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser)
          dispatch({
            type: 'LOGIN',
            payload: { user, token: storedToken }
          })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadUser()
  }, [])

  // Login function with real API
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const authData = await authService.login(credentials)
      authService.storeAuthData(authData)
      
      dispatch({
        type: 'LOGIN',
        payload: { user: authData.user, token: authData.token }
      })
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${authData.user.name}!`,
        variant: "success"
      })
      
      return authData
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Logout function with real API
  const logout = async () => {
    try {
      await authService.logout()
      dispatch({ type: 'LOGOUT' })
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
        variant: "default"
      })
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if API logout fails, clear local state
      dispatch({ type: 'LOGOUT' })
    }
  }

  // Update user function with real API
  const updateUser = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      })
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "success"
      })
      
      return updatedUser
    } catch (error) {
      console.error('Error updating user data:', error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      })
      throw error
    }
  }

  // Check if user exists by email
  const getUserByEmail = (email) => {
    try {
      const existingUser = localStorage.getItem('user')
      if (existingUser) {
        const parsedUser = JSON.parse(existingUser)
        if (parsedUser.email === email) {
          return parsedUser
        }
      }
      return null
    } catch (error) {
      console.error('Error checking user by email:', error)
      return null
    }
  }

  // Mock Google login
  const loginWithGoogle = () => {
    // Simulate Google login with dummy data
    const mockUser = {
      id: 'google_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'Player',
      profilePicture: 'https://via.placeholder.com/150',
      provider: 'google',
      bio: '',
      age: '',
      playerRole: '',
      location: '',
      contactInfo: '',
      organization: '',
      yearsOfExperience: ''
    }
    
    const mockToken = 'mock_jwt_token_' + Date.now()
    
    login(mockUser, mockToken)
    return mockUser
  }

  // Real API signup with role
  const signupWithRole = async (formData, role) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        // Role-specific data
        ...(role === 'Player' && {
          age: formData.age,
          playerRole: formData.playerRole
        }),
        ...(role === 'Academy' && {
          location: formData.location,
          contactInfo: formData.contactInfo
        }),
        ...(role === 'Club' && {
          location: formData.location,
          contactInfo: formData.contactInfo
        }),
        ...(role === 'Scout' && {
          organization: formData.organization,
          yearsOfExperience: formData.yearsOfExperience
        })
      }
      
      const authData = await authService.signup(signupData)
      authService.storeAuthData(authData)
      
      dispatch({
        type: 'LOGIN',
        payload: { user: authData.user, token: authData.token }
      })
      
      toast({
        title: "Account created successfully",
        description: `Welcome to SportsHub, ${authData.user.name}!`,
        variant: "success"
      })
      
      return authData
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    loginWithGoogle,
    signupWithRole,
    getUserByEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
