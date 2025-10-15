import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Users, 
  Trophy, 
  Calendar, 
  TrendingUp, 
  Star,
  Plus,
  Edit,
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Award,
  Search,
  Heart,
  MessageCircle
} from 'lucide-react'
// import { useAuth } from '../../contexts/AuthContext' // Not used
import tournamentService from '../../api/tournamentService'
import feedService from '../../api/feedService'

export default function ScoutDashboard() {
  const [stats] = useState({
    playersScouted: 45,
    successfulPlacements: 12,
    activeConnections: 28,
    tournamentsAttended: 8,
    upcomingEvents: 3,
    totalEarnings: 180000
  })
  const [recommendedPlayers, setRecommendedPlayers] = useState([])
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch upcoming tournaments
      try {
        const tournaments = await tournamentService.getTournaments({ limit: 3 })
        setUpcomingTournaments(tournaments.tournaments || [])
      } catch (error) {
        console.info('Tournament service unavailable, using mock data')
        setUpcomingTournaments([])
      }
      
      // Fetch recent posts
      try {
        const feed = await feedService.getFeed(1, 3)
        setRecentPosts(feed.posts || [])
      } catch (error) {
        console.info('Feed service unavailable, using mock data')
        setRecentPosts([])
      }
      
      // Mock recommended players
      setRecommendedPlayers([
        {
          id: 'player_1',
          name: 'Arjun Singh',
          age: 19,
          position: 'Forward',
          sport: 'Football',
          location: 'Mumbai',
          rating: 4.8,
          experience: '3 years',
          achievements: ['State Champion 2023', 'Best Player Award'],
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          lastActive: '2 hours ago'
        },
        {
          id: 'player_2',
          name: 'Priya Sharma',
          age: 17,
          position: 'Batsman',
          sport: 'Cricket',
          location: 'Delhi',
          rating: 4.9,
          experience: '4 years',
          achievements: ['U-19 National Team', 'Century in Finals'],
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          lastActive: '1 day ago'
        },
        {
          id: 'player_3',
          name: 'Rahul Kumar',
          age: 20,
          position: 'Point Guard',
          sport: 'Basketball',
          location: 'Bangalore',
          rating: 4.7,
          experience: '5 years',
          achievements: ['College MVP', 'All-Star Selection'],
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          lastActive: '3 hours ago'
        },
        {
          id: 'player_4',
          name: 'Sneha Patel',
          age: 18,
          position: 'Singles',
          sport: 'Tennis',
          location: 'Chennai',
          rating: 4.6,
          experience: '6 years',
          achievements: ['Junior National Champion', 'ITF Ranking'],
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          lastActive: '5 hours ago'
        }
      ])
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-white overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Talent Discovery Hub
            </h1>
            <p className="text-orange-100 mb-4">
              Discover talent, connect with players, and track your scouting activities
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">{stats.playersScouted} Players Scouted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">{stats.successfulPlacements} Successful Placements</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Players Scouted</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.playersScouted}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+25%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful Placements</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successfulPlacements}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+40%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Connections</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeConnections}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+12%</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalEarnings)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+35%</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommended Players */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended Players</h2>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Find More
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {recommendedPlayers.map((player) => (
                  <div key={player.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {player.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {player.sport}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{player.location}</span>
                        <span>•</span>
                        <span>{player.age} years</span>
                        <span>•</span>
                        <span>{player.position}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{player.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {player.experience}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last active: {player.lastActive}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {recommendedPlayers.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No recommended players</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tournaments */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Tournaments</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {upcomingTournaments.map((tournament) => (
                  <div key={tournament.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {tournament.image && (
                      <img
                        src={tournament.image}
                        alt={tournament.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {tournament.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{tournament.location}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{formatDate(tournament.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {tournament.type}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {tournament.registeredTeams}/{tournament.maxTeams} teams
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Attend
                    </Button>
                  </div>
                ))}
                
                {upcomingTournaments.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No upcoming tournaments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 mt-8">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {post.author.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {post.author.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {post.caption}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.stats.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.stats.comments}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {recentPosts.length === 0 && (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 mt-8">
          <CardHeader className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center space-y-2">
                <Search className="w-6 h-6" />
                <span>Find Players</span>
              </Button>
              <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center space-y-2">
                <Trophy className="w-6 h-6" />
                <span>Browse Tournaments</span>
              </Button>
              <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center space-y-2">
                <Users className="w-6 h-6" />
                <span>My Network</span>
              </Button>
              <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center space-y-2">
                <Award className="w-6 h-6" />
                <span>Create Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
