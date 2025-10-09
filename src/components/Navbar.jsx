import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
// import { useNotifications } from '../contexts/NotificationContext' // Not used in this component
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Moon, Sun, User, LogOut, Home, Users, Eye, Menu, X, Bell, Search, MessageCircle, Inbox, Plus } from 'lucide-react'
import requestService from '@/api/requestService'
import NotificationDropdown from './NotificationDropdown'
import { useState, useEffect } from 'react'

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth()
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
  }, [])


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
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 shadow-sm w-full h-16 flex items-center">
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
                <Button className="sportshub-button" variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="sportshub-button">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700 shadow-sm w-full h-16 flex items-center fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex-shrink-0">
              SportsHub
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2 py-1 text-sm">
                Dashboard
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2 py-1 text-sm">
                Profile
              </Link>
              <Link to="/feed" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2 py-1 text-sm">
                Feed
              </Link>
              <Link to="/tournaments" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2 py-1 text-sm">
                Tournaments
              </Link>
            </div>
          </div>
          
          {/* Right side - Icons and User Info */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Navigation Icons - Always visible */}
            <div className="flex items-center space-x-1">
              {/* Search */}
              <Link to="/search" className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              
              {/* Notifications */}
              <NotificationDropdown />
              
              {/* Messages */}
              <Link to="/messages" className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              
              {/* Requests */}
              <Link to="/requests" className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
                {requestsCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs">
                    {requestsCount}
                  </Badge>
                )}
              </Link>
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-4 h-4" />
            </Button>
            
            {/* User Profile - Desktop Only */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Role Badge */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                {getRoleIcon(user?.role)}
                <span className="hidden xl:inline">{user?.role}</span>
              </div>
              
              {/* Profile Picture */}
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-700 flex-shrink-0">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              
              {/* User Name */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {user?.name}
                </span>
                {user?.age && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Age: {user.age}
                  </span>
                )}
              </div>
              
              {/* Logout Button */}
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
