import axiosInstance from './axiosInstance'

class ProfileService {
  // Get user profile
  async getProfile(userId) {
    try {
      const response = await axiosInstance.get(`/api/profile/${userId}`)
      const userData = response.data.data
      
      // Load gallery images from localStorage since backend doesn't support it
      const galleryImages = JSON.parse(localStorage.getItem(`gallery_${userId}`) || '[]')
      
      return {
        ...userData,
        galleryImages
      }
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data from localStorage
      const user = JSON.parse(localStorage.getItem('user'))
      const galleryImages = JSON.parse(localStorage.getItem(`gallery_${userId}`) || '[]')
      
      return {
        ...user,
        galleryImages
      }
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      console.log('ProfileService.updateProfile called with:', { userId, profileData })
      
      // Separate gallery images from other profile data
      const { galleryImages, ...otherProfileData } = profileData
      
      console.log('Sending to backend:', { endpoint: `/api/profile/${userId}`, data: otherProfileData })
      
      // Update profile with supported fields
      const response = await axiosInstance.put(`/api/profile/${userId}`, otherProfileData)
      console.log('Backend response:', response.data)
      const updatedUser = response.data.data
      
      // Handle gallery images separately since backend doesn't support it
      if (galleryImages !== undefined) {
        localStorage.setItem(`gallery_${userId}`, JSON.stringify(galleryImages))
        return {
          ...updatedUser,
          galleryImages
        }
      }
      
      // Load existing gallery images
      const existingGalleryImages = JSON.parse(localStorage.getItem(`gallery_${userId}`) || '[]')
      return {
        ...updatedUser,
        galleryImages: existingGalleryImages
      }
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (!currentUser) {
        throw new Error('No user logged in')
      }
      
      // Separate gallery images from other profile data
      const { galleryImages, ...otherProfileData } = profileData
      
      // Update user in mock database
      const users = JSON.parse(localStorage.getItem('sportshub_mock_users') || '[]')
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          ...otherProfileData,
          id: currentUser.id, // Keep original ID
          email: currentUser.email // Keep original email
        }
        localStorage.setItem('sportshub_mock_users', JSON.stringify(users))
      }
      
      // Update stored user data
      const updatedUser = {
        ...currentUser,
        ...otherProfileData
      }
      
