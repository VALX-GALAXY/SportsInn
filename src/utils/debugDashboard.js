// Debug utility for dashboard API calls
import axiosInstance from '../api/axiosInstance'

export const debugDashboardAPI = async (userId) => {
  console.log('🔍 Debug Dashboard API Call')
  console.log('User ID:', userId)
  
  // Check if user is authenticated
  const token = localStorage.getItem('token')
  console.log('Token exists:', !!token)
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token')
  
  try {
    console.log('Making API call to:', `/api/dashboard/${userId}`)
    const response = await axiosInstance.get(`/api/dashboard/${userId}`)
    
    console.log('✅ API Response Status:', response.status)
    console.log('✅ API Response Data:', response.data)
    
    return response.data
  } catch (error) {
    console.error('❌ API Call Failed:')
    console.error('Error message:', error.message)
    console.error('Error response:', error.response?.data)
    console.error('Error status:', error.response?.status)
    console.error('Error config:', error.config)
    
    throw error
  }
}

export const debugUserAuth = () => {
  console.log('🔍 Debug User Authentication')
  
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')
  
  console.log('User:', user)
  console.log('User ID:', user?.id)
  console.log('User Role:', user?.role)
  console.log('Token exists:', !!token)
  console.log('Refresh token exists:', !!refreshToken)
  
  return { user, token, refreshToken }
}
