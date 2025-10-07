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
  LogOut
} from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import requestService from '../api/requestService'
import { useState, useEffect } from 'react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const [requestsCount, setRequestsCount] = useState(0)

  useEffect(() => {
    const { received } = requestService.list()
    setRequestsCount(received.filter(r => r.status === 'pending').length)
  }, [])

  const navigationItems = [
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
      name: 'Messages',
      href: '/messages',
      icon: MessageCircle,
      description: 'Chat with other users'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Analytics and insights'
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      description: 'Find players and organizations'
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out z-50 shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center space-x-3">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white dark:border-gray-600 shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)} mt-1`}>
                  {getRoleIcon(user?.role)}
                  <span>{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 hover:shadow-md'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }`} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant={isActive ? "secondary" : "destructive"} 
                      className={`w-5 h-5 flex items-center justify-center text-xs ${
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl py-3 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