      // Handle gallery images
      if (galleryImages !== undefined) {
        localStorage.setItem(`gallery_${userId}`, JSON.stringify(galleryImages))
        updatedUser.galleryImages = galleryImages
      } else {
        const existingGalleryImages = JSON.parse(localStorage.getItem(`gallery_${userId}`) || '[]')
        updatedUser.galleryImages = existingGalleryImages
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    }
  }

  // Upload profile picture - using dedicated backend endpoint only
  async uploadProfilePicture(userId, file) {
    try {
      console.log('ProfileService.uploadProfilePicture called with:', { userId, fileName: file.name })
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('profilePic', file)
      
      console.log('Uploading to backend endpoint:', `/api/profile/${userId}/picture`)
      
      // Use the dedicated profile picture upload endpoint
      const response = await axiosInstance.post(`/api/profile/${userId}/picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('Backend upload response:', response.data)
      
      // Return the response in the expected format
      return {
        success: true,
        url: response.data.profilePic || response.data.data?.profilePic,
        message: response.data.message || 'Profile picture updated successfully'
      }
    } catch (error) {
      console.error('ProfileService.uploadProfilePicture error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For 500 errors, show more specific error message
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || 'Internal server error occurred'
        throw new Error(`Server error: ${errorMessage}`)
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  // Helper function to convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Get user's posts - using feed endpoint with author filter
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      // Backend doesn't have dedicated user posts endpoint, so we'll use the feed endpoint
      // and filter on frontend or use a different approach
      const response = await axiosInstance.get('/api/feed', {
        params: { page, limit }
      })
      
      // Filter posts by author (this would be better done on backend)
      const allPosts = response.data.data || []
      const userPosts = allPosts.filter(post => post.authorId._id === userId)
      
      return {
        posts: userPosts,
        total: userPosts.length,
        page,
        limit
      }
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get posts from localStorage
      const feed = JSON.parse(localStorage.getItem('sportshub_feed') || '[]')
      const userPosts = feed.filter(p => p.author.id === userId)
      
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return {
        posts: userPosts.slice(startIndex, endIndex),
        total: userPosts.length,
        page,
        limit
      }
    }
  }

  // Follow/Unfollow user
  async followUser(userId) {
    try {
      const response = await axiosInstance.post(`/api/users/${userId}/follow`)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        message: 'User followed successfully',
        isFollowing: true
      }
    }
  }

  async unfollowUser(userId) {
    try {
      const response = await axiosInstance.delete(`/api/users/${userId}/follow`)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        message: 'User unfollowed successfully',
        isFollowing: false
      }
    }
  }

  // Get user's followers
  async getFollowers(userId, page = 1, limit = 20) {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/followers`, {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockFollowers = [
        {
          id: 'follower_1',
          name: 'John Doe',
          avatar: 'https://via.placeholder.com/150',
          role: 'Player',
          followedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'follower_2',
          name: 'Jane Smith',
          avatar: 'https://via.placeholder.com/150',
          role: 'Scout',
          followedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      return {
        followers: mockFollowers,
        total: mockFollowers.length,
        page,
        limit
      }
    }
  }

  // Get user's following
  async getFollowing(userId, page = 1, limit = 20) {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/following`, {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockFollowing = [
        {
          id: 'following_1',
          name: 'Mike Johnson',
          avatar: 'https://via.placeholder.com/150',
          role: 'Academy',
          followedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      return {
        following: mockFollowing,
        total: mockFollowing.length,
        page,
        limit
      }
    }
  }

  // Get user's stats
  async getUserStats(userId) {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/stats`)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        posts: 15,
        followers: 120,
        following: 45,
        tournamentsApplied: 8,
        tournamentsWon: 2,
        achievements: 5
      }
    }
  }

  // Search users
  async searchUsers(query, page = 1, limit = 20) {
    try {
      const response = await axiosInstance.get('/api/users/search', {
        params: { query, page, limit }
      })
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockUsers = [
        {
          id: 'search_1',
          name: 'Alex Rodriguez',
          avatar: 'https://via.placeholder.com/150',
          role: 'Player',
          location: 'New York',
          bio: 'Professional football player'
        },
        {
          id: 'search_2',
          name: 'Sarah Wilson',
          avatar: 'https://via.placeholder.com/150',
          role: 'Scout',
          location: 'Los Angeles',
          bio: 'Talent scout for major clubs'
        }
      ]
      
      return {
        users: mockUsers,
        total: mockUsers.length,
        page,
        limit
      }
    }
  }

  // Update gallery images - backend doesn't support galleryImages field, so we'll use mock storage
  async updateGallery(userId, galleryImages) {
    try {
      // Since backend doesn't support galleryImages, we'll store it locally
      // and try to update other profile fields that are supported
      const currentUser = await this.getProfile(userId)
      const updatedUser = {
        ...currentUser,
        galleryImages
      }
      
      // Store gallery images in localStorage for persistence
      localStorage.setItem(`gallery_${userId}`, JSON.stringify(galleryImages))
      
      // Update other profile fields that are supported by backend
      const supportedFields = {}
      if (currentUser.name) supportedFields.name = currentUser.name
      if (currentUser.location) supportedFields.location = currentUser.location
      if (currentUser.contactInfo) supportedFields.contactInfo = currentUser.contactInfo
      if (currentUser.organization) supportedFields.organization = currentUser.organization
      if (currentUser.experience) supportedFields.experience = currentUser.experience
      if (currentUser.age) supportedFields.age = currentUser.age
      if (currentUser.playingRole) supportedFields.playingRole = currentUser.playingRole
      
      // Try to update supported fields
      if (Object.keys(supportedFields).length > 0) {
        const response = await axiosInstance.put(`/api/profile/${userId}`, supportedFields)
        return { ...response.data.data, galleryImages }
      }
      
      return updatedUser
    } catch (error) {
      console.error('ProfileService.updateProfile error:', error)
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (!currentUser) {
        throw new Error('No user logged in')
      }
      
      // Update user in mock database
      const users = JSON.parse(localStorage.getItem('sportshub_mock_users') || '[]')
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          galleryImages
        }
        localStorage.setItem('sportshub_mock_users', JSON.stringify(users))
      }
      
      // Update stored user data
      const updatedUser = {
        ...currentUser,
        galleryImages
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem(`gallery_${userId}`, JSON.stringify(galleryImages))
      
      return updatedUser
    }
  }

  // Add image to gallery - using main profile update endpoint
  async addToGallery(userId, imageData) {
    try {
      // Get current user to get existing gallery
      const currentUser = await this.getProfile(userId)
      const newGalleryImages = [...(currentUser.galleryImages || []), imageData]
      
      const response = await axiosInstance.put(`/api/profile/${userId}`, {
        galleryImages: newGalleryImages
      })
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (!currentUser) {
        throw new Error('No user logged in')
      }
      
      const newGalleryImages = [...(currentUser.galleryImages || []), imageData]
      
      // Update user in mock database
      const users = JSON.parse(localStorage.getItem('sportshub_mock_users') || '[]')
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          galleryImages: newGalleryImages
        }
        localStorage.setItem('sportshub_mock_users', JSON.stringify(users))
      }
      
      // Update stored user data
      const updatedUser = {
        ...currentUser,
        galleryImages: newGalleryImages
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    }
  }

  // Remove image from gallery - using main profile update endpoint
  async removeFromGallery(userId, imageId) {
    try {
      // Get current user to get existing gallery
      const currentUser = await this.getProfile(userId)
      const newGalleryImages = (currentUser.galleryImages || []).filter(img => img.id !== imageId)
      
      const response = await axiosInstance.put(`/api/profile/${userId}`, {
        galleryImages: newGalleryImages
      })
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (!currentUser) {
        throw new Error('No user logged in')
      }
      
      const newGalleryImages = (currentUser.galleryImages || []).filter(img => img.id !== imageId)
      
      // Update user in mock database
      const users = JSON.parse(localStorage.getItem('sportshub_mock_users') || '[]')
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          galleryImages: newGalleryImages
        }
        localStorage.setItem('sportshub_mock_users', JSON.stringify(users))
      }
      
      // Update stored user data
      const updatedUser = {
        ...currentUser,
        galleryImages: newGalleryImages
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    }
  }
}

export default new ProfileService()
