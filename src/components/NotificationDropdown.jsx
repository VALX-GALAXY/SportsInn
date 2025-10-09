import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  Trophy,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Handshake,
  GraduationCap
} from 'lucide-react'

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tournament':
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 'follow':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-green-500" />
      case 'scout':
        return <Eye className="w-4 h-4 text-purple-500" />
      case 'academy':
        return <GraduationCap className="w-4 h-4 text-indigo-500" />
      case 'club':
        return <Handshake className="w-4 h-4 text-orange-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    setIsOpen(false)
  }

  const handleBellClick = (event) => {
    // Single click - toggle dropdown
    setIsOpen(!isOpen)
  }

  const handleBellRightClick = (event) => {
    event.preventDefault()
    // Right click - navigate to notifications page
    navigate('/notifications')
  }



  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        onContextMenu={handleBellRightClick}
        className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Click to view notifications, right-click to go to notifications page"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed right-4 top-20 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">Notifications ({notifications.length})</h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => {
                setIsOpen(false)
                navigate('/notifications')
              }}
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
