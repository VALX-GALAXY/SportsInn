import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Home, 
  User, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Bell, 
  Inbox,
  Search,
  Users,
  Eye,
  LogOut,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import requestService from '../api/requestService'
import { useState, useEffect } from 'react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const [requestsCount, setRequestsCount] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const { received } = requestService.list()
    setRequestsCount(received.filter(r => r.status === 'pending').length)
  }, [])

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Analytics and insights'
    },
    {
      name: 'Feed',
      href: '/feed',
      icon: Home,
      description: 'Latest posts and updates'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'Your profile and settings'
    },
    {
      name: 'Tournaments',
      href: '/tournaments',
      icon: Trophy,
      description: 'Browse tournaments'
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      description: 'Find players and organizations'
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageCircle,
      description: 'Chat with other users'
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      description: 'Stay updated',
      badge: unreadCount
    },
    {
      name: 'Requests',
      href: '/requests',
      icon: Inbox,
      description: 'Manage invitations',
      badge: requestsCount
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account preferences'
    }
  ]

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
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const handleLogout = () => {
    logout()
    onClose?.()
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'w-16' : 'w-72 sm:w-80'} 
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 
        transform transition-all duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:block
        fixed lg:relative top-0 left-0 h-full lg:h-full z-50 lg:z-auto
        min-h-screen lg:min-h-[calc(100vh-4rem)]
        sportsin-glass
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 dark:from-blue-500/20 dark:to-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                {user?.profilePicture ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} rounded-full object-cover border-2 border-white/50 dark:border-gray-600/50 shadow-lg sportsin-hover-glow`}
                  />
                ) : (
                  <div className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center border-2 border-white/50 dark:border-gray-600/50 shadow-lg sportsin-hover-glow`}>
                    <User className={`${isCollapsed ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
                  </div>
                )}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)} mt-1`}>
                      {getRoleIcon(user?.role)}
                      <span>{user?.role}</span>
                    </div>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group sportsin-interactive
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 hover:shadow-md'
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{item.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                        {item.description}
                      </span>
                    </div>
                  )}
                  {!isCollapsed && item.badge && item.badge > 0 && (
                    <Badge 
                      variant={isActive ? "secondary" : "destructive"} 
                      className={`w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : ''
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20">
            <div className="space-y-2">
              {/* Collapse Toggle - Desktop Only */}
              <div className="hidden lg:block">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-xl py-2 transition-all duration-200`}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      <span>Collapse</span>
                    </>
                  )}
                </Button>
              </div>
              
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="ghost"
                className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl py-3 transition-all duration-200 sportsin-interactive`}
                title={isCollapsed ? 'Sign Out' : undefined}
              >
                <LogOut className="w-5 h-5" />
                {!isCollapsed && <span className="ml-3">Sign Out</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
