import { createContext, useContext, useReducer, useEffect } from 'react'

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

  // Login function
  const login = (userData, token) => {
    try {
      // Check if user already exists in localStorage
      const existingUser = localStorage.getItem('user')
      if (existingUser) {
        const parsedUser = JSON.parse(existingUser)
        // If same email, use existing user data but update token
        if (parsedUser.email === userData.email) {
          const updatedUser = {
            ...parsedUser,
            token: token,
            lastLogin: new Date().toISOString()
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          localStorage.setItem('token', token)
          
          dispatch({
            type: 'LOGIN',
            payload: { user: updatedUser, token }
          })
          return
        }
      }
      
      // Store new user in localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'LOGIN',
        payload: { user: userData, token }
      })
    } catch (error) {
      console.error('Error storing user data:', error)
    }
  }

  // Logout function
  const logout = () => {
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Error clearing user data:', error)
    }
  }

  // Update user function
  const updateUser = (userData) => {
    try {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      dispatch({
        type: 'UPDATE_USER',
        payload: userData
      })
    } catch (error) {
      console.error('Error updating user data:', error)
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

  // Mock role-based signup
  const signupWithRole = (formData, role) => {
    const mockUser = {
      id: 'user_' + Date.now(),
      name: formData.name,
      email: formData.email,
      role: role,
      profilePicture: null,
      provider: 'email',
      bio: '',
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
    
    const mockToken = 'mock_jwt_token_' + Date.now()
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', mockToken)
    
    dispatch({
      type: 'LOGIN',
      payload: { user: mockUser, token: mockToken }
    })
    
    return mockUser
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
