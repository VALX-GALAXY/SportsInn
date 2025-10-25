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
  TrendingDown,
  Zap,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon
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
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import tournamentService from '../../api/tournamentService'
import feedService from '../../api/feedService'
import statsService from '../../api/statsService'
import { DashboardStatsSkeleton } from '../../components/SkeletonLoaders'
import { debugDashboardAPI, debugUserAuth } from '../../utils/debugDashboard'
import NoApiAvailable from '../../components/NoApiAvailable'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tournamentInvites, setTournamentInvites] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user?.id]) // Re-fetch when user changes

  // Add refresh functionality
  const handleRefresh = async () => {
    if (user?.id) {
      setIsLoading(true)
      try {
        const playerStats = await statsService.getPlayerStats(user.id)
        setStats(playerStats)
      } catch (error) {
        console.error('Error refreshing dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Debug authentication
      debugUserAuth()
      
      // Fetch player statistics
      if (user?.id) {
        console.log('🔄 Fetching player stats for user:', user.id)
        
        // Debug API call
        try {
          await debugDashboardAPI(user.id)
          setApiAvailable(true)
        } catch (debugError) {
          console.log('Debug API call failed, API not available')
          setApiAvailable(false)
        }
        
        const playerStats = await statsService.getPlayerStats(user.id)
        console.log('📊 Player stats received:', playerStats)
        setStats(playerStats)
      } else {
        // Clear stats when no user
        setStats(null)
      }
      
      // Fetch tournament invites from backend
      try {
        const tournaments = await tournamentService.getTournaments({ limit: 3 })
        setTournamentInvites(tournaments.tournaments || [])
      } catch (error) {
        console.info('Tournament service unavailable')
        setTournamentInvites([])
      }
      
      // Fetch recent posts from feed
      try {
        const feed = await feedService.getFeed(1, 3)
        setRecentPosts(feed.posts || [])
      } catch (error) {
        console.info('Feed service unavailable')
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

  // Show API not available message
  if (!apiAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Player Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Dashboard for {user?.name || 'Player'} - API Not Available
            </p>
          </div>
          
          <NoApiAvailable 
            title="Player Dashboard API Not Available"
            description="The backend API for player dashboard data is not available. The dashboard is showing mock data for demonstration purposes."
            onRetry={() => {
              setApiAvailable(true)
              fetchDashboardData()
            }}
            showMockDataInfo={true}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl p-8 text-white overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Your Stats Overview
            </h1>
            <p className="text-blue-100 mb-4">
              Track your performance and achievements
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">{stats?.tournamentsApplied || 0} Tournaments Applied</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">{stats?.acceptanceRate || 0}% Success Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tournaments Applied</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.tournamentsApplied || 0}</p>
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

          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Accepted %</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.acceptedPercentage || 0}%</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5% from last month
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <TargetIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Connections</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.connectionsCount || 0}</p>
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


      </div>
    </div>
  )
}
