import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
    this.hasLoggedConnectionError = false
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    try {
      // Connect to Socket.IO server
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
      console.log('Connecting to Socket.IO server:', socketUrl)
      
      this.socket = io(socketUrl, {
        auth: {
          userId: userId
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      })

      this.socket.on('connect', () => {
        console.log(' Socket connected successfully:', this.socket.id)
        this.isConnected = true
        this.emit('user:connected', { userId })
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        // Only log the error once, not repeatedly
        if (!this.hasLoggedConnectionError) {
          console.warn(' Socket.IO server unavailable, using mock connection')
          this.hasLoggedConnectionError = true
        }
        this.isConnected = false
        
        // Immediate fallback to mock connection
        this.connectMock(userId)
      })

      // Add timeout to detect connection issues
      setTimeout(() => {
        if (!this.isConnected && !this.hasLoggedConnectionError) {
          console.log(' Socket connection timeout, using mock connection')
          this.connectMock(userId)
        }
      }, 5000)

      return this.socket
    } catch (error) {
      console.warn('Socket connection failed, using mock connection')
      return this.connectMock(userId)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
      this.listeners.set(event, callback)
    }
  }

  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event))
      this.listeners.delete(event)
    }
  }

  // Notification-specific methods
  subscribeToNotifications(userId) {
    this.emit('subscribe:notifications', { userId })
  }

  unsubscribeFromNotifications(userId) {
    this.emit('unsubscribe:notifications', { userId })
  }

  // Mock implementation for development
  connectMock(userId) {
    console.log(' Mock socket connected for user:', userId)
    this.isConnected = true
    
    // Create a mock socket object with basic functionality
    const mockSocket = {
      id: 'mock_socket_id',
      connected: true,
      emit: (event, data) => {
        console.log(`Mock emit: ${event}`, data)
      },
      on: (event, callback) => {
        console.log(`Mock listener added: ${event}`)
        this.listeners.set(event, callback)
      },
      off: (event) => {
        console.log(` Mock listener removed: ${event}`)
        this.listeners.delete(event)
      },
      disconnect: () => {
        console.log(' Mock socket disconnected')
        this.isConnected = false
      }
    }
    
    this.socket = mockSocket
    return mockSocket
  }

  getNotificationIcon(type) {
    const icons = {
      'tournament': '🏆',
      'like': '❤️',
      'follow': '👥',
      'comment': '💬',
      'scout': '👁️',
      'academy': '🎓',
      'club': '🤝'
    }
    return icons[type] || '🔔'
  }

  simulateNotification(type, notification) {
    if (this.listeners.has('notification')) {
      this.listeners.get('notification')(notification)
    }
  }

  // Mock: simulate a post created event
  simulatePostCreated(post) {
    if (this.listeners.has('post:created')) {
      this.listeners.get('post:created')(post)
    }
  }
}

export default new SocketService()
