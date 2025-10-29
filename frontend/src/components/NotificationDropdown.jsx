import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  const { notifications, unreadCount, isConnected, isReconnecting, markAsRead, markAllAsRead } = useNotifications()
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
      {/* Bell Icon with Animation */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBellClick}
          onContextMenu={handleBellRightClick}
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Click to view notifications, right-click to go to notifications page"
        >
          <motion.div
            animate={unreadCount > 0 ? { 
              rotate: [0, -10, 10, -10, 10, 0],
              transition: { duration: 0.5 }
            } : {}}
          >
            <Bell className="w-5 h-5" />
          </motion.div>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs p-0"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Dropdown with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-4 top-20 w-80 max-w-[calc(100vw-2rem)] bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 rounded-xl shadow-2xl border border-blue-200/50 dark:border-blue-700/50 z-[9999] max-h-96 overflow-hidden backdrop-blur-sm"
          >
          {/* Header with Sporty Design */}
          <div className="p-4 border-b border-blue-200/30 dark:border-blue-700/30 bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-900/20 dark:to-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent truncate">
                  Notifications ({notifications.length})
                </h3>
                {/* Connection Status Indicator */}
                <motion.div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 
                    isReconnecting ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  animate={isReconnecting ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  title={
                    isConnected ? 'Connected' : 
                    isReconnecting ? 'Reconnecting...' : 'Disconnected'
                  }
                />
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {unreadCount > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-md hover:shadow-lg px-2 py-1 font-medium"
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  </motion.div>
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
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center"
              >
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              </motion.div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {notifications.slice(0, 10).map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 50, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -50, scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        delay: index * 0.05 
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 ${
                        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: "rgba(59, 130, 246, 0.05)"
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <motion.div 
                          className="flex-shrink-0 mt-1"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <motion.p 
                                className="text-sm font-medium text-gray-900 dark:text-white"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 + 0.1 }}
                              >
                                {notification.title}
                              </motion.p>
                              <motion.p 
                                className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 + 0.15 }}
                              >
                                {notification.message}
                              </motion.p>
                              <motion.p 
                                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 + 0.2 }}
                              >
                                {formatTimeAgo(notification.createdAt)}
                              </motion.p>
                            </div>
                            <AnimatePresence>
                              {!notification.isRead && (
                                <motion.div 
                                  className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer with Sporty Design */}
          <motion.div 
            className="p-4 border-t border-blue-200/30 dark:border-blue-700/30 bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-900/20 dark:to-green-900/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white border-0 shadow-lg hover:shadow-xl font-medium"
                onClick={() => {
                  setIsOpen(false)
                  navigate('/notifications')
                }}
              >
                View all notifications
              </Button>
            </motion.div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
