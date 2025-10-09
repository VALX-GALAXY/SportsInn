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
  Heart,
  BarChart3,
  PieChart,
  TrendingDown
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import tournamentService from '../../api/tournamentService'
import feedService from '../../api/feedService'
import { DashboardStatsSkeleton } from '../../components/SkeletonLoaders'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [stats] = useState({
    tournamentsApplied: 15,
    acceptedPercentage: 75,
    connectionsCount: 89,
    totalMatches: 45,
    winRate: 68,
    currentRank: 15,
    totalPoints: 1250,
    averageRating: 4.2
  })

  // Chart data
  const performanceData = [
    { month: 'Jan', matches: 8, wins: 5, rating: 4.1 },
    { month: 'Feb', matches: 12, wins: 8, rating: 4.3 },
    { month: 'Mar', matches: 10, wins: 7, rating: 4.2 },
    { month: 'Apr', matches: 15, wins: 10, rating: 4.4 },
    { month: 'May', matches: 0, wins: 0, rating: 4.2 }
  ]

  const tournamentParticipation = [
    { name: 'Won', value: 3, color: '#10B981' },
    { name: 'Lost', value: 9, color: '#EF4444' },
    { name: 'Pending', value: 2, color: '#F59E0B' }
  ]

  const connectionsData = [
    { name: 'Players', value: 45, color: '#3B82F6' },
    { name: 'Academies', value: 12, color: '#8B5CF6' },
    { name: 'Clubs', value: 8, color: '#10B981' },
    { name: 'Scouts', value: 24, color: '#F59E0B' }
  ]
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
      try {
        const tournaments = await tournamentService.getTournaments({ limit: 3 })
        setTournamentInvites(tournaments.tournaments || [])
      } catch (error) {
        console.info('Tournament service unavailable, using mock data')
        setTournamentInvites([])
      }
      
      // Fetch recent posts from feed
      try {
        const feed = await feedService.getFeed(1, 3)
        setRecentPosts(feed.posts || [])
      } catch (error) {
        console.info('Feed service unavailable, using mock data')
        setRecentPosts([])
      }
      
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tournaments Applied</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.tournamentsApplied}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +3 this month
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Accepted %</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.acceptedPercentage}%</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5% from last month
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Connections Count</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.connectionsCount}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    Active network
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {/* Tournament Participation Pie Chart */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Tournament Participation</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Applied vs Accepted breakdown</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={tournamentParticipation}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {tournamentParticipation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Connections vs Interactions Bar Chart */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Connections vs Interactions</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Network activity breakdown</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={connectionsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {connectionsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
