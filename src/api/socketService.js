import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return this.socket
    }

    try {
      // Connect to Socket.IO server
      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
        auth: {
          userId: userId
        },
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id)
        this.isConnected = true
        this.emit('user:connected', { userId })
      })

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected')
        this.isConnected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        this.isConnected = false
      })

      return this.socket
    } catch (error) {
      console.error('Failed to connect to socket:', error)
      return null
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
    console.log('Mock socket connected for user:', userId)
    this.isConnected = true
    
    return {
      id: 'mock_socket_id',
      connected: true
    }
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
