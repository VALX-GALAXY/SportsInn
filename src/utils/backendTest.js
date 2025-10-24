// Backend Integration Test Utility
// This utility helps test the real backend messaging functionality

export const testBackendIntegration = {
  // Test backend message API
  testMessageAPI: async (messageService, receiverId, messageData) => {
    console.log('🧪 Testing backend message API...')
    
    try {
      const result = await messageService.sendMessage(receiverId, messageData)
      console.log('✅ Backend message API test passed:', result)
      return true
    } catch (error) {
      console.log('❌ Backend message API test failed:', error)
      return false
    }
  },

  // Test backend conversation API
  testConversationAPI: async (messageService, otherUserId) => {
    console.log('🧪 Testing backend conversation API...')
    
    try {
      const result = await messageService.getMessages(otherUserId)
      console.log('✅ Backend conversation API test passed:', result.length, 'messages')
      return true
    } catch (error) {
      console.log('❌ Backend conversation API test failed:', error)
      return false
    }
  },

  // Test Socket.IO connection
  testSocketConnection: (socketService, userId) => {
    console.log('🧪 Testing Socket.IO connection...')
    
    try {
      const socket = socketService.connect(userId)
      if (socket) {
        console.log('✅ Socket.IO connection test passed')
        return true
      } else {
        console.log('❌ Socket.IO connection test failed')
        return false
      }
    } catch (error) {
      console.log('❌ Socket.IO connection test error:', error)
      return false
    }
  },

  // Test database functionality
  testDatabase: async (messageService) => {
    console.log('🧪 Testing database functionality...')
    
    try {
      const result = await messageService.testDatabase()
      console.log('✅ Database test passed:', result)
      return result.success || false
    } catch (error) {
      console.log('❌ Database test failed:', error)
      return false
    }
  },

  // Get database statistics
  getDatabaseStats: async (messageService) => {
    console.log('🧪 Getting database statistics...')
    
    try {
      const result = await messageService.getDatabaseStats()
      console.log('✅ Database stats retrieved:', result)
      return result.success || false
    } catch (error) {
      console.log('❌ Database stats failed:', error)
      return false
    }
  },

  // Run all backend tests
  runBackendTests: async (socketService, messageService, userId) => {
    console.log('🚀 Running backend integration tests...')
    
    const results = {
      socketConnection: false,
      conversationAPI: false,
      messageAPI: false,
      database: false,
      databaseStats: false
    }
    
    // Test 1: Socket Connection
    results.socketConnection = testBackendIntegration.testSocketConnection(socketService, userId)
    
    // Test 2: Conversation API
    results.conversationAPI = await testBackendIntegration.testConversationAPI(messageService, 'test_user')
    
    // Test 3: Message API
    const testMessageData = {
      text: 'Test message from backend integration test',
      senderId: userId
    }
    results.messageAPI = await testBackendIntegration.testMessageAPI(messageService, 'test_receiver', testMessageData)
    
    // Test 4: Database functionality
    results.database = await testBackendIntegration.testDatabase(messageService)
    
    // Test 5: Database statistics
    results.databaseStats = await testBackendIntegration.getDatabaseStats(messageService)
    
    // Summary
    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length
    
    console.log('📊 Backend Test Results Summary:')
    console.log(`✅ Passed: ${passedTests}/${totalTests}`)
    console.log('📋 Detailed Results:', results)
    
    if (passedTests === totalTests) {
      console.log('🎉 All backend tests passed! Real-time messaging and database storage are working correctly.')
    } else {
      console.log('⚠️ Some backend tests failed. Check the logs above for details.')
    }
    
    return results
  }
}

export default testBackendIntegration
