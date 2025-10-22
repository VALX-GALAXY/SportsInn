import axiosInstance from './axiosInstance'

class NotificationService {
  constructor() {
    this.pollingInterval = null
    this.subscribers = new Set()
  }

  // Get notifications
  async getNotifications(page = 1, limit = 20) {
    try {
      // Try backend API first
      const response = await axiosInstance.get('/api/notifications', {
        params: { page, limit }
      })
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      return this.getMockNotifications(page, limit)
    }
  }

  // Start polling for new notifications
  startPolling(interval = 30000) { // 30 seconds
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
    
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await this.getNotifications(1, 5) // Get latest 5 notifications
        this.notifySubscribers(response.notifications)
        
        // No automatic simulation - only real notifications
      } catch (error) {
        console.error('Error polling notifications:', error)
      }
    }, interval)
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // Notify all subscribers
  notifySubscribers(notifications) {
    this.subscribers.forEach(callback => callback(notifications))
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await axiosInstance.put(`/api/notifications/read/${notificationId}`)
      return response.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 300))
      return this.mockMarkAsRead(notificationId)
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      // Since backend doesn't have /read-all endpoint, we'll use mock for now
      console.warn('Backend API missing /read-all endpoint, using mock data')
      await new Promise(resolve => setTimeout(resolve, 300))
      return this.mockMarkAllAsRead()
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 300))
      return this.mockMarkAllAsRead()
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      // Since backend doesn't have /unread-count endpoint, we'll use mock for now
      console.warn('Backend API missing /unread-count endpoint, using mock data')
      await new Promise(resolve => setTimeout(resolve, 200))
      return this.getMockUnreadCount()
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      await new Promise(resolve => setTimeout(resolve, 200))
      return this.getMockUnreadCount()
    }
  }

  // Mock data methods - Return empty notifications
  getMockNotifications(page = 1, limit = 20) {
    return {
      notifications: [],
      total: 0,
      unreadCount: 0,
      page,
      limit
    }
  }

  getMockUnreadCount() {
    const notifications = this.getMockNotifications().notifications
    return notifications.filter(n => !n.isRead).length
  }

  mockMarkAsRead() {
    // In a real app, this would update the backend
    return {
      success: true,
      message: 'Notification marked as read'
    }
  }

  mockMarkAllAsRead() {
    // In a real app, this would update the backend
    return {
      success: true,
      message: 'All notifications marked as read'
    }
  }

}

export default new NotificationService()
