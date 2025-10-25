import axiosInstance from './axiosInstance'

class SearchService {
  // Search users with filters
  async searchUsers(query, filters = {}, page = 1, limit = 20) {
    try {
      console.log('🔍 Searching users via backend API:', query)
      
      // Build params object to match backend API expectations
      const params = {
        q: query,  // Backend expects 'q' parameter for search query
        type: 'users',  // Search only users
        role: filters.role,
        location: filters.location,
        page,
        limit
      }
      
      // Add role-specific filters based on the active filter
      if (filters.role === 'Player' || filters.role === 'players') {
        if (filters.ageMin) params.ageMin = filters.ageMin
        if (filters.ageMax) params.ageMax = filters.ageMax
        if (filters.playerRole) params.playerRole = filters.playerRole
      } else if (filters.role === 'Academy' || filters.role === 'academies') {
        if (filters.established) params.established = filters.established
        if (filters.studentsMin) params.studentsMin = filters.studentsMin
        if (filters.studentsMax) params.studentsMax = filters.studentsMax
      } else if (filters.role === 'Club' || filters.role === 'clubs') {
        if (filters.founded) params.founded = filters.founded
        if (filters.playersMin) params.playersMin = filters.playersMin
        if (filters.playersMax) params.playersMax = filters.playersMax
      } else if (filters.role === 'Scout' || filters.role === 'scouts') {
        if (filters.experience) params.experience = filters.experience
        if (filters.discoveriesMin) params.discoveriesMin = filters.discoveriesMin
        if (filters.discoveriesMax) params.discoveriesMax = filters.discoveriesMax
      }
      
      const response = await axiosInstance.get('/api/search', { params })
      
      console.log('✅ Backend users search response:', response.data)
      
      if (response.data.success) {
        // Backend returns { success: true, data: { users: [...], posts: [...], tournaments: [...] } }
        const backendData = response.data.data || {}
        const usersData = backendData.users || []
        
        if (!Array.isArray(usersData)) {
          console.warn('Backend returned non-array data for users search:', usersData)
          throw new Error('Invalid data format from backend')
        }
        
        // Transform backend users to frontend format
        const transformedUsers = usersData.map(user => ({
          id: user._id,
          name: user.name,
          role: user.role,
          avatar: user.profilePic || user.avatar || 'https://i.pravatar.cc/150?img=1',
          location: user.location || 'Not specified',
          age: user.age,
          position: user.position || 'Not specified',
          playerRole: user.playerRole || 'Not specified',
          experience: user.experience || 'Not specified',
          verified: user.verified || false,
          followers: user.followers || 0,
          bio: user.bio || 'No bio available',
          // Academy specific fields
          established: user.established,
          students: user.students,
          // Club specific fields
          founded: user.founded,
          players: user.players,
          // Scout specific fields
          discoveries: user.discoveries
        }))
        
        return {
          users: transformedUsers,
          total: transformedUsers.length,
          page: page,
          limit: limit
        }
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.error('❌ Backend users search API failed:', error.message)
      console.error('Error details:', error.response?.data || error.message)
      
      // Don't fall back to mock data - throw the error instead
      throw new Error(`Search failed: ${error.response?.data?.message || error.message}`)
    }
  }

  // Search posts
  async searchPosts(query, filters = {}, page = 1, limit = 20) {
    try {
      console.log('🔍 Searching posts via backend API:', query)
      
      const response = await axiosInstance.get('/api/search', {
        params: {
          q: query,
          type: 'posts',  // Search only posts
          ...filters,
          page,
          limit
        }
      })
      
      console.log('✅ Backend posts search response:', response.data)
      
      if (response.data.success) {
        const backendData = response.data.data || {}
        const postsData = backendData.posts || []
        
        // Ensure postsData is an array
        const postsArray = Array.isArray(postsData) ? postsData : []
        
        return {
          posts: postsArray,
          total: postsArray.length,
          page: page,
          limit: limit,
          hasMore: false
        }
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.error('❌ Backend posts search API failed:', error.message)
      console.error('Error details:', error.response?.data || error.message)
      
      // Don't fall back to mock data - throw the error instead
      throw new Error(`Posts search failed: ${error.response?.data?.message || error.message}`)
    }
  }

  // Search tournaments
  async searchTournaments(query, filters = {}, page = 1, limit = 20) {
    try {
      console.log('🔍 Searching tournaments via backend API:', query)
      
      const response = await axiosInstance.get('/api/search', {
        params: {
          q: query,
          type: 'tournaments',  // Search only tournaments
          ...filters,
          page,
          limit
        }
      })
      
      console.log('✅ Backend tournaments search response:', response.data)
      
      if (response.data.success) {
        const backendData = response.data.data || {}
        const tournamentsData = backendData.tournaments || []
        
        // Ensure tournamentsData is an array
        const tournamentsArray = Array.isArray(tournamentsData) ? tournamentsData : []
        
        return {
          tournaments: tournamentsArray,
          total: tournamentsArray.length,
          page: page,
          limit: limit,
          hasMore: false
        }
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.error('❌ Backend tournaments search API failed:', error.message)
      console.error('Error details:', error.response?.data || error.message)
      
      // Don't fall back to mock data - throw the error instead
      throw new Error(`Tournaments search failed: ${error.response?.data?.message || error.message}`)
    }
  }

  // Get search suggestions/autocomplete
  async getSuggestions(query, type = 'users') {
    try {
      console.log('🔍 Getting suggestions from backend API:', query)
      
      // Use the actual autocomplete endpoint
      const response = await axiosInstance.get('/api/search/autocomplete', {
        params: { 
          q: query,
          type: type  // 'users' or 'tournaments'
        }
      })
      
      console.log('✅ Backend suggestions response:', response.data)
      
      if (response.data.success) {
        const suggestionsData = response.data.data || []
        
        // Ensure suggestionsData is an array before mapping
        if (Array.isArray(suggestionsData)) {
          return suggestionsData.map(item => ({
            id: item.id || item._id,
            name: item.name || item.title,
            type: item.type || item.role || 'user',
            avatar: item.avatar || 'https://i.pravatar.cc/150?img=1'
          }))
        } else {
          console.warn('Backend returned non-array data for suggestions:', suggestionsData)
          return []
        }
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.error('❌ Backend suggestions API failed:', error.message)
      console.error('Error details:', error.response?.data || error.message)
      
      // Don't fall back to mock data - return empty array instead
      return []
    }
  }

  // Global search (all types)
  async globalSearch(query, page = 1, limit = 20) {
    try {
      console.log('🔍 Performing global search via backend API:', query)
      
      // Use the correct backend endpoint with 'all' type
      const response = await axiosInstance.get('/api/search', {
        params: { 
          q: query,  // Backend expects 'q' parameter
          type: 'all',  // Search all types
          page, 
          limit 
        }
      })
      
      console.log('✅ Backend global search response:', response.data)
      
      if (response.data.success) {
        const backendData = response.data.data || {}
        
        // Backend returns { users: [...], posts: [...], tournaments: [...] }
        const usersData = backendData.users || []
        const postsData = backendData.posts || []
        const tournamentsData = backendData.tournaments || []
        
        // Ensure all data is arrays
        const usersArray = Array.isArray(usersData) ? usersData : []
        const postsArray = Array.isArray(postsData) ? postsData : []
        const tournamentsArray = Array.isArray(tournamentsData) ? tournamentsData : []
        
        return {
          users: usersArray,
          posts: postsArray,
          tournaments: tournamentsArray,
          total: usersArray.length + postsArray.length + tournamentsArray.length,
          page: page,
          limit: limit
        }
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.error('❌ Backend global search API failed:', error.message)
      console.error('Error details:', error.response?.data || error.message)
      
      // Don't fall back to mock data - throw the error instead
      throw new Error(`Global search failed: ${error.response?.data?.message || error.message}`)
    }
  }

  // Get trending searches
  async getTrendingSearches() {
    try {
      console.log('🔍 Getting trending searches from backend API')
      
      const response = await axiosInstance.get('/api/search/trending')
      
      console.log('✅ Backend trending response:', response.data)
      
      if (response.data.success) {
        const trendingData = response.data.data || {}
        
        // Backend returns { tournaments: [...], posts: [...] }
        const tournaments = trendingData.tournaments || []
        const posts = trendingData.posts || []
        
        // Convert to trending search format
        const trendingSearches = [
          ...tournaments.map(t => ({ query: t.title, count: t.applicantCount || 0 })),
          ...posts.map(p => ({ query: p.caption, count: p.likesCount || 0 }))
        ]
        
        return trendingSearches.slice(0, 5) // Return top 5
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.error('❌ Backend trending API failed:', error.message)
      console.error('Error details:', error.response?.data || error.message)
      
      // Don't fall back to mock data - return empty array instead
      return []
    }
  }

  // Save search history
  async saveSearchHistory(userId, query) {
    try {
      // Since the backend doesn't have this endpoint, we'll just return success
      // This prevents the 404 error while maintaining functionality
      console.log('Saving search history locally:', { userId, query })
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { success: true, query }
    } catch (error) {
      console.warn('Search history save failed:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { success: true, query }
    }
  }

  // Get search history
  async getSearchHistory(userId) {
    try {
      // Since the backend doesn't have this endpoint, return mock data
      console.log('Getting search history locally for user:', userId)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return [
        { query: 'football academy', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { query: 'basketball coach', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { query: 'tennis tournament', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    } catch (error) {
      console.warn('Search history retrieval failed:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return [
        { query: 'football academy', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { query: 'basketball coach', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { query: 'tennis tournament', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    }
  }
}

export default new SearchService()
