import axiosInstance from './axiosInstance'

class MessageService {
  // Get conversations for a user
  async getConversations(userId) {
    try {
      const response = await axiosInstance.get(`/api/messages/conversations/${userId}`)
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable:', error.message)
      return []
    }
  }

  // Get messages for a conversation (user-to-user messaging)
  async getMessages(otherUserId, page = 1, limit = 50) {
    try {
      console.log('📡 Fetching messages from backend for user:', otherUserId)
      
      const response = await axiosInstance.get(`/api/messages/${otherUserId}`, {
        params: { page, limit }
      })
      console.log('✅ Backend messages loaded:', response.data.data)
      return response.data.data || []
    } catch (error) {
      console.warn('⚠️ Backend API unavailable:', error.message)
      console.log('📭 No messages available')
      return []
    }
  }

  // Send a message (user-to-user messaging)
  async sendMessage(receiverId, messageData) {
    try {
      console.log('📤 Sending message to backend:', { receiverId, messageData })
      
      const response = await axiosInstance.post(`/api/messages`, {
        receiverId: receiverId,
        text: messageData.text
      })
      console.log('✅ Message sent via backend:', response.data.data)
      return response.data.data
    } catch (error) {
      console.warn('⚠️ Backend API unavailable:', error.message)
      console.log('❌ Failed to send message')
      throw error
    }
  }

  // Create a new conversation
  async createConversation(participantIds) {
    try {
      const response = await axiosInstance.post('/api/messages/conversations', {
        participants: participantIds
      })
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockConversation = {
        id: `conv_${Date.now()}`,
        participants: participantIds,
        createdAt: new Date().toISOString(),
        lastMessage: null
      }
      
      return mockConversation
    }
  }

  // Mark message as read (user-to-user messaging)
  async markAsRead(messageId) {
    try {
      console.log('📤 Marking message as read:', messageId)
      const response = await axiosInstance.put(`/api/messages/read/${messageId}`)
      console.log('✅ Message marked as read:', response.data.data)
      return response.data.data
    } catch (error) {
      console.warn('⚠️ Backend API unavailable, using mock data:', error.message)
      console.log('🔄 Falling back to mock mark as read for development')
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { success: true, messageId }
    }
  }

  // Get unread message count
  async getUnreadCount(userId) {
    try {
      const response = await axiosInstance.get(`/api/messages/unread/${userId}`)
      return response.data.data || { count: 0 }
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { count: 3 } // Mock unread count
    }
  }

  // Search conversations
  async searchConversations(userId, query) {
    try {
      const response = await axiosInstance.get(`/api/messages/search/${userId}`, {
        params: { q: query }
      })
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const mockConversations = [
        {
          id: 'conv_1',
          name: 'Suraj',
          avatar: null,
          lastMessage: 'Hey, how was the game yesterday?',
          timestamp: '2 min ago',
          unreadCount: 2,
          isOnline: true,
          role: 'Player'
        }
      ]
      
      return mockConversations.filter(conv => 
        conv.name.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await axiosInstance.delete(`/api/messages/message/${messageId}`)
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return { success: true, messageId }
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      const response = await axiosInstance.delete(`/api/messages/conversations/${conversationId}`)
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 200))
      
      return { success: true, conversationId }
    }
  }

}

export default new MessageService()
