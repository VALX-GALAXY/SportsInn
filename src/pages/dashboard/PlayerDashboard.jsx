import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar, 
  Star,
  Target,
  Award,
  Activity,
  MapPin,
  Clock,
  Eye,
  Heart
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import tournamentService from '../../api/tournamentService'
import feedService from '../../api/feedService'
import { DashboardStatsSkeleton } from '../../components/SkeletonLoaders'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [stats] = useState({
    tournamentsPlayed: 12,
    tournamentsWon: 3,
    totalMatches: 45,
    winRate: 68,
    currentRank: 15,
    totalPoints: 1250
  })
  const [tournamentInvites, setTournamentInvites] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch tournament invites (mock data for now)
      const tournaments = await tournamentService.getTournaments({ limit: 3 })
      setTournamentInvites(tournaments.tournaments || [])
      
      // Fetch recent posts from feed
      const feed = await feedService.getFeed(1, 3)
      setRecentPosts(feed.posts || [])
      
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your player dashboard with stats, invites, and recent activity
            </p>
          </div>
          <DashboardStatsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your player dashboard with stats, invites, and recent activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tournaments Played</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tournamentsPlayed}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.winRate}%</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Rank</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">#{stats.currentRank}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPoints}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tournament Invites */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tournament Invites</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                {tournamentInvites.map((tournament) => (
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
                          {formatCurrency(tournament.entryFee)}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Apply
                    </Button>
                  </div>
                ))}
                
                {tournamentInvites.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No tournament invites yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
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
                  <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
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
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.stats.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.stats.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentPosts.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 mt-8">
          <CardHeader className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center space-y-2">
                <Trophy className="w-6 h-6" />
                <span>Browse Tournaments</span>
              </Button>
              <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center space-y-2">
                <Users className="w-6 h-6" />
                <span>Find Teams</span>
              </Button>
              <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center space-y-2">
                <Star className="w-6 h-6" />
                <span>Update Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
