import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import authService from '../api/authService'
import profileService from '../api/profileService'
import { useToast } from '../components/ui/simple-toast'
import GoogleSignupModal from '../components/GoogleSignupModal'

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
  const [showGoogleSignupModal, setShowGoogleSignupModal] = useState(false)
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null)

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

  // Token refresh mechanism
  useEffect(() => {
    const refreshTokenInterval = setInterval(async () => {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (token && refreshToken) {
        try {
          // Check if token is about to expire (refresh 5 minutes before expiry)
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          const currentTime = Math.floor(Date.now() / 1000)
          const timeUntilExpiry = tokenPayload.exp - currentTime
          
          // If token expires in less than 5 minutes, refresh it
          if (timeUntilExpiry < 300) {
            console.log('AuthContext - Token expiring soon, refreshing...')
            
            // Use the same base URL as axiosInstance and handle both response shapes
            const refreshUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/refresh`
            const response = await fetch(refreshUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken })
            })
            
            if (response.ok) {
              const responseData = await response.json()
              let newAccessToken, newRefreshToken
              if (responseData.data) {
                newAccessToken = responseData.data.accessToken || responseData.data.token
                newRefreshToken = responseData.data.refreshToken
              } else {
                newAccessToken = responseData.accessToken || responseData.token
                newRefreshToken = responseData.refreshToken
              }
              if (newAccessToken) {
                localStorage.setItem('token', newAccessToken)
                if (newRefreshToken) {
                  localStorage.setItem('refreshToken', newRefreshToken)
                }
                console.log('AuthContext - Token refreshed successfully')
              } else {
                console.error('AuthContext - Token refresh response missing access token')
              }
            } else {
              console.error('AuthContext - Token refresh failed')
              // Don't logout immediately, let the axios interceptor handle it
            }
          }
        } catch (error) {
          console.error('AuthContext - Error during token refresh:', error)
          // Don't logout immediately, let the axios interceptor handle it
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(refreshTokenInterval)
  }, [])

  // Listen for graceful logout events
  useEffect(() => {
    const handleAuthLogout = (event) => {
      if (event.detail?.reason === 'token_expired') {
        gracefulLogout()
      }
    }

    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [])

  // Login function with real API
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const authData = await authService.login(credentials)
      authService.storeAuthData(authData)
      
      // Fetch complete profile data including profile picture
      try {
        const userId = authData.user._id || authData.user.id
        if (userId) {
          const profileData = await profileService.getProfile(userId)
          // Merge profile data with user data to ensure profile picture is included
          const completeUserData = {
            ...authData.user,
            ...profileData,
            // Ensure profile picture is properly set
            profilePic: profileData.profilePic || profileData.profilePicture || authData.user.profilePic
          }
          
          // Update stored user data with complete profile
          localStorage.setItem('user', JSON.stringify(completeUserData))
          
          dispatch({
            type: 'LOGIN',
            payload: { user: completeUserData, token: authData.token }
          })
        } else {
          dispatch({
            type: 'LOGIN',
            payload: { user: authData.user, token: authData.token }
          })
        }
      } catch (profileError) {
        console.warn('Could not fetch complete profile data:', profileError)
        // Fallback to basic user data
        dispatch({
          type: 'LOGIN',
          payload: { user: authData.user, token: authData.token }
        })
      }
      
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

  // Graceful logout for token expiration
  const gracefulLogout = () => {
    dispatch({ type: 'LOGOUT' })
    toast({
      title: "Session expired",
      description: "Please log in again to continue",
      variant: "destructive"
    })
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

  // Real Google OAuth login using Google Identity Services
  const loginWithGoogle = async (additionalData = {}) => {
    // Prevent multiple simultaneous calls
    if (window.googleLoginInProgress) {
      console.warn('Google login already in progress')
      return
    }
    
    try {
      window.googleLoginInProgress = true
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Load Google Identity Services library
      if (!window.google) {
        await loadGoogleScript()
        // Wait a bit for Google to initialize
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Read client ID from environment
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      console.log('AuthContext - VITE_GOOGLE_CLIENT_ID:', clientId)
      console.log('AuthContext - Client ID type:', typeof clientId)
      console.log('AuthContext - Client ID length:', clientId?.length)

      // Validate client ID
      if (!clientId) {
        const errorMsg = 'Missing VITE_GOOGLE_CLIENT_ID. Define it in frontend/.env file and restart the dev server.'
        console.error(errorMsg)
        throw new Error(errorMsg)
      }
      
      if (typeof clientId !== 'string' || !clientId.includes('.apps.googleusercontent.com')) {
        const errorMsg = `Invalid VITE_GOOGLE_CLIENT_ID format. Expected format: "xxx.apps.googleusercontent.com", got: "${clientId}"`
        console.error(errorMsg)
        throw new Error(errorMsg)
      }
      
      // Use Google Identity Services with button flow (more reliable than prompt)
      return new Promise((resolve, reject) => {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId.trim(),
          callback: async (response) => {
            try {
              console.log('Google OAuth response received')
              
              // Decode the idToken to get user info
              const parts = response.credential.split('.')
              if (parts.length !== 3) {
                throw new Error('Invalid idToken format')
              }
              
              const payload = JSON.parse(atob(parts[1]))
              console.log('Google user info from idToken:', { email: payload.email, name: payload.name })
              
              // Send Google data to backend using proper Google OAuth endpoint
              const result = await authService.googleLogin({
                idToken: response.credential,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                googleId: payload.sub,
                role: additionalData.role || 'player',
                sport: additionalData.sport,
                gender: additionalData.gender,
                cricketRole: additionalData.cricketRole
              })
              
              // Fetch complete profile data including profile picture
              try {
                const userId = result.user._id || result.user.id
                if (userId) {
                  const profileData = await profileService.getProfile(userId)
                  // Merge profile data with user data to ensure profile picture is included
                  const completeUserData = {
                    ...result.user,
                    ...profileData,
                    // Ensure profile picture is properly set
                    profilePic: profileData.profilePic || profileData.profilePicture || result.user.profilePic
                  }
                  
                  // Update stored user data with complete profile
                  localStorage.setItem('user', JSON.stringify(completeUserData))
                  
                  dispatch({
                    type: 'LOGIN',
                    payload: {
                      user: completeUserData,
                      token: result.token
                    }
                  })
                } else {
                  dispatch({
                    type: 'LOGIN',
                    payload: {
                      user: result.user,
                      token: result.token
                    }
                  })
                }
              } catch (profileError) {
                console.warn('Could not fetch complete profile data for Google user:', profileError)
                // Fallback to basic user data
                dispatch({
                  type: 'LOGIN',
                  payload: {
                    user: result.user,
                    token: result.token
                  }
                })
              }
              
              toast({
                title: "Google login successful",
                description: `Welcome, ${result.user.name}!`,
                variant: "success"
              })
              
              dispatch({ type: 'SET_LOADING', payload: false })
              window.googleLoginInProgress = false
              resolve(result.user)
            } catch (error) {
              console.error('Google authentication error:', error)
              
              // Check if this is a registration required error
              if (error.isRegistrationRequired || error.message?.includes('Sport is required')) {
                dispatch({ type: 'SET_LOADING', payload: false })
                window.googleLoginInProgress = false
                // Store Google user info for the modal
                const googleUserInfo = {
                  idToken: response.credential,
                  email: payload.email,
                  name: payload.name,
                  picture: payload.picture,
                  googleId: payload.sub
                }
                window.pendingGoogleUser = googleUserInfo
                setPendingGoogleUser(googleUserInfo)
                setShowGoogleSignupModal(true)
                // Don't reject, just return - the modal will handle the retry
                return
              }
              
              toast({
                title: "Google authentication failed",
                description: error.message || "Failed to authenticate with Google",
                variant: "destructive"
              })
              dispatch({ type: 'SET_LOADING', payload: false })
              window.googleLoginInProgress = false
              reject(error)
            }
          }
        })
        
        // Trigger Google sign-in using button rendering (more reliable)
        // Create a temporary invisible button and trigger it programmatically
        const tempContainer = document.createElement('div')
        tempContainer.id = 'google-signin-temp-container'
        tempContainer.style.position = 'fixed'
        tempContainer.style.top = '-9999px'
        tempContainer.style.left = '-9999px'
        tempContainer.style.opacity = '0'
        tempContainer.style.pointerEvents = 'none'
        document.body.appendChild(tempContainer)
        
        try {
          // Render the Google sign-in button
          window.google.accounts.id.renderButton(tempContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '300'
          })
          
          // Wait for button to render, then trigger click
          setTimeout(() => {
            const googleButton = tempContainer.querySelector('div[role="button"]')
            if (googleButton) {
              console.log('Triggering Google sign-in button click')
              googleButton.click()
              
              // Clean up after a delay
              setTimeout(() => {
                if (document.body.contains(tempContainer)) {
                  document.body.removeChild(tempContainer)
                }
              }, 5000)
            } else {
              console.error('Google button not found after rendering')
              document.body.removeChild(tempContainer)
              reject(new Error('Could not initialize Google sign-in button. Please check your VITE_GOOGLE_CLIENT_ID and ensure http://localhost:5173 is added to Authorized JavaScript origins in Google Cloud Console.'))
            }
          }, 300)
        } catch (renderError) {
          console.error('Error rendering Google button:', renderError)
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer)
          }
          reject(new Error(`Failed to render Google sign-in button: ${renderError.message}`))
        }
      })
      
    } catch (error) {
      console.error('Google login error:', error)
      window.googleLoginInProgress = false
      toast({
        title: "Google login failed",
        description: error.message || "Failed to login with Google",
        variant: "destructive"
      })
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
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
          playingRole: formData.playerRole || 'All-rounder', // Provide default if empty
          gender: formData.gender || '',
          sport: formData.sport || ''
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
      
      // Fetch complete profile data including profile picture
      try {
        const userId = authData.user._id || authData.user.id
        if (userId) {
          const profileData = await profileService.getProfile(userId)
          // Merge profile data with user data to ensure profile picture is included
          const completeUserData = {
            ...authData.user,
            ...profileData,
            // Ensure profile picture is properly set
            profilePic: profileData.profilePic || profileData.profilePicture || authData.user.profilePic
          }
          
          // Update stored user data with complete profile
          localStorage.setItem('user', JSON.stringify(completeUserData))
          
          dispatch({
            type: 'LOGIN',
            payload: { user: completeUserData, token: authData.token }
          })
        } else {
          dispatch({
            type: 'LOGIN',
            payload: { user: authData.user, token: authData.token }
          })
        }
      } catch (profileError) {
        console.warn('Could not fetch complete profile data for new user:', profileError)
        // Fallback to basic user data
        dispatch({
          type: 'LOGIN',
          payload: { user: authData.user, token: authData.token }
        })
      }
      
      toast({
        title: "Account created successfully",
        description: `Welcome to SportsIn, ${authData.user.name}!`,
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

  // Handle Google signup modal submission
  const handleGoogleSignupSubmit = async (signupData) => {
    try {
      setShowGoogleSignupModal(false)
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Retry Google login with the additional data
      // The idToken is stored in window.pendingGoogleUser
      if (!window.pendingGoogleUser || !window.pendingGoogleUser.idToken) {
        throw new Error('Google user information not found. Please try signing in again.')
      }
      
      // Call authService.googleLogin directly with all the data
      const result = await authService.googleLogin({
        idToken: window.pendingGoogleUser.idToken,
        email: window.pendingGoogleUser.email,
        name: window.pendingGoogleUser.name,
        picture: window.pendingGoogleUser.picture,
        googleId: window.pendingGoogleUser.googleId,
        role: signupData.role || 'player',
        sport: signupData.sport,
        gender: signupData.gender,
        cricketRole: signupData.cricketRole
      })
      
      // Fetch complete profile data
      try {
        const userId = result.user._id || result.user.id
        if (userId) {
          const profileData = await profileService.getProfile(userId)
          const completeUserData = {
            ...result.user,
            ...profileData,
            profilePic: profileData.profilePic || profileData.profilePicture || result.user.profilePic
          }
          localStorage.setItem('user', JSON.stringify(completeUserData))
          dispatch({
            type: 'LOGIN',
            payload: {
              user: completeUserData,
              token: result.token
            }
          })
        } else {
          dispatch({
            type: 'LOGIN',
            payload: {
              user: result.user,
              token: result.token
            }
          })
        }
      } catch (profileError) {
        console.warn('Could not fetch complete profile data:', profileError)
        dispatch({
          type: 'LOGIN',
          payload: {
            user: result.user,
            token: result.token
          }
        })
      }
      
      // Clear pending user data
      window.pendingGoogleUser = null
      setPendingGoogleUser(null)
      
      toast({
        title: "Account created successfully",
        description: `Welcome to SportsIn, ${result.user?.name || 'User'}!`,
        variant: "success"
      })
      
      return result.user
    } catch (error) {
      console.error('Google signup error:', error)
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      })
      // Re-show modal if it's still a registration error
      if (error.message?.includes('Sport is required')) {
        setShowGoogleSignupModal(true)
      }
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const value = {
    ...state,
    login,
    logout,
    gracefulLogout,
    updateUser,
    reloadUser,
    loginWithGoogle,
    signupWithRole,
    getUserByEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <GoogleSignupModal
        isOpen={showGoogleSignupModal}
        onClose={() => {
          setShowGoogleSignupModal(false)
          setPendingGoogleUser(null)
          window.pendingGoogleUser = null
        }}
        onSubmit={handleGoogleSignupSubmit}
        userInfo={pendingGoogleUser || window.pendingGoogleUser}
      />
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
