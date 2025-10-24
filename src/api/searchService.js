import axiosInstance from './axiosInstance'

class SearchService {
  // Search users with filters
  async searchUsers(query, filters = {}, page = 1, limit = 20) {
    try {
      console.log('🔍 Searching users via backend API:', query)
      const response = await axiosInstance.get('/api/search', {
        params: {
          name: query,  // Backend expects 'name' parameter
          role: filters.role,
          location: filters.location,
          ageMin: filters.ageMin,
          ageMax: filters.ageMax,
          page,
          limit
        }
      })
      
      console.log('✅ Backend users search response:', response.data)
      
      if (response.data.success) {
        return {
          users: response.data.data || [],
          total: response.data.total || 0,
          page: response.data.page || page,
          limit: response.data.limit || limit
        }
      } else {
        throw new Error('Backend returned success: false')
      }
    } catch (error) {
      console.warn('⚠️ Backend users search API unavailable, using mock data:', error.message)
      console.warn('Error details:', error.response?.data || error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockUsers = [
        {
          id: 1,
          name: 'Jay kumar',
          role: 'Player',
          avatar: 'https://i.pravatar.cc/150?img=32',
          location: 'New York, NY',
          age: 22,
          position: 'Forward',
          playerRole: 'Batsman',
          experience: '5 years',
          verified: true,
          followers: 1250,
          bio: 'Professional football player with 5 years of experience. Looking for opportunities to grow.'
        },
        {
          id: 2,
          name: 'Ankit kumar',
          role: 'Player',
          avatar: 'https://i.pravatar.cc/150?img=45',
          location: 'Los Angeles, CA',
          age: 19,
          position: 'Midfielder',
          playerRole: 'Bowler',
          experience: '3 years',
          verified: false,
          followers: 890,
          bio: 'Young talented midfielder with great potential.'
        },
        {
          id: 3,
          name: 'Elite Sports Academy',
          role: 'Academy',
          avatar: 'https://i.pravatar.cc/150?img=67',
          location: 'Miami, FL',
          established: '2015',
          students: 150,
          verified: true,
          followers: 3200,
          bio: 'Premier sports academy focused on developing young talent.'
        },
        {
          id: 4,
          name: 'Csk',
          role: 'Club',
          avatar: 'https://i.pravatar.cc/150?img=78',
          location: 'Chicago, IL',
          founded: '2010',
          players: 25,
          verified: true,
          followers: 4500,
          bio: 'Professional football club competing in the national league.'
        },
        {
          id: 5,
          name: 'Trisha',
          role: 'Scout',
          avatar: 'https://i.pravatar.cc/150?img=89',
          location: 'Boston, MA',
          experience: '10 years',
          discoveries: 50,
          verified: true,
          followers: 2100,
          bio: 'Experienced scout with a track record of discovering talented players.'
        }
      ]
      
      // Filter based on query and filters
      let filteredUsers = mockUsers.filter(user => {
        const matchesQuery = 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.bio.toLowerCase().includes(query.toLowerCase()) ||
          user.location.toLowerCase().includes(query.toLowerCase())
        
        const matchesRole = !filters.role || filters.role === 'all' || user.role === filters.role
        const matchesPlayerRole = !filters.playerRole || user.playerRole === filters.playerRole
        const matchesAge = !filters.ageMin || !filters.ageMax || (user.age >= filters.ageMin && user.age <= filters.ageMax)
        const matchesLocation = !filters.location || user.location.toLowerCase().includes(filters.location.toLowerCase())
        
        return matchesQuery && matchesRole && matchesPlayerRole && matchesAge && matchesLocation
      })
      
      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return {
        users: filteredUsers.slice(startIndex, endIndex),
        total: filteredUsers.length,
        page,
        limit,
        hasMore: endIndex < filteredUsers.length
      }
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
      console.log('🔍 Attempting backend search API call:', `/api/search`)
      console.log('📝 Search query:', query)
      
      // Use the correct backend endpoint
      const response = await axiosInstance.get('/api/search', {
        params: { 
          name: query,  // Backend expects 'name' parameter
          page, 
          limit 
        }
      })
      
      console.log('✅ Backend search response:', response.data)
      
      if (response.data.success) {
        const backendUsers = response.data.data || []
        console.log('📊 Real search results from backend:', backendUsers.length, 'users found')
        
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
      console.warn('⚠️ Backend search API unavailable, using mock data:', error.message)
      console.warn('Error details:', error.response?.data || error.message)
      
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const [usersResult, postsResult, tournamentsResult] = await Promise.all([
        this.searchUsers(query, {}, page, Math.ceil(limit / 3)),
        this.searchPosts(query, {}, page, Math.ceil(limit / 3)),
        this.searchTournaments(query, {}, page, Math.ceil(limit / 3))
      ])
      
      return {
        users: usersResult.users || [],
        posts: postsResult.posts || [],
        tournaments: tournamentsResult.tournaments || [],
        total: (usersResult.total || 0) + (postsResult.total || 0) + (tournamentsResult.total || 0),
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
