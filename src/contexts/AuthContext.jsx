import { createContext, useContext, useReducer, useEffect } from 'react'
import authService from '../api/authService'
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

  // Update user function - handles both API calls and local updates
  const updateUser = async (userData) => {
    // If userData is already a complete user object (from API response), use it directly
    if (userData._id || userData.id) {
      console.log('Updating user with complete user object:', userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      dispatch({
        type: 'UPDATE_USER',
        payload: userData
      })
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "success"
      })
      
      return userData
    }
    
    // If userData is partial update data, try API first, then fallback to local
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
      
      // Fallback: Update user data locally without API call
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = { ...currentUser, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      })
      
      toast({
        title: "Profile updated locally",
        description: "Your profile has been updated (offline mode)",
        variant: "default"
      })
      
      return updatedUser
    }
  }

  // Clear corrupted user state and reload from localStorage
  const reloadUser = () => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser)
        console.log('Reloading user from localStorage:', user)
        
        dispatch({
          type: 'LOGIN',
          payload: { user, token: storedToken }
        })
        
        return user
      }
    } catch (error) {
      console.error('Error reloading user:', error)
    }
    return null
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

  // Real Google OAuth login using implicit flow
  const loginWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Load Google Identity Services library
      if (!window.google) {
        await loadGoogleScript()
      }
      
      // Debug environment variable
      console.log('Google Client ID from env:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
      
      // Get client ID with fallback
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '828898440872-d0jvss4hghjr7q3quqmcj5ft1a840bev.apps.googleusercontent.com'
      
      if (!clientId) {
        throw new Error('Google Client ID not found in environment variables')
      }
      
      console.log('Using Google Client ID:', clientId)
      
      // Use Google Identity Services with implicit flow
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response) => {
          try {
            console.log('Google OAuth response:', response)
            
            // Get user info directly from Google
            const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
            const userInfo = await userResponse.json()
            
            console.log('Google user info:', userInfo)
            
            // Send Google data to backend using existing signup/login API
            const result = await authService.googleLogin({
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              googleId: userInfo.id
            })
            
            dispatch({
              type: 'LOGIN',
              payload: {
                user: result.user,
                token: result.token
              }
            })
            
            toast({
              title: "Google login successful",
              description: `Welcome, ${result.user.name}!`,
              variant: "success"
            })
            
            return result.user
          } catch (error) {
            console.error('Google authentication error:', error)
            toast({
              title: "Google authentication failed",
              description: error.message || "Failed to authenticate with Google",
              variant: "destructive"
            })
            dispatch({ type: 'SET_LOADING', payload: false })
            throw error
          }
        }
      })
      
      // Request access token
      client.requestAccessToken()
      
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
  
  // Load Google Identity Services script
  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
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
        role: mappedRole.toLowerCase(), // Backend expects lowercase role
        // Role-specific data - match backend field names exactly
        ...(mappedRole.toLowerCase() === 'player' && {
          age: formData.age || '25', // Provide default if empty
          playingRole: formData.playerRole || 'All-rounder' // Provide default if empty
        }),
        ...(mappedRole.toLowerCase() === 'academy' && {
          location: formData.location || 'Not specified',
          contactInfo: formData.contactInfo || 'Not provided'
        }),
        ...(mappedRole.toLowerCase() === 'scout' && {
          organization: formData.organization || 'Independent',
          experience: formData.yearsOfExperience || '0'
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
    reloadUser,
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
