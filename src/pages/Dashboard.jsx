import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Eye, 
  Home,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [debugInfo, setDebugInfo] = useState('')
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    // Add debugging information
    const debug = `User: ${JSON.stringify(user)}, IsLoading: ${isLoading}`
    setDebugInfo(debug)
    console.log('Dashboard Debug:', debug)

    // Wait for auth to finish loading
    if (isLoading) {
      return
    }

    if (!user) {
      console.log('No user found, redirecting to login')
      navigate('/login', { replace: true })
      return
    }

    // Check if user has a valid role (handle case sensitivity)
    if (user?.role && user.role.trim() !== '') {
      console.log('User role found:', user.role)
      // Normalize role to handle case sensitivity
      const normalizedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
      console.log('Normalized role:', normalizedRole)
      
      // Redirect to role-specific dashboard
      switch (normalizedRole) {
        case 'Player':
          console.log('Redirecting to player dashboard')
          navigate('/dashboard/player', { replace: true })
          break
        case 'Academy':
          console.log('Redirecting to academy dashboard')
          navigate('/dashboard/academy', { replace: true })
          break
        case 'Club':
          console.log('Redirecting to club dashboard')
          navigate('/dashboard/club', { replace: true })
          break
        case 'Scout':
          console.log('Redirecting to scout dashboard')
          navigate('/dashboard/scout', { replace: true })
          break
        default:
          console.log('Unknown role, showing fallback dashboard:', normalizedRole)
          setShowFallback(true)
      }
    } else {
      console.log('No user role found, showing fallback dashboard')
      setShowFallback(true)
    }
  }, [user, navigate, isLoading])

  // Show fallback dashboard if no specific role is found
  if (showFallback) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to SportsInn Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your role to access your personalized dashboard
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card 
              className="glass-card-premium dark:glass-card-premium-dark border-0 cursor-pointer hover:shadow-md transition-all duration-300"
              onClick={() => navigate('/dashboard/player')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Player</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Track your performance
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="glass-card-premium dark:glass-card-premium-dark border-0 cursor-pointer hover:shadow-md transition-all duration-300"
              onClick={() => navigate('/dashboard/academy')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Academy</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Manage your academy
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <Home className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="glass-card-premium dark:glass-card-premium-dark border-0 cursor-pointer hover:shadow-md transition-all duration-300"
              onClick={() => navigate('/dashboard/club')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Club</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Club management
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="glass-card-premium dark:glass-card-premium-dark border-0 cursor-pointer hover:shadow-md transition-all duration-300"
              onClick={() => navigate('/dashboard/scout')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scout</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Scout talent
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Debug Information</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p><strong>User Object:</strong> {JSON.stringify(user, null, 2)}</p>
                  <p><strong>Is Loading:</strong> {isLoading.toString()}</p>
                  <p><strong>User Role:</strong> {user?.role || 'No role found'}</p>
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm"
                    className="mr-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={() => navigate('/profile')} 
                    variant="outline" 
                    size="sm"
                  >
                    Go to Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Show loading state
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left max-w-md">
            <strong>Debug Info:</strong><br />
            {debugInfo}
          </div>
        )}
      </div>
    </div>
  )
}