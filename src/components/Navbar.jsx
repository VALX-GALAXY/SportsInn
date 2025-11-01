import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
// import { useNotifications } from '../contexts/NotificationContext' // Not used in this component
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Moon, Sun, User, LogOut, Home, Users, Eye, Menu, X, Bell, Search, MessageCircle, Inbox, Plus } from 'lucide-react'
import requestService from '@/api/requestService'
import NotificationDropdown from './NotificationDropdown'
import { useState, useEffect } from 'react'

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState('light')
  const [requestsCount, setRequestsCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearch(false)
    }
  }

  const handleSearchClick = () => {
    setShowSearch(!showSearch)
    if (!showSearch) {
      // Focus search input after state update
      setTimeout(() => {
        const searchInput = document.getElementById('navbar-search')
        if (searchInput) searchInput.focus()
      }, 100)
    }
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
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
      case 'Academy':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
      case 'Club':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
      case 'Scout':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
      default:
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/20'
    }
  }

  if (!isAuthenticated) {
    return (
      <nav className="glass-navbar border-b border-slate-200/50 dark:border-blue-500/30 shadow-sm w-full h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
                SportsIn
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              <Link to="/login">
                <Button className="sportsin-gradient-button" variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="sportsin-gradient-button">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
      <nav className="glass-navbar border-b border-slate-200/50 dark:border-blue-500/30 shadow-sm w-full h-16 flex items-center fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent flex-shrink-0">
              SportsInn
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/dashboard" className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Dashboard
              </Link>
              <Link to="/profile" className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Profile
              </Link>
              <Link to="/feed" className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Feed
              </Link>
              <Link to="/tournaments" className="text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 transition-colors px-2 py-1 text-sm">
                Tournaments
              </Link>
            </div>
          </div>
          
          {/* Right side - Icons and User Info */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Navigation Icons - Always visible */}
            <div className="flex items-center space-x-1">
              {/* Search */}
              {/* <button 
                onClick={handleSearchClick}
                className="p-2 text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button> */}
              
              {/* Create Post Button - Only for Player, Academy, Club roles */}
              {(user?.role === 'Player' || user?.role === 'player' || 
                user?.role === 'Academy' || user?.role === 'academy' || 
                user?.role === 'Club' || user?.role === 'club') && (
                <Link to="/feed" className="p-2 text-blue-500 hover:text-emerald-500 dark:text-blue-400 dark:hover:text-emerald-400 transition-colors" title="Create Post">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              )}
              
              {/* Notifications */}
              <NotificationDropdown />
              
              {/* Messages */}
              <Link to="/messages" className="p-2 text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              
              {/* Requests */}
              <Link to="/requests" className="relative p-2 text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
                {requestsCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs">
                    {requestsCount}
                  </Badge>
                )}
              </Link>
            </div>
            
            {/* Enhanced Search Bar */}
            {showSearch && (
              <div className="absolute top-full left-0 right-0 glass-card-premium dark:glass-card-premium-dark border-b border-slate-200/50 dark:border-blue-500/30 shadow-lg z-50 backdrop-blur-xl">
                <form onSubmit={handleSearch} className="p-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                    <Input
                      id="navbar-search"
                      type="text"
                      placeholder="Search players, academies, clubs, tournaments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 glass-input dark:glass-input"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="sportsin-gradient-button">
                      Search
                    </Button>
                    <Button ˀ
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowSearch(false)}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Menu className="w-4 h-4 text-slate-700 dark:text-slate-300" />
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
                  src={user.profilePic}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-800 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-800 flex-shrink-0">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
              )}
              
              {/* User Name */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {user?.name}
                </span>
                {user?.age && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Age: {user.age}
                  </span>
                )}
              </div>
              
              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
