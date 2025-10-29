import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile, 
  Paperclip,
  Loader2,
  Users,
  Clock,
  Check,
  CheckCheck,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/simple-toast'
import messageService from '../api/messageService'
import socketService from '../api/socketService'

// No mock data - using real backend data

// No mock messages - using real backend data

export default function Messages() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [deliveredIds, setDeliveredIds] = useState(new Set())
  const [readIds, setReadIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Transform backend message format to frontend format
  const transformMessage = (message) => {
    return {
      id: message._id,
      _id: message._id,
      text: message.text,
      timestamp: new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: message.senderId === user?.id,
      read: message.read,
      senderId: message.senderId,
      receiverId: message.receiverId,
      sentAt: message.sentAt
    }
  }

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        console.log('Loading conversations for user:', user.id)
        const conversationsData = await messageService.getConversations(user.id)
        console.log('Loaded conversations:', conversationsData)
        setConversations(conversationsData)
      } catch (error) {
        console.error('Error loading conversations:', error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [user?.id])


  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user?.id) return

    const initializeSocket = () => {
      try {
        socketRef.current = socketService.connect(user.id)
        
        if (socketRef.current) {
          console.log('✅ Socket.IO connected successfully')
          
          // Listen for new messages (backend emits 'message:new')
          socketService.on('message:new', (message) => {
            console.log('📨 Received message via Socket.IO:', message)
            if (selectedConversation && message.receiverId === user.id) {
              // Transform and add message to local state
              const transformedMessage = transformMessage(message)
              setMessages(prev => [...prev, transformedMessage])
              scrollToBottom()
            }
            
            // Update conversation list with new message
            setConversations(prev => 
              prev.map(conv => 
                conv.userId === message.senderId 
                  ? { ...conv, lastMessage: message.text, timestamp: new Date(message.sentAt).toLocaleTimeString() }
                  : conv
              )
            )
          })

          // Listen for typing indicators
          socketService.on('typing:start', (data) => {
            if (data.conversationId === selectedConversation?.id && data.userId !== user.id) {
              setTypingUsers(prev => new Set([...prev, data.userId]))
            }
          })

          socketService.on('typing:stop', (data) => {
            if (data.conversationId === selectedConversation?.id) {
              setTypingUsers(prev => {
                const newSet = new Set(prev)
                newSet.delete(data.userId)
                return newSet
              })
            }
          })

          // Listen for message status updates
          socketService.on('message:delivered', (data) => {
            setDeliveredIds(prev => new Set([...prev, data.messageId]))
          })

          socketService.on('message:read', (data) => {
            setReadIds(prev => new Set([...prev, data.messageId]))
          })

          // Listen for user online status
          socketService.on('user:online', (data) => {
            setConversations(prev => 
              prev.map(conv => 
                conv.userId === data.userId 
                  ? { ...conv, isOnline: true }
                  : conv
              )
            )
          })

          socketService.on('user:offline', (data) => {
            setConversations(prev => 
              prev.map(conv => 
                conv.userId === data.userId 
                  ? { ...conv, isOnline: false }
                  : conv
              )
            )
          })
        }
      } catch (error) {
        console.error('Socket connection error:', error)
        // Fallback to mock connection
        socketService.connectMock(user.id)
      }
    }

    initializeSocket()

    return () => {
      if (socketRef.current) {
        socketService.disconnect()
      }
    }
  }, [user?.id, selectedConversation?.id])

  // Load messages when conversation is selected (user-to-user messaging)
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return

      try {
        console.log('📡 Loading messages for user:', selectedConversation.userId)
        const messagesData = await messageService.getMessages(selectedConversation.userId)
        console.log('✅ Messages loaded:', messagesData)
        // Transform backend messages to frontend format
        const transformedMessages = messagesData.map(transformMessage)
        setMessages(transformedMessages)
        scrollToBottom()
      } catch (error) {
        console.error('Error loading messages:', error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        })
      }
    }

    loadMessages()
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    try {
      // Send message via API (user-to-user messaging)
      const messageData = {
        text: messageText,
        senderId: user.id
      }

      console.log('📤 Sending message:', { text: messageText, receiverId: selectedConversation.userId })
      const sentMessage = await messageService.sendMessage(selectedConversation.userId, messageData)
      console.log('✅ Message sent via API:', sentMessage)
      
      // Transform and add message to local state
      const transformedMessage = transformMessage(sentMessage)
      setMessages(prev => [...prev, transformedMessage])
      
      // Note: Backend automatically emits 'message:new' via Socket.IO
      // No need to manually emit from frontend

      // Mark as delivered
      setDeliveredIds(prev => new Set([...prev, sentMessage._id]))

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
        variant: "default"
      })

      // Simulate typing indicator from other user (for demo)
      if (selectedConversation.userId) {
        setTimeout(() => {
          setIsTyping(true)
          setTimeout(() => {
            setIsTyping(false)
            // Simulate response
            const response = {
              id: `msg_${Date.now() + 1}`,
              senderId: selectedConversation.userId,
              text: 'Thanks for your message!',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOwn: false,
              conversationId: selectedConversation.id
            }
            setMessages(prev => [...prev, response])
            
            // Mark last sent as read after delay
            setTimeout(() => {
              setReadIds(prev => new Set([...prev, sentMessage.id]))
            }, 1500)
          }, 2000)
        }, 1000)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
      // Restore message text
      setNewMessage(messageText)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle typing indicators
  const handleTyping = (e) => {
    if (selectedConversation && socketRef.current) {
      socketService.emit('typing:start', {
        conversationId: selectedConversation.id,
        userId: user.id
      })
    }
  }

  const handleTypingStop = () => {
    if (selectedConversation && socketRef.current) {
      socketService.emit('typing:stop', {
        conversationId: selectedConversation.id,
        userId: user.id
      })
    }
  }



  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get message status icon
  const getMessageStatus = (message) => {
    // For user-to-user messaging, check if message is read
    if (message.read) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />
    } else if (deliveredIds.has(message._id)) {
      return <Check className="w-3 h-3 text-gray-400" />
    } else {
      return <Check className="w-3 h-3 text-gray-400" />
    }
  }

  if (!selectedConversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card dark:glass-card-dark rounded-2xl shadow-xl"
          >
            <div className="p-6">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Messages
              </motion.h1>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Conversations List */}
              <div className="space-y-1 sm:space-y-2 p-1 sm:p-2">
                <AnimatePresence>
                  {filteredConversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="cursor-pointer glass-card dark:glass-card-dark hover:shadow-lg transition-all duration-300 border-0"
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <CardContent className="p-2 sm:p-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="relative">
                          <Avatar className="w-8 h-8 sm:w-12 sm:h-12">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {conversation.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {conversation.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-1 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {conversation.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card dark:glass-card-dark rounded-2xl shadow-xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col lg:flex-row overflow-hidden"
        >
          {/* Conversations Sidebar */}
          <div className="w-full lg:w-1/3 border-r-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      Conversations
                    </h2>
                    {/* Mobile: Show back button when conversation is selected */}
                    {selectedConversation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="hidden lg:flex"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
                  </div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You don't have any conversations yet. Start messaging with other users!
                    </p>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      <p>• Backend conversations endpoint not implemented</p>
                      <p>• Real-time messaging requires backend integration</p>
                    </div>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                    selectedConversation.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation?.profilePic} />
                        <AvatarFallback>
                          {conversation?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {conversation?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col hidden lg:flex">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>
                    {selectedConversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedConversation.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedConversation.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No messages yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Start the conversation by sending a message!
                    </p>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      <p>• Backend messaging requires valid user IDs</p>
                      <p>• Real-time messaging needs backend integration</p>
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        message.isOwn
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-end space-x-2 mt-1">
                        <p className={`text-xs ${message.isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {message.timestamp}
                        </p>
                        {message.isOwn && getMessageStatus(message)}
                      </div>
                    </motion.div>
                  </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {/* Typing indicators */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other users typing */}
              <AnimatePresence>
                {typingUsers.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          {Array.from(typingUsers).join(', ')} typing...
                        </span>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping(e)
                    }}
                    onKeyPress={handleKeyPress}
                    onBlur={handleTypingStop}
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Chat Area - Shows when conversation is selected on mobile */}
          {selectedConversation && (
            <div className="flex-1 flex flex-col lg:hidden">
              {/* Mobile Chat Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedConversation.profilePic} />
                    <AvatarFallback>
                      {selectedConversation.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedConversation?.name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedConversation?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Messages */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs sm:max-w-sm px-3 py-2 rounded-2xl ${
                      message.senderId === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-end mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {message.senderId === user.id && (
                          <span className="ml-1">
                            {getMessageStatus(message)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Mobile Message Input */}
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2">
                    <Button variant="ghost" size="sm" className="hover:bg-gray-200 dark:hover:bg-gray-600">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={handleTyping}
                      onBlur={handleTypingStop}
                      placeholder="Type a message..."
                      className="flex-1 border-0 bg-transparent focus:ring-0"
                      disabled={isSending}
                    />
                    <Button variant="ghost" size="sm" className="hover:bg-gray-200 dark:hover:bg-gray-600">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
