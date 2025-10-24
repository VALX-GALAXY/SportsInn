import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Heart, MessageCircle, Share, MoreHorizontal, Loader2, Plus, Users, Globe, Send, ChevronDown, ChevronUp, Image, Video, X, Upload, Flag, Filter, AlertTriangle, CheckCircle } from 'lucide-react'
import reportService from '../api/reportService'
import feedService from '../api/feedService'
import socketService from '../api/socketService'
import { useToast } from '../components/ui/simple-toast'
import { FeedSkeleton } from '../components/SkeletonLoaders'
import { useAuth } from '../contexts/AuthContext'
import ReportConfirmationModal from '../components/ReportConfirmationModal'

export default function FeedSimple() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isLiking, setIsLiking] = useState(new Set())
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [feedType, setFeedType] = useState('global') // 'global' or 'personalized'
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPost, setNewPost] = useState({
    caption: '',
    image: null,
    video: null,
    fileType: null, // 'image' or 'video'
    imagePreview: null,
    videoPreview: null
  })
  const { toast } = useToast()
  const [reportingPostId, setReportingPostId] = useState(null)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDetails, setReportDetails] = useState('')
  const [isReporting, setIsReporting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReasons, setReportReasons] = useState([])
  const [hasReported, setHasReported] = useState(false)
  const [reportingPost, setReportingPost] = useState(null)
  
  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const observerRef = useRef()
  const lastPostRef = useRef()
  
  // Filter state
  const [filters, setFilters] = useState({
    role: 'all', // 'all', 'Player', 'Academy', 'Club', 'Scout'
    postType: 'all' // 'all', 'image', 'video', 'text'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchFeed(true) // Reset feed
  }, [feedType, filters])

  // Load report reasons on mount
  useEffect(() => {
    const loadReportReasons = async () => {
      try {
        const reasons = await reportService.getReportReasons('post')
        setReportReasons(reasons)
      } catch (error) {
        console.error('Error loading report reasons:', error)
      }
    }
    loadReportReasons()
  }, [])

  // Real-time updates via mock socket
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return
    // Use mock connection
    socketService.connectMock(user.id)
    const onNewPost = (post) => {
      setPosts(prev => [post, ...prev])
    }
    socketService.on('post:created', onNewPost)
    return () => {
      socketService.off('post:created')
    }
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.1 }
    )

    if (lastPostRef.current) {
      observer.observe(lastPostRef.current)
    }

    return () => {
      if (lastPostRef.current) {
        observer.unobserve(lastPostRef.current)
      }
    }
  }, [isLoading, isLoadingMore, hasMore])

  const fetchFeed = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true)
        setCurrentPage(1)
        setHasMore(true)
      } else {
        setIsLoadingMore(true)
      }
      
      const response = feedType === 'global' 
        ? await feedService.getFeed(reset ? 1 : currentPage)
        : await feedService.getPersonalizedFeed(reset ? 1 : currentPage)
      
      const newPosts = response.posts || []
      
      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      // Check if there are more posts
      setHasMore(newPosts.length >= 10) // Assuming 10 posts per page
      
      if (!reset) {
        setCurrentPage(prev => prev + 1)
      }
      
      // Initialize liked posts
      const liked = new Set()
      newPosts.forEach(post => {
        if (post.liked) {
          liked.add(post.id)
        }
      })
      setLikedPosts(prev => new Set([...prev, ...liked]))
    } catch (error) {
      console.error('Error fetching feed:', error)
      toast({
        title: "Error",
        description: "Failed to load feed",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const loadMorePosts = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchFeed(false)
    }
  }, [isLoadingMore, hasMore, currentPage, feedType, filters])

  // Filter posts based on current filters
  const filteredPosts = posts.filter(post => {
    const roleMatch = filters.role === 'all' || post.author.role === filters.role
    const typeMatch = filters.postType === 'all' || 
      (filters.postType === 'image' && post.image) ||
      (filters.postType === 'video' && post.video) ||
      (filters.postType === 'text' && !post.image && !post.video)
    
    return roleMatch && typeMatch
  })

  const handleLike = async (postId) => {
    try {
      setIsLiking(prev => new Set([...prev, postId]))
      
      const updatedPost = await feedService.likePost(postId)
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? updatedPost : post
      ))
      
      setLikedPosts(prev => {
        const newSet = new Set(prev)
        if (updatedPost.liked) {
          newSet.add(postId)
        } else {
          newSet.delete(postId)
        }
        return newSet
      })
    } catch (error) {
      console.error('Error liking post:', error)
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      })
    } finally {
      setIsLiking(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  const toggleComments = async (postId) => {
    const isExpanded = expandedComments.has(postId)
    
    if (isExpanded) {
      setExpandedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    } else {
      setExpandedComments(prev => new Set([...prev, postId]))
      
      // Load comments if not already loaded
      if (!comments[postId]) {
        await loadComments(postId)
      }
    }
  }

  const loadComments = async (postId) => {
    try {
      const commentsData = await feedService.getComments(postId)
      setComments(prev => ({
        ...prev,
        [postId]: commentsData
      }))
    } catch (error) {
      console.error('Error loading comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      })
    }
  }

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return

    try {
      setIsCommenting(prev => new Set([...prev, postId]))
      
      const commentData = {
        text: newComment.trim()
      }
      
      const newCommentData = await feedService.addComment(postId, commentData)
      
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentData]
      }))
      
      setNewComment('')
      
      // Update post comment count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, stats: { ...post.stats, comments: post.stats.comments + 1 } }
          : post
      ))
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setIsCommenting(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.caption.trim()) {
      toast({
        title: "Error",
        description: "Please enter a caption",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreating(true)
      
      const postData = {
        caption: newPost.caption,
        image: newPost.image,
        video: newPost.video,
        fileType: newPost.fileType
      }
      
      console.log('Post data being sent:', postData)
      console.log('Image type:', typeof postData.image, postData.image instanceof File)
      console.log('Video type:', typeof postData.video, postData.video instanceof File)
      
      const createdPost = await feedService.createPost(postData)
      
      setPosts(prev => [createdPost, ...prev])
      // Broadcast via mock socket so other tabs could receive
      socketService.simulatePostCreated(createdPost)
      setNewPost({ caption: '', image: null, video: null, fileType: null, imagePreview: null, videoPreview: null })
      setShowCreateModal(false)
      
      toast({
        title: "Success",
        description: "Post created successfully",
        variant: "default"
      })
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const fileType = file.type.startsWith('video/') ? 'video' : 'image'
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewPost(prev => ({
          ...prev,
          [fileType]: file, // Store the actual file object for upload
          fileType: fileType,
          [`${fileType}Preview`]: e.target.result // Store preview for display
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setNewPost(prev => ({
      ...prev,
      image: null,
      video: null,
      imagePreview: null,
      videoPreview: null,
      fileType: null
    }))
  }

  if (isLoading) {
    return <FeedSkeleton />
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:text-3xl lg:text-4xl">Sports Feed</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base lg:text-lg">Stay updated with the latest from the sports community</p>
          </div>
          
          {/* Feed Type Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
            <Button
              variant={feedType === 'global' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('global')}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                feedType === 'global' 
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm' 
                  : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Global</span>
            </Button>
            <Button
              variant={feedType === 'personalized' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('personalized')}
              className={`flex items-center space-x-2 transition-all duration-200 ${
                feedType === 'personalized' 
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm' 
                  : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">My Feed</span>
            </Button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 space-y-4">
          {/* Filter Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 w-fit"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {(filters.role !== 'all' || filters.postType !== 'all') && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </Button>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                onClick={() => {
                  const defaultData = feedService.refreshWithDefaultData()
                  setPosts(defaultData)
                  toast({
                    title: "Feed Refreshed",
                    description: "Feed has been refreshed with default data",
                    variant: "default"
                  })
                }}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 border-blue-200 hover:border-blue-300 dark:border-blue-700 dark:hover:border-blue-600"
              >
                <span className="hidden sm:inline">Refresh Feed</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto sportsin-gradient-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create New Post</span>
                <span className="sm:hidden">Create Post</span>
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="Player">Players</option>
                    <option value="Academy">Academies</option>
                    <option value="Club">Clubs</option>
                    <option value="Scout">Scouts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Post Type
                  </label>
                  <select
                    value={filters.postType}
                    onChange={(e) => setFilters(prev => ({ ...prev, postType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="text">Text Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post, index) => {
              console.log('Feed.jsx - Post data:', post);
              return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <Card className="glass-card-premium dark:glass-card-premium-dark border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {post.author?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {post.author?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {post.author?.role || 'Unknown'} • {new Date(post.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0 ml-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-gray-900 dark:text-white mb-4">
                  {post.caption}
                </p>
                {/* Post actions dropdown (inline simple) */}
                <div className="flex justify-end -mt-2 mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setReportingPostId(post.id)
                      setReportingPost(post)
                    }} 
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <Flag className="w-4 h-4 mr-2" /> Report Post
                  </Button>
                </div>
                
                {post.image && (
                  <div className="mb-4">
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Image failed to load:', post.image)
                        // Try to load a fallback image
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjY2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
                      }}
                      onLoad={() => console.log('Image loaded successfully:', post.image)}
                    />
                  </div>
                )}
                
                {post.video && (
                  <div className="mb-4">
                    <video
                      src={post.video}
                      controls
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="cursor-pointer">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        disabled={isLiking.has(post.id)}
                        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 ${
                          likedPosts.has(post.id) 
                            ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300' 
                            : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                        }`}
                      >
                        {isLiking.has(post.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        )}
                        <span className="text-sm hidden sm:inline">{post.stats.likes}</span>
                      </Button>
                    </div>
                    
                    <div className="cursor-pointer">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm hidden sm:inline">{post.stats.comments}</span>
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                    >
                      <Share className="w-4 h-4" />
                      <span className="text-sm hidden sm:inline">{post.stats.shares}</span>
                    </Button>
                  </div>
                </div>
                
                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                    {/* Comments List */}
                    <div className="space-y-3 mb-4">
                      {comments[post.id]?.slice(0, 3).map((comment, index) => (
                        <div key={comment.id || index} className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {comment.author?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {comment.author?.name || 'User'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {comment.timestamp || 'now'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* View All Comments */}
                      {comments[post.id]?.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View all {comments[post.id].length} comments
                        </Button>
                      )}
                    </div>
                    
                    {/* Add Comment Input */}
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">U</span>
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <Input
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleAddComment(post.id)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment.trim() || isCommenting.has(post.id)}
                          className="px-3 w-full sm:w-auto"
                        >
                          {isCommenting.has(post.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>
            );
          })}
          </AnimatePresence>
          
          {/* Infinite Scroll Trigger */}
          {filteredPosts.length > 0 && (
            <div ref={lastPostRef} className="flex justify-center py-8">
              {isLoadingMore ? (
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more posts...</span>
                </div>
              ) : !hasMore ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="font-medium">No more posts</p>
                    <p className="text-xs mt-1">You've reached the end of the feed</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          
          {/* Empty State */}
          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Try adjusting your filters or create a new post
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Create Post Modal */}
    {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Post
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caption
                  </label>
                  <textarea
                    value={newPost.caption}
                    onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                    placeholder="What's on your mind?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Media (Optional)
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="media-upload"
                      />
                      <label
                        htmlFor="media-upload"
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Choose Image or Video</span>
                      </label>
                    </div>
                    
                    {newPost.imagePreview && (
                      <div className="relative">
                        <img
                          src={newPost.imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={removeFile}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {newPost.videoPreview && (
                      <div className="relative">
                        <video
                          src={newPost.videoPreview}
                          controls
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={removeFile}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  disabled={isCreating}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={isCreating || !newPost.caption.trim()}
                  className="sportsin-gradient-button w-full sm:w-auto"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isCreating ? 'Creating...' : 'Create Post'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Report Confirmation Modal */}
        <ReportConfirmationModal
          isOpen={!!reportingPostId}
          onClose={() => {
            setReportingPostId(null)
            setReportingPost(null)
            setReportDetails('')
            setReportReason('spam')
          }}
          onConfirm={async (reportData) => {
            try {
              setIsReporting(true)
              console.log('🚨 Submitting report:', reportData)
              
              await reportService.reportPost({
                postId: reportData.postId,
                reason: reportData.reason,
                details: reportData.details,
                reporterId: user?.id
              })
              
              setReportingPostId(null)
              setReportingPost(null)
              setReportDetails('')
              setReportReason('spam')
              
              toast({ 
                title: 'Report Submitted', 
                description: 'Thank you for your feedback. We will review this report.',
                variant: 'default'
              })
            } catch (error) {
              console.error('Report submission error:', error)
              toast({ 
                title: 'Error', 
                description: 'Failed to submit report. Please try again.',
                variant: 'destructive' 
              })
            } finally {
              setIsReporting(false)
            }
          }}
          postId={reportingPostId}
          postAuthor={reportingPost?.author}
          isLoading={isReporting}
          reportReasons={reportReasons}
          selectedReason={reportReason}
          onReasonChange={setReportReason}
          reportDetails={reportDetails}
          onDetailsChange={setReportDetails}
        />
    </>
  )
}

