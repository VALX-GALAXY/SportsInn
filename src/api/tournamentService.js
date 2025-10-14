import axiosInstance from './axiosInstance'

class TournamentService {
  // Get tournaments with filtering
  async getTournaments(filters = {}) {
    try {
      // Try backend API first
      const response = await axiosInstance.get('/api/tournaments', {
        params: {
          role: filters.role,
          location: filters.location,
          type: filters.type,
          minFee: filters.minFee,
          maxFee: filters.maxFee,
          search: filters.search,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          page: filters.page || 1,
          limit: filters.limit || 20
        }
      })
      console.log('Tournament API response:', response.data)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 800))
      return this.getMockTournaments(filters)
    }
  }

  // Get tournament by ID
  async getTournament(tournamentId) {
    try {
      const response = await axiosInstance.get(`/api/tournaments/${tournamentId}`)
      console.log('Tournament details API response:', response.data)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 500))
      return this.getMockTournament(tournamentId)
    }
  }

  // Apply to tournament
  async applyToTournament(tournamentId, applicationData) {
    try {
      const response = await axiosInstance.post(`/api/tournaments/apply`, {
        tournamentId,
        ...applicationData
      })
      console.log('Apply tournament API response:', response.data)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return this.mockApplyToTournament(tournamentId, applicationData)
    }
  }

  // Get tournament application status
  async getApplicationStatus(tournamentId) {
    try {
      const response = await axiosInstance.get(`/api/tournaments/${tournamentId}/application-status`)
      console.log('Application status API response:', response.data)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 300))
      return this.mockGetApplicationStatus(tournamentId)
    }
  }

  // Withdraw application
  async withdrawApplication(tournamentId) {
    try {
      const response = await axiosInstance.delete(`/api/tournaments/${tournamentId}/application`)
      console.log('Withdraw application API response:', response.data)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 500))
      return this.mockWithdrawApplication(tournamentId)
    }
  }

  // Get user's tournament applications
  async getUserApplications() {
    try {
      const response = await axiosInstance.get('/api/tournaments/applications')
      console.log('User applications API response:', response.data)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 500))
      return this.getMockUserApplications()
    }
  }

  // Mock data methods
  getMockTournaments(filters = {}) {
    const mockTournaments = [
      {
        id: 'tournament_1',
        title: 'Summer Football Championship 2024',
        type: 'Football',
        location: 'Mumbai, India',
        entryFee: 5000,
        teamSize: 11,
        maxTeams: 16,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(), // 37 days from now
        description: 'Annual summer football championship for clubs and academies. Prize pool of ₹2,00,000.',
        organizer: {
          id: 'org_1',
          name: 'Mumbai Sports Club',
          role: 'Club'
        },
        status: 'open',
        registeredTeams: 8,
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&h=300&fit=crop',
        requirements: ['Valid team registration', 'Medical certificates', 'Insurance coverage'],
        prizePool: 200000,
        ageGroup: '18+',
        skillLevel: 'Intermediate'
      },
      {
        id: 'tournament_2',
        title: 'Youth Cricket League',
        type: 'Cricket',
        location: 'Delhi, India',
        entryFee: 3000,
        teamSize: 11,
        maxTeams: 12,
        startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Youth cricket tournament for players under 25. Great opportunity for young talent.',
        organizer: {
          id: 'org_2',
          name: 'Delhi Cricket Academy',
          role: 'Academy'
        },
        status: 'open',
        registeredTeams: 5,
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop',
        requirements: ['Age verification', 'Team registration', 'Equipment check'],
        prizePool: 150000,
        ageGroup: 'Under 25',
        skillLevel: 'All Levels'
      },
      {
        id: 'tournament_3',
        title: 'Basketball Street Tournament',
        type: 'Basketball',
        location: 'Bangalore, India',
        entryFee: 2000,
        teamSize: 5,
        maxTeams: 20,
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Street basketball tournament with 3v3 format. Fast-paced action guaranteed!',
        organizer: {
          id: 'org_3',
          name: 'Bangalore Basketball Club',
          role: 'Club'
        },
        status: 'open',
        registeredTeams: 12,
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=300&fit=crop',
        requirements: ['Team registration', 'Health check'],
        prizePool: 75000,
        ageGroup: '16+',
        skillLevel: 'All Levels'
      },
      {
        id: 'tournament_4',
        title: 'Tennis Singles Championship',
        type: 'Tennis',
        location: 'Chennai, India',
        entryFee: 1500,
        teamSize: 1,
        maxTeams: 32,
        startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Individual tennis championship with knockout format. Perfect for showcasing individual skills.',
        organizer: {
          id: 'org_4',
          name: 'Chennai Tennis Academy',
          role: 'Academy'
        },
        status: 'open',
        registeredTeams: 18,
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&h=300&fit=crop',
        requirements: ['Individual registration', 'Equipment', 'Medical certificate'],
        prizePool: 100000,
        ageGroup: '18+',
        skillLevel: 'Advanced'
      },
      {
        id: 'tournament_5',
        title: 'Badminton Doubles Tournament',
        type: 'Badminton',
        location: 'Pune, India',
        entryFee: 2500,
        teamSize: 2,
        maxTeams: 16,
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Badminton doubles tournament for pairs. Great team coordination required!',
        organizer: {
          id: 'org_5',
          name: 'Pune Sports Complex',
          role: 'Club'
        },
        status: 'open',
        registeredTeams: 10,
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=300&fit=crop',
        requirements: ['Pair registration', 'Equipment check'],
        prizePool: 80000,
        ageGroup: '16+',
        skillLevel: 'Intermediate'
      }
    ]

    // Apply filters
    let filteredTournaments = mockTournaments

    if (filters.role && filters.role !== 'all') {
      filteredTournaments = filteredTournaments.filter(t => t.organizer.role === filters.role)
    }

    if (filters.location && filters.location !== 'all') {
      filteredTournaments = filteredTournaments.filter(t => 
        t.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.minFee !== undefined && filters.minFee !== '' && !isNaN(parseInt(filters.minFee))) {
      filteredTournaments = filteredTournaments.filter(t => t.entryFee >= parseInt(filters.minFee))
    }

    if (filters.maxFee !== undefined && filters.maxFee !== '' && !isNaN(parseInt(filters.maxFee))) {
      filteredTournaments = filteredTournaments.filter(t => t.entryFee <= parseInt(filters.maxFee))
    }

    if (filters.type && filters.type !== 'all') {
      filteredTournaments = filteredTournaments.filter(t => t.type === filters.type)
    }

    if (filters.search && filters.search !== '') {
      filteredTournaments = filteredTournaments.filter(t => 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.location.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    return {
      tournaments: filteredTournaments,
      total: filteredTournaments.length,
      page: filters.page || 1,
      limit: filters.limit || 10
    }
  }

  getMockTournament(tournamentId) {
    const tournaments = this.getMockTournaments().tournaments
    return tournaments.find(t => t.id === tournamentId) || null
  }

  mockApplyToTournament(tournamentId, applicationData) {
    // Mock successful application
    return {
      success: true,
      applicationId: `app_${Date.now()}`,
      tournamentId,
      message: 'Application submitted successfully! You will be notified about the status.',
      applicationData
    }
  }

  getMockUserApplications() {
    return [
      {
        id: 'app_1',
        tournamentId: 'tournament_1',
        tournamentTitle: 'Summer Football Championship 2024',
        status: 'pending',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        teamName: 'Thunder FC'
      },
      {
        id: 'app_2',
        tournamentId: 'tournament_3',
        tournamentTitle: 'Basketball Street Tournament',
        status: 'approved',
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        teamName: 'Street Kings'
      }
    ]
  }

  mockGetApplicationStatus(tournamentId) {
    // Mock application status - in real app, this would check user's application
    const mockStatuses = {
      'tournament_1': { status: 'not_applied' },
      'tournament_2': { status: 'applied', applicationId: 'app_123', appliedAt: new Date().toISOString() },
      'tournament_3': { status: 'approved', applicationId: 'app_456', appliedAt: new Date().toISOString() },
      'tournament_4': { status: 'rejected', applicationId: 'app_789', appliedAt: new Date().toISOString() }
    }
    
    return mockStatuses[tournamentId] || { status: 'not_applied' }
  }

  mockWithdrawApplication(tournamentId) {
    return {
      success: true,
      message: 'Application withdrawn successfully',
      tournamentId
    }
  }
}

export default new TournamentService()
