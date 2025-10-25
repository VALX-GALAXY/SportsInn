import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  GraduationCap,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight
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
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Brush
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import tournamentService from '../../api/tournamentService'
import feedService from '../../api/feedService'
import statsService from '../../api/statsService'
import NoApiAvailable from '../../components/NoApiAvailable'

export default function AcademyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [scoutSuggestions, setScoutSuggestions] = useState([])
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
        const academyStats = await statsService.getAcademyStats(user.id)
        setStats(academyStats)
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
      
      // Fetch academy statistics
      if (user?.id) {
        try {
          // Test API availability
          const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
          const response = await fetch(`${backendUrl}/api/dashboard/${user.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            setApiAvailable(true)
          } else {
            setApiAvailable(false)
          }
        } catch (error) {
          console.log('API not available:', error.message)
          setApiAvailable(false)
        }
        
        const academyStats = await statsService.getAcademyStats(user.id)
        setStats(academyStats)
      } else {
        // Clear stats when no user
        setStats(null)
      }
      
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
      
      // No mock scout suggestions - use real data only
      setScoutSuggestions([])
      
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

  // Show API not available message
  if (!apiAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Academy Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Dashboard for {user?.name || 'Academy'} - API Not Available
            </p>
          </div>
          
          <NoApiAvailable 
            title="Academy Dashboard API Not Available"
            description="The backend API for academy dashboard data is not available. The dashboard is showing mock data for demonstration purposes."
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
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Academy Management Hub
                </h1>
                <p className="text-blue-100">
                  Track your academy's performance and manage students
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Activity className="w-4 h-4 mr-2" />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">{stats?.playersScouted || 0} Players Scouted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">{stats?.tournamentsHosted || 0} Tournaments Hosted</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="h-full"
          >
            <Card className="sportsin-card sportsin-fade-in h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Players Scouted</p>
                    <motion.p 
                      className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {stats?.playersScouted || 0}
                    </motion.p>
                    <motion.div 
                      className="flex items-center mt-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+12%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="h-full"
          >
            <Card className="sportsin-card sportsin-fade-in h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tournaments Hosted</p>
                    <motion.p 
                      className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {stats?.tournamentsHosted || 0}
                    </motion.p>
                    <motion.div 
                      className="flex items-center mt-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+8%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="h-full"
          >
            <Card className="sportsin-card sportsin-fade-in h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                    <motion.p 
                      className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      {stats?.totalStudents || 0}
                    </motion.p>
                    <motion.div 
                      className="flex items-center mt-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+15%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="h-full"
          >
            <Card className="sportsin-card sportsin-fade-in h-full">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                    <motion.p 
                      className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      {stats?.successRate || 0}%
                    </motion.p>
                    <motion.div 
                      className="flex items-center mt-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+5%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
