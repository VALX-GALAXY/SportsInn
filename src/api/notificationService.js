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
        
        // Simulate new notifications occasionally
        if (Math.random() < 0.3) { // 30% chance of new notification
          this.simulateNewNotification()
        }
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

  // Mock data methods
  getMockNotifications(page = 1, limit = 20) {
    const mockNotifications = [
      {
        id: 'notif_1',
        type: 'tournament',
        title: 'New Tournament Posted',
        message: 'Summer Football Championship 2024 is now open for registration!',
        data: {
          tournamentId: 'tournament_1',
          tournamentTitle: 'Summer Football Championship 2024'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        icon: '🏆'
      },
      {
        id: 'notif_2',
        type: 'follow',
        title: 'New Follower',
        message: 'You have been followed by a scout',
        data: {
          followerId: 'user_3',
          followerName: 'Trisha',
          followerRole: 'Scout'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        icon: '👥'
      },
      {
        id: 'notif_3',
        type: 'like',
        title: 'Post Liked',
        message: 'Your post got 10 likes',
        data: {
          postId: 'post_1',
          likeCount: 10
        },
        isRead: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        icon: '❤️'
      },
      {
        id: 'notif_4',
        type: 'comment',
        title: 'New Comment',
        message: 'Suraj Kumar commented on your post',
        data: {
          postId: 'post_1',
          commenterId: 'user_1',
          commenterName: 'Suraj Kumar'
        },
        isRead: true,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        icon: '💬'
      },
      {
        id: 'notif_5',
        type: 'tournament',
        title: 'Tournament Application Approved',
        message: 'Your application for Basketball Street Tournament has been approved!',
        data: {
          tournamentId: 'tournament_3',
          tournamentTitle: 'Basketball Street Tournament'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        icon: '✅'
      },
      {
        id: 'notif_6',
        type: 'scout',
        title: 'Scout Interest',
        message: 'A scout has shown interest in your profile',
        data: {
          scoutId: 'user_3',
          scoutName: 'Trisha'
        },
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        icon: '👁️'
      },
      {
        id: 'notif_7',
        type: 'academy',
        title: 'Academy Invitation',
        message: 'Delhi Cricket Academy has invited you to join their program',
        data: {
          academyId: 'org_2',
          academyName: 'Delhi Cricket Academy'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        icon: '🎓'
      },
      {
        id: 'notif_8',
        type: 'club',
        title: 'Club Partnership',
        message: 'Mumbai Sports Club wants to partner with your academy',
        data: {
          clubId: 'org_1',
          clubName: 'Mumbai Sports Club'
        },
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        icon: '🤝'
      }
    ]

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = mockNotifications.slice(startIndex, endIndex)

    return {
      notifications: paginatedNotifications,
      total: mockNotifications.length,
      unreadCount: mockNotifications.filter(n => !n.isRead).length,
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

  // Simulate new notification for polling
  simulateNewNotification() {
    const notificationTypes = [
      {
        type: 'tournament',
        title: 'Tournament Update',
        message: 'You were selected for XYZ Tournament!',
        icon: '🏆'
      },
      {
        type: 'like',
        title: 'Post Liked',
        message: 'Your recent post received 5 new likes',
        icon: '❤️'
      },
      {
        type: 'follow',
        title: 'New Follower',
        message: 'A scout started following your profile',
        icon: '👥'
      },
      {
        type: 'comment',
        title: 'New Comment',
        message: 'Someone commented on your post',
        icon: '💬'
      },
      {
        type: 'scout',
        title: 'Scout Interest',
        message: 'A talent scout has shown interest in your profile',
        icon: '👁️'
      },
      {
        type: 'academy',
        title: 'Academy Invitation',
        message: 'You have been invited to join a sports academy',
        icon: '🎓'
      }
    ]

    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: randomType.type,
      title: randomType.title,
      message: randomType.message,
      data: {
        timestamp: new Date().toISOString()
      },
      isRead: false,
      createdAt: new Date().toISOString(),
      icon: randomType.icon
    }

    // Notify subscribers with the new notification
    this.notifySubscribers([newNotification])
    
    return newNotification
  }
}

export default new NotificationService()
