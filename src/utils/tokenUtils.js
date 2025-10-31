// Token utility functions for managing JWT tokens

// Helper to decode base64 with proper padding handling for JWT (URL-safe base64)
const decodeBase64 = (str) => {
  try {
    // Add padding if needed for base64 decoding
    str = str.replace(/-/g, '+').replace(/_/g, '/')
    while (str.length % 4) {
      str += '='
    }
    return atob(str)
  } catch (error) {
    throw new Error(`Base64 decode failed: ${error.message}`)
  }
}

export const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  console.log('Auth data cleared from localStorage')
}

export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    
    const decodedPayload = decodeBase64(parts[1])
    const payload = JSON.parse(decodedPayload)
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
    const parts = token.split('.')
    if (parts.length !== 3) return 0
    
    const decodedPayload = decodeBase64(parts[1])
    const payload = JSON.parse(decodedPayload)
    const currentTime = Math.floor(Date.now() / 1000)
    return Math.max(0, payload.exp - currentTime)
  } catch (error) {
    console.error('Error getting token time remaining:', error)
    return 0
  }
}

export const validateTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false
  
  try {
    // Trim whitespace
    token = token.trim()
    if (!token) return false
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }
    
    // Check if all parts are non-empty
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i] || parts[i].length === 0) {
        return false
      }
    }
    
    // Try to decode the payload (second part) to verify it's valid base64 JSON
    // JWT uses URL-safe base64, so we need to handle padding
    try {
      const decodedPayload = decodeBase64(parts[1])
      const payload = JSON.parse(decodedPayload)
      // Check if payload has expected JWT structure (at least an object)
      if (!payload || typeof payload !== 'object') {
        return false
      }
      return true
    } catch (decodeError) {
      // If payload decode fails, token format is invalid
      return false
    }
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
