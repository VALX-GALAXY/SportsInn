import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Moon, Sun, User, LogOut, Home, Users, Eye, Menu, X, Bell, Search, MessageCircle, Inbox } from 'lucide-react'
import requestService from '@/api/requestService'
import { useState, useEffect } from 'react'

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [theme, setTheme] = useState('light')
  const [requestsCount, setRequestsCount] = useState(0)

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  useEffect(() => {
    // simple counter for pending requests
    const { received } = requestService.list()
    setRequestsCount(received.filter(r => r.status === 'pending').length)
  })


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }


  const getRoleIcon = (role) => {
    switch (role) {
      case 'Player':
        return <User className="w-4 h-4" />
      case 'Academy':
        return <Home className="w-4 h-4" />
      case 'Club':
        return <Users className="w-4 h-4" />
      case 'Scout':
        return <Eye className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Player':
        return 'text-green-600 bg-green-50'
      case 'Academy':
        return 'text-blue-600 bg-blue-50'
      case 'Club':
        return 'text-purple-600 bg-purple-50'
      case 'Scout':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isAuthenticated) {
    return (
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                SportsHub
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300" variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 shadow-sm sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              SportsHub
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Profile
              </Link>
              <Link to="/feed" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Feed
              </Link>
              <Link to="/search" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </Link>
              <Link to="/notifications" className="relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <Link to="/requests" className="relative text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <Inbox className="w-5 h-5" />
                {requestsCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs">
                    {requestsCount}
                  </Badge>
                )}
              </Link>
              <Link to="/messages" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getRoleColor(user?.role)}`}>
                {getRoleIcon(user?.role)}
                <span className="text-sm font-medium">{user?.role}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-700">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name}
                  </span>
                  {user?.age && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Age: {user.age}
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
    </nav>
  )
}

export default Navbar
