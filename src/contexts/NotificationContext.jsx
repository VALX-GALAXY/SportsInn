import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import socketService from '../api/socketService'
import notificationService from '../api/notificationService'
import { useToast } from '../components/ui/simple-toast'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications(1, 20)
      setNotifications(response.notifications || [])
      setUnreadCount(response.unreadCount || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to localStorage
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`)
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
        setUnreadCount(parsed.filter(n => !n.read).length)
      }
    }
  }

  useEffect(() => {
    if (user?.id) {
      // Connect to socket
      socketService.connectMock(user.id)
      setIsConnected(true)

      // Subscribe to notifications
      socketService.subscribeToNotifications(user.id)

      // Listen for notifications
      socketService.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Show toast notification
        toast({
          title: "New Notification",
          description: notification.message,
          variant: "default"
        })
      })

      // Load notifications from service
      loadNotifications()
    }

    return () => {
      if (user?.id) {
        socketService.unsubscribeFromNotifications(user.id)
        socketService.disconnect()
        setIsConnected(false)
      }
    }
  }, [user?.id, toast])

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user?.id && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications))
    }
  }, [notifications, user?.id])

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Fallback to local update
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      // Fallback to local update
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      setUnreadCount(0)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
    if (user?.id) {
      localStorage.removeItem(`notifications_${user.id}`)
    }
  }

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
