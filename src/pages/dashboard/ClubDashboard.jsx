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
  Building,
  Handshake
} from 'lucide-react'
// import { useAuth } from '../../contexts/AuthContext' // Not used
import tournamentService from '../../api/tournamentService'
import feedService from '../../api/feedService'

export default function ClubDashboard() {
  const [stats] = useState({
    totalMembers: 120,
    activeTeams: 8,
    tournamentsHosted: 5,
    partnerships: 12,
    upcomingEvents: 7,
    totalRevenue: 450000
  })
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [scoutSuggestions, setScoutSuggestions] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch upcoming tournaments
      const tournaments = await tournamentService.getTournaments({ limit: 3 })
      setUpcomingTournaments(tournaments.tournaments || [])
      
      // Fetch recent posts
      const feed = await feedService.getFeed(1, 3)
      setRecentPosts(feed.posts || [])
      
      // Mock scout suggestions
      setScoutSuggestions([
        {
          id: 'scout_1',
          name: 'Trisha',
          role: 'Scout',
          location: 'Mumbai',
          specialties: ['Football', 'Cricket'],
          rating: 4.8,
          playersScouted: 25
        },
        {
          id: 'scout_2',
          name: 'Rajesh Kumar',
          role: 'Scout',
          location: 'Delhi',
          specialties: ['Basketball', 'Tennis'],
          rating: 4.6,
          playersScouted: 18
        },
        {
          id: 'scout_3',
          name: 'Priya Sharma',
          role: 'Scout',
          location: 'Bangalore',
          specialties: ['Badminton', 'Table Tennis'],
          rating: 4.9,
          playersScouted: 32
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
        <div className="relative bg-gradient-to-r from-purple-500 to-emerald-500 rounded-2xl p-8 text-white overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Club Management Hub
            </h1>
            <p className="text-purple-100 mb-4">
              Manage your club, teams, tournaments, and partnerships
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">{stats.totalMembers} Total Members</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">{stats.activeTeams} Active Teams</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">+18%</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Teams</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTeams}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Partnerships</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.partnerships}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Handshake className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Tournaments */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Tournaments</h2>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
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
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {upcomingTournaments.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No upcoming tournaments</p>
                    <Button className="mt-4" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tournament
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scout Suggestions */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scout Suggestions</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {scoutSuggestions.map((scout) => (
                  <div key={scout.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {scout.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {scout.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{scout.location}</span>
                        <Star className="w-3 h-3 ml-2" />
                        <span>{scout.rating}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {scout.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {scout.playersScouted} players scouted
                      </p>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Connect
                    </Button>
                  </div>
                ))}
                
                {scoutSuggestions.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No scout suggestions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts Management */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 mt-8">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
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
                      <span>{post.stats.likes} likes</span>
                      <span>{post.stats.comments} comments</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {recentPosts.length === 0 && (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent posts</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
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
                <Plus className="w-6 h-6" />
                <span>Create Tournament</span>
              </Button>
              <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center space-y-2">
                <Users className="w-6 h-6" />
                <span>Manage Teams</span>
              </Button>
              <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center space-y-2">
                <Handshake className="w-6 h-6" />
                <span>Partnerships</span>
              </Button>
              <Button className="h-16 bg-orange-600 hover:bg-orange-700 text-white flex flex-col items-center space-y-2">
                <Building className="w-6 h-6" />
                <span>Club Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
