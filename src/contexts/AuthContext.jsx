import { createContext, useContext, useReducer, useEffect } from 'react'
import authService from '../api/realAuthService'
import { useToast } from '../components/ui/simple-toast'

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
        
        console.log('AuthContext - Loading user from localStorage:', { storedUser, storedToken })
        
        if (storedUser && storedToken) {
          const user = JSON.parse(storedUser)
          console.log('AuthContext - Parsed user:', user)
          dispatch({
            type: 'LOGIN',
            payload: { user, token: storedToken }
          })
        } else {
          console.log('AuthContext - No stored user or token found')
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
  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
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
      
      // Store auth data
      authService.storeAuthData({
        token: mockToken,
        refreshToken: 'mock_refresh_token_' + Date.now(),
        user: mockUser
      })
      
      dispatch({
        type: 'LOGIN',
        payload: { user: mockUser, token: mockToken }
      })
      
      toast({
        title: "Google login successful",
        description: `Welcome, ${mockUser.name}!`,
        variant: "success"
      })
      
      return mockUser
    } catch (error) {
      console.error('Google login error:', error)
      toast({
        title: "Google login failed",
        description: error.message || "Failed to login with Google",
        variant: "destructive"
      })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Real API signup with role
  const signupWithRole = async (formData, role) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Map club to academy since backend doesn't have club role
      const mappedRole = role === 'club' ? 'Academy' : role
      console.log('AuthContext - Signup with role:', { originalRole: role, mappedRole })
      
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: mappedRole,
        // Role-specific data - match backend field names
        ...(mappedRole === 'Player' && {
          age: formData.age,
          playingRole: formData.playerRole  // Backend expects 'playingRole'
        }),
        ...(mappedRole === 'Academy' && {
          location: formData.location,
          contactInfo: formData.contactInfo
        }),
        ...(mappedRole === 'Scout' && {
          organization: formData.organization,
          experience: formData.yearsOfExperience  // Backend expects 'experience'
        })
      }
      
      console.log('AuthContext - Signup data:', signupData)
      
      const authData = await authService.signup(signupData)
      console.log('AuthContext - Signup response:', authData)
      
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
