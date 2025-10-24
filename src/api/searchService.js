import axiosInstance from './axiosInstance'

class SearchService {
  // Search users with filters
  async searchUsers(query, filters = {}, page = 1, limit = 20) {
    try {
      console.log('🔍 Searching users via backend API:', query)
      
      // Build params object with all possible filters
      const params = {
        name: query,  // Backend expects 'name' parameter
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
        // Transform backend users to frontend format
        const transformedUsers = response.data.data.map(user => ({
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
          total: response.data.total || 0,
          page: response.data.page || page,
          limit: response.data.limit || limit
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
      const response = await axiosInstance.get('/api/search/posts', {
        params: {
          q: query,
          ...filters,
          page,
          limit
        }
      })
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockPosts = [
        {
          id: 'post_1',
          content: 'Amazing goal in yesterday\'s match!',
          author: {
            id: 'user_1',
            name: 'Jay kumar',
            avatar: 'https://i.pravatar.cc/150?img=32',
            role: 'Player'
          },
          image: 'https://picsum.photos/400/300?random=1',
          likes: 45,
          comments: 12,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'post_2',
          content: 'Training session with the academy today',
          author: {
            id: 'user_2',
            name: 'Elite Sports Academy',
            avatar: 'https://i.pravatar.cc/150?img=67',
            role: 'Academy'
          },
          image: 'https://picsum.photos/400/300?random=2',
          likes: 23,
          comments: 8,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      // Filter based on query
      const filteredPosts = mockPosts.filter(post => 
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.author.name.toLowerCase().includes(query.toLowerCase())
      )
      
      return {
        posts: filteredPosts,
        total: filteredPosts.length,
        page,
        limit,
        hasMore: false
      }
    }
  }

  // Search tournaments
  async searchTournaments(query, filters = {}, page = 1, limit = 20) {
    try {
      const response = await axiosInstance.get('/api/search/tournaments', {
        params: {
          q: query,
          ...filters,
          page,
          limit
        }
      })
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockTournaments = [
        {
          id: 'tournament_1',
          name: 'Summer Football Championship',
          description: 'Annual summer football tournament for all age groups',
          location: 'Miami, FL',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          maxParticipants: 32,
          currentParticipants: 18,
          entryFee: 50,
          organizer: {
            id: 'org_1',
            name: 'Elite Sports Academy',
            avatar: 'https://i.pravatar.cc/150?img=67'
          }
        },
        {
          id: 'tournament_2',
          name: 'Youth Basketball League',
          description: 'Competitive basketball league for youth players',
          location: 'Los Angeles, CA',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          maxParticipants: 16,
          currentParticipants: 12,
          entryFee: 75,
          organizer: {
            id: 'org_2',
            name: 'Csk',
            avatar: 'https://i.pravatar.cc/150?img=78'
          }
        }
      ]
      
      // Filter based on query
      const filteredTournaments = mockTournaments.filter(tournament => 
        tournament.name.toLowerCase().includes(query.toLowerCase()) ||
        tournament.description.toLowerCase().includes(query.toLowerCase()) ||
        tournament.location.toLowerCase().includes(query.toLowerCase())
      )
      
      return {
        tournaments: filteredTournaments,
        total: filteredTournaments.length,
        page,
        limit,
        hasMore: false
      }
    }
  }

  // Get search suggestions/autocomplete
  async getSuggestions(query, type = 'all') {
    try {
      console.log('🔍 Getting suggestions from backend API:', query)
      const response = await axiosInstance.get('/api/search', {
        params: { 
          name: query,
          limit: 5  // Get only 5 suggestions
        }
      })
      
      console.log('✅ Backend suggestions response:', response.data)
      
      if (response.data.success) {
        const backendUsers = response.data.data || []
        // Transform backend users to suggestion format
        return backendUsers.map(user => ({
          id: user._id,
          name: user.name,
          type: user.role,
          avatar: user.avatar || 'https://i.pravatar.cc/150?img=1'
        }))
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.warn('⚠️ Backend suggestions API unavailable, using mock data:', error.message)
      console.warn('Error details:', error.response?.data || error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockSuggestions = [
        { type: 'user', name: 'Jay kumar', role: 'Player' },
        { type: 'user', name: 'Elite Sports Academy', role: 'Academy' },
        { type: 'user', name: 'Csk', role: 'Club' },
        { type: 'user', name: 'Trisha', role: 'Scout' },
        { type: 'tournament', name: 'Summer Football Championship' },
        { type: 'tournament', name: 'Youth Basketball League' },
        { type: 'post', name: 'Amazing goal in yesterday\'s match!' }
      ]
      
      return mockSuggestions.filter(suggestion => 
        suggestion.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    }
  }

  // Global search (all types)
  async globalSearch(query, page = 1, limit = 20) {
    try {
      // Use the correct backend endpoint
      const response = await axiosInstance.get('/api/search', {
        params: { 
          name: query,  // Backend expects 'name' parameter
          page, 
          limit 
        }
      })
      
      if (response.data.success) {
        const backendUsers = response.data.data || []
        
        return {
          users: backendUsers,
          posts: [], // Backend doesn't provide posts yet
          tournaments: [], // Backend doesn't provide tournaments yet
          total: response.data.total || 0,
          page: response.data.page || page,
          limit: response.data.limit || limit
        }
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.warn('Backend search API unavailable, using mock data:', error.message)
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockUsers = [
        {
          _id: 'mock1',
          name: 'Jay Kumar',
          role: 'Player',
          location: 'Mumbai, India',
          age: 22,
          profilePic: 'https://i.pravatar.cc/150?img=32'
        },
        {
          _id: 'mock2', 
          name: 'Ankit Kumar',
          role: 'Academy',
          location: 'Delhi, India',
          age: 25,
          profilePic: 'https://i.pravatar.cc/150?img=45'
        }
      ]
      
      return {
        users: mockUsers,
        posts: [],
        tournaments: [],
        total: mockUsers.length,
        page,
        limit
      }
    }
  }

  // Get trending searches
  async getTrendingSearches() {
    try {
      const response = await axiosInstance.get('/api/search/trending')
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return [
        { query: 'football', count: 1250 },
        { query: 'basketball', count: 890 },
        { query: 'cricket', count: 750 },
        { query: 'tennis', count: 450 },
        { query: 'swimming', count: 320 }
      ]
    }
  }

  // Save search history
  async saveSearchHistory(userId, query) {
    try {
      const response = await axiosInstance.post('/api/search/history', {
        userId,
        query
      })
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { success: true, query }
    }
  }

  // Get search history
  async getSearchHistory(userId) {
    try {
      const response = await axiosInstance.get(`/api/search/history/${userId}`)
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
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
