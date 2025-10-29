// Token utility functions for managing JWT tokens

export const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  console.log('Auth data cleared from localStorage')
}

export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiry:', error)
    return true
  }
}

export const getTokenTimeRemaining = (token) => {
  if (!token) return 0
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return Math.max(0, payload.exp - currentTime)
  } catch (error) {
    console.error('Error getting token time remaining:', error)
    return 0
  }
}

export const validateTokenFormat = (token) => {
  if (!token) return false
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Check if all parts are valid base64
    parts.forEach(part => {
      if (!part) return false
      atob(part)
    })
    
    return true
  } catch (error) {
    return false
  }
}

export const cleanupInvalidTokens = () => {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')
  
  if (token && !validateTokenFormat(token)) {
    console.warn('Invalid token format detected, clearing auth data')
    clearAuthData()
    return true
  }
  
  if (token && isTokenExpired(token)) {
    console.warn('Expired token detected, clearing auth data')
    clearAuthData()
    return true
  }
  
  return false
}
