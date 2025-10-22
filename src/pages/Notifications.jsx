import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  ThumbsUp, 
  Share2,
  Loader2,
  Check,
  X,
  MoreHorizontal,
  Trophy,
  Eye,
  GraduationCap,
  Handshake,
  RefreshCw,
  Clock
} from 'lucide-react'
import { useToast } from '../components/ui/simple-toast'
import { NotificationsSkeleton } from '../components/SkeletonLoaders'
import { useNotifications } from '../contexts/NotificationContext'
import notificationService from '../api/notificationService'


export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'likes', 'follows', 'comments'
  const { toast } = useToast()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      // Notifications are already loaded by the context
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast({
        title: "Failed to load notifications",
        description: "Unable to fetch notifications",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshNotifications = async () => {
    try {
      setIsRefreshing(true)
      // Trigger a fresh load of notifications
      await notificationService.getNotifications(1, 50)
      toast({
        title: "Notifications refreshed",
        description: "Latest notifications loaded",
        variant: "default"
      })
    } catch (error) {
      console.error('Error refreshing notifications:', error)
      toast({
        title: "Failed to refresh",
        description: "Unable to refresh notifications",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
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
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const deleteNotification = (notificationId) => {
    // In a real app, this would call the API to delete the notification
    toast({
      title: "Notification deleted",
      description: "Notification removed",
      variant: "default"
    })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'share':
        return <Share2 className="w-5 h-5 text-purple-500" />
      case 'tournament':
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 'scout':
        return <Eye className="w-5 h-5 text-purple-500" />
      case 'academy':
        return <GraduationCap className="w-5 h-5 text-indigo-500" />
      case 'club':
        return <Handshake className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Player':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Academy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Club':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Scout':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'likes':
        return notification.type === 'like'
      case 'follows':
        return notification.type === 'follow'
      case 'comments':
        return notification.type === 'comment'
      default:
        return true
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-4xl mx-auto px-3 py-4 sm:px-6 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 sm:text-2xl lg:text-3xl">
              Notifications
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm lg:text-base">
              Stay updated with your activity
            </p>
          </div>
          <NotificationsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl mx-auto px-3 py-4 sm:px-6 sm:py-8">
        {/* Header with Sporty Design */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-1 sm:text-2xl lg:text-3xl">
                  Notifications
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm lg:text-base font-medium">
                  Stay updated with your activity
                </p>
              </motion.div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm">
                  {unreadCount} unread
                </Badge>
              )}
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={refreshNotifications}
                    variant="outline"
                    size="sm"
                    disabled={isRefreshing}
                    className="flex items-center space-x-2 text-xs sm:text-sm bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 font-medium"
                  >
                    <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </motion.div>
                {unreadCount > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={markAllAsRead}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl font-medium"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Mark all read</span>
                      <span className="sm:hidden">Mark all</span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs with Sporty Design */}
          <div className="flex overflow-x-auto space-x-2 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-2 scrollbar-hide border border-blue-100 dark:border-gray-600">
            {[
              { key: 'all', label: 'All', count: notifications.length, color: 'from-blue-500 to-blue-600' },
              { key: 'unread', label: 'Unread', count: unreadCount, color: 'from-red-500 to-red-600' },
              { key: 'likes', label: 'Likes', count: notifications.filter(n => n.type === 'like').length, color: 'from-pink-500 to-pink-600' },
              { key: 'follows', label: 'Follows', count: notifications.filter(n => n.type === 'follow').length, color: 'from-green-500 to-green-600' },
              { key: 'comments', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length, color: 'from-purple-500 to-purple-600' }
            ].map(({ key, label, count, color }) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={filter === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(key)}
                  className={`flex items-center space-x-2 transition-all duration-300 whitespace-nowrap text-xs sm:text-sm font-medium ${
                    filter === key 
                      ? `bg-gradient-to-r ${color} text-white shadow-lg hover:shadow-xl transform scale-105` 
                      : 'hover:bg-white/80 dark:hover:bg-gray-600/80 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="hidden sm:inline font-semibold">{label}</span>
                  <span className="sm:hidden font-bold">{label.charAt(0)}</span>
                  {count > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Badge 
                        variant={filter === key ? "secondary" : "default"} 
                        className={`ml-1 px-2 py-1 text-xs font-bold ${
                          filter === key 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                        }`}
                      >
                        {count}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div 
            className="space-y-2 sm:space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    delay: index * 0.05 
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card 
                    className={`bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl ${
                      !notification.isRead 
                        ? 'ring-2 ring-blue-400/50 dark:ring-blue-500/50 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20' 
                        : 'hover:from-blue-50/50 hover:to-green-50/50 dark:hover:from-blue-900/10 dark:hover:to-green-900/10'
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {/* Notification Icon with Sporty Background */}
                        <motion.div 
                          className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {getNotificationIcon(notification.type)}
                        </motion.div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <motion.div 
                                className="flex items-center space-x-2 mb-1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 + 0.1 }}
                              >
                                <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {notification.title}
                                </h3>
                                <AnimatePresence>
                                  {!notification.isRead && (
                                    <motion.div 
                                      className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                  )}
                                </AnimatePresence>
                              </motion.div>
                              
                              <motion.p 
                                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 + 0.15 }}
                              >
                                {notification.message}
                              </motion.p>

                              {/* Comment Preview with Animation */}
                              {notification.comment && (
                                <motion.div 
                                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mt-2"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 + 0.2 }}
                                >
                                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic">
                                    "{notification.comment.text}"
                                  </p>
                                </motion.div>
                              )}

                              {/* Post Preview with Animation */}
                              {notification.post && (
                                <motion.div 
                                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mt-2"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 + 0.2 }}
                                >
                                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                    {notification.post.preview}
                                  </p>
                                </motion.div>
                              )}

                              <motion.div 
                                className="flex items-center space-x-1 mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 + 0.25 }}
                              >
                                <Clock className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </motion.div>
                            </div>

                            {/* Actions with Animation */}
                            <motion.div 
                              className="flex items-center space-x-1 sm:space-x-2 self-end sm:self-start"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + 0.3 }}
                            >
                              {!notification.isRead && (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 sm:p-2"
                                  >
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                </motion.div>
                              )}
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 sm:p-2"
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </motion.div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
