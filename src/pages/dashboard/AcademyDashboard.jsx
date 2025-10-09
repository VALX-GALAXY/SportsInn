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
  Award
} from 'lucide-react'
import { 
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
// import { useAuth } from '../../contexts/AuthContext' // Not used
import tournamentService from '../../api/tournamentService'
import feedService from '../../api/feedService'

export default function AcademyDashboard() {
  const [stats] = useState({
    playersScouted: 89,
    tournamentsHosted: 3,
    totalStudents: 45,
    successRate: 85
  })

  // Chart data
  const scoutingData = [
    { name: 'Jan', players: 12, tournaments: 1 },
    { name: 'Feb', players: 18, tournaments: 0 },
    { name: 'Mar', players: 15, tournaments: 1 },
    { name: 'Apr', players: 22, tournaments: 1 },
    { name: 'May', players: 19, tournaments: 0 }
  ]

  const tournamentParticipation = [
    { name: 'Hosted', value: 3, color: '#10B981' },
    { name: 'Participated', value: 7, color: '#3B82F6' },
    { name: 'Upcoming', value: 2, color: '#F59E0B' }
  ]

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
      
      // Mock scout suggestions
      setScoutSuggestions([
        {
          id: 'scout_1',
          name: 'Trisha',
          role: 'Scout',
          location: 'Mumbai',
          specialties: ['Football', 'Cricket'],
          rating: 4.8,
          studentsScouted: 12
        },
        {
          id: 'scout_2',
          name: 'Rajesh Kumar',
          role: 'Scout',
          location: 'Delhi',
          specialties: ['Basketball', 'Tennis'],
          rating: 4.6,
          studentsScouted: 8
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Academy Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your academy, students, and tournaments
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Players Scouted</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.playersScouted}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12 this month
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tournaments Hosted</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.tournamentsHosted}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <Trophy className="w-3 h-3 mr-1" />
                    +1 this month
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
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
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hosted vs Participated breakdown</p>
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

          {/* Players Scouted vs Tournaments Hosted Bar Chart */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Scouting vs Tournaments</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monthly scouting and tournament activity</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoutingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} />
                    <Legend />
                    <Bar dataKey="players" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tournaments" fill="#10B981" radius={[4, 4, 0, 0]} />
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
