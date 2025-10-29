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
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications(1, 20)
      console.log('NotificationContext - API response:', response)
      setNotifications(response.notifications || [])
      setUnreadCount(response.unreadCount || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to localStorage
      const savedNotifications = localStorage.getItem(`notifications_${user.id}`)
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        console.log('NotificationContext - Using saved notifications:', parsed)
        setNotifications(parsed)
        setUnreadCount(parsed.filter(n => !n.isRead).length)
      } else {
        // If no saved notifications, use mock data directly
        const mockResponse = notificationService.getMockNotifications(1, 20)
        console.log('NotificationContext - Using mock data:', mockResponse)
        setNotifications(mockResponse.notifications || [])
        setUnreadCount(mockResponse.unreadCount || 0)
      }
    }
  }

  // Enhanced connection with retry logic
  const connectWithRetry = async (maxAttempts = 5) => {
    if (connectionAttempts >= maxAttempts) {
      console.warn('Max connection attempts reached, using offline mode')
      setIsReconnecting(false)
      return
    }

    try {
      setIsReconnecting(true)
      setConnectionAttempts(prev => prev + 1)
      
      // Try to connect to socket
      const socket = socketService.connectMock(user.id)
      if (socket) {
        setIsConnected(true)
        setIsReconnecting(false)
        setConnectionAttempts(0)
        
        // Show success toast
        toast({
          title: "Connected",
          description: "Real-time notifications enabled",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Socket connection failed:', error)
      
      // Retry after delay
      setTimeout(() => {
        connectWithRetry(maxAttempts)
      }, Math.min(1000 * Math.pow(2, connectionAttempts), 10000)) // Exponential backoff, max 10s
    }
  }

  useEffect(() => {
    if (user?.id) {
      // Connect to socket with retry logic
      connectWithRetry()

      // Subscribe to notifications
      socketService.subscribeToNotifications(user.id)

      // Enhanced notification listener with better error handling
      const handleNotification = (notification) => {
        console.log('Received notification:', notification)
        
        // Add notification with animation trigger
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          if (!existingIds.has(notification.id)) {
            return [notification, ...prev]
          }
          return prev
        })
        
        setUnreadCount(prev => prev + 1)
        
        // Show enhanced toast notification
        toast({
          title: notification.title,
          description: notification.message,
          variant: "default",
          duration: 5000
        })
      }

      // Listen for notifications
      socketService.on('notification', handleNotification)

      // Listen for connection errors
      socketService.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
        setIsConnected(false)
        setIsReconnecting(true)
        
        // Don't show error toast immediately, let the socket service handle fallback
        console.log('🔄 Socket service will handle fallback to mock connection')
        
        // Attempt reconnection after a delay
        setTimeout(() => {
          if (!socketService.isConnected) {
            console.log('🔄 Attempting reconnection...')
            connectWithRetry()
          }
        }, 2000)
      })

      // Listen for disconnection
      socketService.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          toast({
            title: "Disconnected",
            description: "Server disconnected the connection",
            variant: "destructive"
          })
        } else {
          // Client disconnect, attempt reconnection
          setIsReconnecting(true)
          setTimeout(() => {
            connectWithRetry()
          }, 2000)
        }
      })

      // Load notifications from service
      loadNotifications()

      // Start polling for new notifications with enhanced error handling
      notificationService.startPolling(10000) // 10 seconds for more responsive updates

      // Subscribe to polling updates with better error handling
      const unsubscribe = notificationService.subscribe((newNotifications) => {
        if (newNotifications && newNotifications.length > 0) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id))
            const newNotifs = newNotifications.filter(n => !existingIds.has(n.id))
            if (newNotifs.length > 0) {
              setUnreadCount(prev => prev + newNotifs.length)
              
              // Show toast for new notifications with staggered timing
              newNotifs.forEach((notif, index) => {
                setTimeout(() => {
                  toast({
                    title: notif.title,
                    description: notif.message,
                    variant: "default",
                    duration: 4000
                  })
                }, index * 200) // Stagger notifications by 200ms
              })
              
              return [...newNotifs, ...prev]
            }
            return prev
          })
        }
      })

      return () => {
        unsubscribe()
        notificationService.stopPolling()
        socketService.unsubscribeFromNotifications(user.id)
        socketService.disconnect()
        setIsConnected(false)
        setIsReconnecting(false)
        setConnectionAttempts(0)
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
    isReconnecting,
    connectionAttempts,
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
