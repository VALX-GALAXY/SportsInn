import { useState, useEffect } from 'react'
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
  Handshake
} from 'lucide-react'
import { useToast } from '../components/ui/simple-toast'
import { NotificationsSkeleton } from '../components/SkeletonLoaders'
import { useNotifications } from '../contexts/NotificationContext'
import notificationService from '../api/notificationService'

// Dummy notifications data
const dummyNotifications = [
  {
    id: 1,
    type: 'like',
    title: 'New Like',
    message: 'Suraj Kumar liked your post about training session',
    timestamp: '2 minutes ago',
    read: false,
    user: {
      name: 'Suraj Kumar',
      avatar: 'https://i.pravatar.cc/150?img=66',
      role: 'Player'
    },
    post: {
      id: 1,
      preview: 'Just finished an amazing training session!'
    }
  },
  {
    id: 2,
    type: 'follow',
    title: 'New Follower',
    message: 'Alex Johnson started following you',
    timestamp: '1 hour ago',
    read: false,
    user: {
      name: 'Trisha Yadav',
      avatar: 'https://i.pravatar.cc/150?img=32',
      role: 'Academy'
    }
  },
  {
    id: 3,
    type: 'comment',
    title: 'New Comment',
    message: 'Nidhi commented on your post',
    timestamp: '3 hours ago',
    read: true,
    user: {
      name: 'Nidhi',
      avatar: 'https://i.pravatar.cc/150?img=45',
      role: 'Club'
    },
    post: {
      id: 2,
      preview: 'Great match yesterday!'
    },
    comment: {
      text: 'Amazing performance! Keep it up!'
    }
  },
  {
    id: 4,
    type: 'share',
    title: 'Post Shared',
    message: 'Priyanshu shared your post',
    timestamp: '5 hours ago',
    read: true,
    user: {
      name: 'Shanky',
      avatar: 'https://i.pravatar.cc/150?img=78',
      role: 'Scout'
    },
    post: {
      id: 3,
      preview: 'Looking for talented players...'
    }
  },
  {
    id: 5,
    type: 'follow',
    title: 'New Follower',
    message: 'Shruti started following you',
    timestamp: '1 day ago',
    read: true,
    user: {
      name: 'Rashmi',
      avatar: 'https://i.pravatar.cc/150?img=23',
      role: 'Player'
    }
  }
]

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
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
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 sm:text-2xl lg:text-3xl">
                Notifications
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm lg:text-base">
                Stay updated with your activity
              </p>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Badge variant="destructive" className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm">
                  {unreadCount} unread
                </Badge>
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 text-xs sm:text-sm w-full sm:w-auto"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">Mark all</span>
                </Button>
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 scrollbar-hide">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'likes', label: 'Likes', count: notifications.filter(n => n.type === 'like').length },
              { key: 'follows', label: 'Follows', count: notifications.filter(n => n.type === 'follow').length },
              { key: 'comments', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(key)}
                className={`flex items-center space-x-1 sm:space-x-2 transition-all duration-200 whitespace-nowrap text-xs sm:text-sm ${
                  filter === key 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.charAt(0)}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {count}
                  </Badge>
                )}
              </Button>
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
          <div className="space-y-2 sm:space-y-3">
            {filteredNotifications.map((notification) => (
                <Card 
                key={notification.id} 
                className={`bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200 ${
                  !notification.isRead ? 'ring-2 ring-blue-100 dark:ring-blue-900' : ''
                }`}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                            {notification.message}
                          </p>

                          {/* Comment Preview */}
                          {notification.comment && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mt-2">
                              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 italic">
                                "{notification.comment.text}"
                              </p>
                            </div>
                          )}

                          {/* Post Preview */}
                          {notification.post && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mt-2">
                              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                {notification.post.preview}
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 sm:space-x-2 self-end sm:self-start">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 sm:p-2"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 sm:p-2"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
