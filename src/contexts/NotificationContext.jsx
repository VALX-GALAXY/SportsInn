import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import socketService from '../api/socketService'
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

  useEffect(() => {
    if (user?.id) {
      // Connect to socket
      const socket = socketService.connectMock(user.id)
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

      // Load existing notifications from localStorage
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`)
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
        setUnreadCount(parsed.filter(n => !n.read).length)
      }
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

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setUnreadCount(0)
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
