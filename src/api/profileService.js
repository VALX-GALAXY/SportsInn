import axiosInstance from './axiosInstance'

class ProfileService {
  // Get user profile
  async getProfile(userId) {
    try {
      const response = await axiosInstance.get(`/api/profile/${userId}`)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data from localStorage
      const user = JSON.parse(localStorage.getItem('user'))
      return user || null
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const response = await axiosInstance.put(`/api/profile/${userId}`, profileData)
      return response.data
    } catch (error) {
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
          ...profileData,
          id: currentUser.id, // Keep original ID
          email: currentUser.email // Keep original email
        }
        localStorage.setItem('sportshub_mock_users', JSON.stringify(users))
      }
      
      // Update stored user data
      const updatedUser = {
        ...currentUser,
        ...profileData
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return updatedUser
    }
  }

  // Upload profile picture
  async uploadProfilePicture(userId, file) {
    try {
      const formData = new FormData()
      formData.append('profilePicture', file)
      
      const response = await axiosInstance.post(`/api/profile/${userId}/picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create a mock URL using FileReader
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            success: true,
            url: e.target.result,
            message: 'Profile picture updated successfully'
          })
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Get user's posts
  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const response = await axiosInstance.get(`/api/profile/${userId}/posts`, {
        params: { page, limit }
      })
      return response.data
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
}

export default new ProfileService()
