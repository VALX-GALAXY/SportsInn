// Mock stats service for dashboard statistics
class StatsService {
  constructor() {
    this.statsKey = 'sportshub_stats'
  }

  // Get player statistics
  async getPlayerStats(userId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Get stored stats or create new ones
      const storedStats = this.getStoredStats()
      const playerStats = storedStats.players[userId] || this.generatePlayerStats(userId)
      
      // Update stored stats
      storedStats.players[userId] = playerStats
      this.saveStats(storedStats)
      
      return playerStats
    } catch (error) {
      console.error('Error fetching player stats:', error)
      throw new Error('Failed to fetch player statistics')
    }
  }

  // Get academy statistics
  async getAcademyStats(userId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Get stored stats or create new ones
      const storedStats = this.getStoredStats()
      const academyStats = storedStats.academies[userId] || this.generateAcademyStats(userId)
      
      // Update stored stats
      storedStats.academies[userId] = academyStats
      this.saveStats(storedStats)
      
      return academyStats
    } catch (error) {
      console.error('Error fetching academy stats:', error)
      throw new Error('Failed to fetch academy statistics')
    }
  }

  // Get scout statistics
  async getScoutStats(userId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Get stored stats or create new ones
      const storedStats = this.getStoredStats()
      const scoutStats = storedStats.scouts[userId] || this.generateScoutStats(userId)
      
      // Update stored stats
      storedStats.scouts[userId] = scoutStats
      this.saveStats(storedStats)
      
      return scoutStats
    } catch (error) {
      console.error('Error fetching scout stats:', error)
      throw new Error('Failed to fetch scout statistics')
    }
  }

  // Generate player statistics
  generatePlayerStats(userId) {
    return {
      // Basic stats
      tournamentsApplied: Math.floor(Math.random() * 20) + 5,
      acceptedPercentage: Math.floor(Math.random() * 30) + 60,
      connectionsCount: Math.floor(Math.random() * 100) + 50,
      totalMatches: Math.floor(Math.random() * 50) + 20,
      winRate: Math.floor(Math.random() * 40) + 50,
      currentRank: Math.floor(Math.random() * 50) + 1,
      totalPoints: Math.floor(Math.random() * 2000) + 500,
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      
      // Chart data
      tournamentParticipation: [
        { name: 'Won', value: Math.floor(Math.random() * 5) + 1, color: '#10B981' },
        { name: 'Lost', value: Math.floor(Math.random() * 10) + 3, color: '#EF4444' },
        { name: 'Pending', value: Math.floor(Math.random() * 3) + 1, color: '#F59E0B' }
      ],
      
      connectionsData: [
        { name: 'Players', value: Math.floor(Math.random() * 30) + 20, color: '#3B82F6' },
        { name: 'Academies', value: Math.floor(Math.random() * 15) + 5, color: '#8B5CF6' },
        { name: 'Clubs', value: Math.floor(Math.random() * 10) + 3, color: '#10B981' },
        { name: 'Scouts', value: Math.floor(Math.random() * 20) + 10, color: '#F59E0B' }
      ],
      
      performanceData: [
        { month: 'Jan', matches: Math.floor(Math.random() * 10) + 5, wins: Math.floor(Math.random() * 8) + 3, rating: Math.round((Math.random() * 2 + 3) * 10) / 10 },
        { month: 'Feb', matches: Math.floor(Math.random() * 10) + 5, wins: Math.floor(Math.random() * 8) + 3, rating: Math.round((Math.random() * 2 + 3) * 10) / 10 },
        { month: 'Mar', matches: Math.floor(Math.random() * 10) + 5, wins: Math.floor(Math.random() * 8) + 3, rating: Math.round((Math.random() * 2 + 3) * 10) / 10 },
        { month: 'Apr', matches: Math.floor(Math.random() * 10) + 5, wins: Math.floor(Math.random() * 8) + 3, rating: Math.round((Math.random() * 2 + 3) * 10) / 10 },
        { month: 'May', matches: Math.floor(Math.random() * 10) + 5, wins: Math.floor(Math.random() * 8) + 3, rating: Math.round((Math.random() * 2 + 3) * 10) / 10 }
      ],
      
      // Recent activity
      recentActivity: [
        {
          id: 'activity_1',
          type: 'tournament',
          title: 'Applied to Spring Championship',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: 'activity_2',
          type: 'connection',
          title: 'Connected with Elite Academy',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 'activity_3',
          type: 'match',
          title: 'Won against City FC',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ]
    }
  }

  // Generate academy statistics
  generateAcademyStats(userId) {
    return {
      // Basic stats
      playersScouted: Math.floor(Math.random() * 100) + 50,
      tournamentsHosted: Math.floor(Math.random() * 10) + 2,
      totalStudents: Math.floor(Math.random() * 80) + 30,
      successRate: Math.floor(Math.random() * 30) + 70,
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      
      // Chart data
      tournamentParticipation: [
        { name: 'Hosted', value: Math.floor(Math.random() * 5) + 1, color: '#10B981' },
        { name: 'Participated', value: Math.floor(Math.random() * 10) + 3, color: '#3B82F6' },
        { name: 'Upcoming', value: Math.floor(Math.random() * 3) + 1, color: '#F59E0B' }
      ],
      
      scoutingData: [
        { name: 'Jan', players: Math.floor(Math.random() * 15) + 5, tournaments: Math.floor(Math.random() * 2) },
        { name: 'Feb', players: Math.floor(Math.random() * 15) + 5, tournaments: Math.floor(Math.random() * 2) },
        { name: 'Mar', players: Math.floor(Math.random() * 15) + 5, tournaments: Math.floor(Math.random() * 2) },
        { name: 'Apr', players: Math.floor(Math.random() * 15) + 5, tournaments: Math.floor(Math.random() * 2) },
        { name: 'May', players: Math.floor(Math.random() * 15) + 5, tournaments: Math.floor(Math.random() * 2) }
      ],
      
      studentProgress: [
        { name: 'Beginner', value: Math.floor(Math.random() * 20) + 10, color: '#F59E0B' },
        { name: 'Intermediate', value: Math.floor(Math.random() * 30) + 15, color: '#3B82F6' },
        { name: 'Advanced', value: Math.floor(Math.random() * 15) + 5, color: '#10B981' },
        { name: 'Professional', value: Math.floor(Math.random() * 10) + 2, color: '#8B5CF6' }
      ],
      
      // Recent activity
      recentActivity: [
        {
          id: 'activity_1',
          type: 'tournament',
          title: 'Hosted Summer Championship',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 'activity_2',
          type: 'scouting',
          title: 'Scouted 5 new players',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 'activity_3',
          type: 'student',
          title: 'New student enrolled',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ]
    }
  }

  // Generate scout statistics
  generateScoutStats(userId) {
    return {
      // Basic stats
      playersScouted: Math.floor(Math.random() * 150) + 50,
      successfulPlacements: Math.floor(Math.random() * 50) + 20,
      successRate: Math.floor(Math.random() * 30) + 60,
      averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      totalEarnings: Math.floor(Math.random() * 100000) + 25000,
      activeContracts: Math.floor(Math.random() * 10) + 3,
      
      // Chart data
      placementData: [
        { name: 'Successful', value: Math.floor(Math.random() * 30) + 15, color: '#10B981' },
        { name: 'Pending', value: Math.floor(Math.random() * 20) + 10, color: '#F59E0B' },
        { name: 'Failed', value: Math.floor(Math.random() * 15) + 5, color: '#EF4444' }
      ],
      
      scoutingActivity: [
        { name: 'Jan', scouted: Math.floor(Math.random() * 20) + 10, placed: Math.floor(Math.random() * 8) + 3 },
        { name: 'Feb', scouted: Math.floor(Math.random() * 20) + 10, placed: Math.floor(Math.random() * 8) + 3 },
        { name: 'Mar', scouted: Math.floor(Math.random() * 20) + 10, placed: Math.floor(Math.random() * 8) + 3 },
        { name: 'Apr', scouted: Math.floor(Math.random() * 20) + 10, placed: Math.floor(Math.random() * 8) + 3 },
        { name: 'May', scouted: Math.floor(Math.random() * 20) + 10, placed: Math.floor(Math.random() * 8) + 3 }
      ],
      
      sportBreakdown: [
        { name: 'Football', value: Math.floor(Math.random() * 40) + 20, color: '#3B82F6' },
        { name: 'Cricket', value: Math.floor(Math.random() * 30) + 15, color: '#10B981' },
        { name: 'Basketball', value: Math.floor(Math.random() * 20) + 10, color: '#F59E0B' },
        { name: 'Tennis', value: Math.floor(Math.random() * 15) + 5, color: '#8B5CF6' }
      ],
      
      // Recent activity
      recentActivity: [
        {
          id: 'activity_1',
          type: 'placement',
          title: 'Successfully placed player at Elite Academy',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 'activity_2',
          type: 'scouting',
          title: 'Scouted 3 promising players',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 'activity_3',
          type: 'contract',
          title: 'New contract with Premier Club',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        }
      ]
    }
  }

  // Get stored stats from localStorage
  getStoredStats() {
    try {
      const stored = localStorage.getItem(this.statsKey)
      return stored ? JSON.parse(stored) : {
        players: {},
        academies: {},
        scouts: {}
      }
    } catch (error) {
      console.error('Error parsing stored stats:', error)
      return {
        players: {},
        academies: {},
        scouts: {}
      }
    }
  }

  // Save stats to localStorage
  saveStats(stats) {
    try {
      localStorage.setItem(this.statsKey, JSON.stringify(stats))
    } catch (error) {
      console.error('Error saving stats:', error)
    }
  }

  // Update player stats (for when actions are performed)
  updatePlayerStats(userId, updates) {
    const storedStats = this.getStoredStats()
    if (storedStats.players[userId]) {
      storedStats.players[userId] = { ...storedStats.players[userId], ...updates }
      this.saveStats(storedStats)
    }
  }

  // Update academy stats
  updateAcademyStats(userId, updates) {
    const storedStats = this.getStoredStats()
    if (storedStats.academies[userId]) {
      storedStats.academies[userId] = { ...storedStats.academies[userId], ...updates }
      this.saveStats(storedStats)
    }
  }

  // Update scout stats
  updateScoutStats(userId, updates) {
    const storedStats = this.getStoredStats()
    if (storedStats.scouts[userId]) {
      storedStats.scouts[userId] = { ...storedStats.scouts[userId], ...updates }
      this.saveStats(storedStats)
    }
  }

  // Get leaderboard data
  async getLeaderboard(type = 'players', limit = 10) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockLeaderboard = {
        players: [
          { rank: 1, name: 'Alex Johnson', points: 2450, rating: 4.8, sport: 'Football' },
          { rank: 2, name: 'Sarah Wilson', points: 2380, rating: 4.7, sport: 'Basketball' },
          { rank: 3, name: 'Mike Chen', points: 2320, rating: 4.6, sport: 'Tennis' },
          { rank: 4, name: 'Emma Davis', points: 2280, rating: 4.5, sport: 'Cricket' },
          { rank: 5, name: 'David Brown', points: 2200, rating: 4.4, sport: 'Football' }
        ],
        academies: [
          { rank: 1, name: 'Elite Sports Academy', students: 150, rating: 4.9, location: 'Mumbai' },
          { rank: 2, name: 'Champion Academy', students: 120, rating: 4.8, location: 'Delhi' },
          { rank: 3, name: 'Pro Sports Center', students: 100, rating: 4.7, location: 'Bangalore' },
          { rank: 4, name: 'Future Stars Academy', students: 90, rating: 4.6, location: 'Chennai' },
          { rank: 5, name: 'Golden Sports Academy', students: 80, rating: 4.5, location: 'Kolkata' }
        ],
        scouts: [
          { rank: 1, name: 'Rajesh Kumar', placements: 45, rating: 4.9, successRate: 85 },
          { rank: 2, name: 'Priya Sharma', placements: 38, rating: 4.8, successRate: 82 },
          { rank: 3, name: 'Amit Singh', placements: 35, rating: 4.7, successRate: 80 },
          { rank: 4, name: 'Sneha Patel', placements: 32, rating: 4.6, successRate: 78 },
          { rank: 5, name: 'Vikram Reddy', placements: 30, rating: 4.5, successRate: 75 }
        ]
      }
      
      return mockLeaderboard[type] || []
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      throw new Error('Failed to fetch leaderboard')
    }
  }
}

export default new StatsService()
