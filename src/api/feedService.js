import uploadService from './uploadService'
import axiosInstance from './axiosInstance'

// Enhanced Feed Service with Backend Integration
class FeedService {
  // Get mock feed data with compression
  getFeedData() {
    try {
      const feed = localStorage.getItem('sportshub_feed')
      
      // If no feed data exists, return default data
      if (!feed) {
        return this.getDefaultFeedData()
      }
      
      const parsedFeed = JSON.parse(feed)
      
      // Resolve media references
      return parsedFeed.map(post => ({
        ...post,
        image: post.image ? this.getMedia(post.image) : null,
        video: post.video ? this.getMedia(post.video) : null
      }))
    } catch (error) {
      console.error('Error parsing feed data:', error)
      // Clear corrupted data and return default
      localStorage.removeItem('sportshub_feed')
      this.clearAllMedia()
      return this.getDefaultFeedData()
    }
  }

  saveFeedData(feed) {
    try {
      // Limit feed to prevent storage overflow (keep last 50 posts)
      const limitedFeed = feed.slice(-50)
      
      // Store media separately to avoid quota issues
      const feedWithoutMedia = limitedFeed.map(post => {
        const { image, video, ...postWithoutMedia } = post
        return {
          ...postWithoutMedia,
          image: image ? this.storeMedia(image, 'image') : null,
          video: video ? this.storeMedia(video, 'video') : null
        }
      })
      
      localStorage.setItem('sportshub_feed', JSON.stringify(feedWithoutMedia))
    } catch (error) {
      console.error('Error saving feed data:', error)
      // If still too large, clear and start fresh
      localStorage.removeItem('sportshub_feed')
      // Clear all media storage
      this.clearAllMedia()
      localStorage.setItem('sportshub_feed', JSON.stringify(feed.slice(-10)))
    }
  }

  // Store media separately to avoid quota issues
  storeMedia(dataUrl, type) {
    try {
      const mediaId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(`sportshub_media_${mediaId}`, dataUrl)
      return `media://${mediaId}`
    } catch (error) {
      console.warn('Could not store media, using placeholder:', error)
      return `placeholder://${type}`
    }
  }

  // Get media from storage
  getMedia(mediaRef) {
    if (mediaRef && mediaRef.startsWith('media://')) {
      const mediaId = mediaRef.replace('media://', '')
      return localStorage.getItem(`sportshub_media_${mediaId}`) || `placeholder://${mediaId.split('_')[0]}`
    }
    return mediaRef
  }

  // Clear all media storage
  clearAllMedia() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('sportshub_media_')) {
        localStorage.removeItem(key)
      }
    })
  }

  // Clean up old media to prevent storage buildup
  cleanupOldMedia() {
    try {
      const keys = Object.keys(localStorage)
      const mediaKeys = keys.filter(key => key.startsWith('sportshub_media_'))
      
      // Keep only the most recent 100 media items
      if (mediaKeys.length > 100) {
        const sortedKeys = mediaKeys.sort((a, b) => {
          const aTime = parseInt(a.split('_')[1])
          const bTime = parseInt(b.split('_')[1])
          return bTime - aTime
        })
        
        // Remove oldest media
        sortedKeys.slice(100).forEach(key => {
          localStorage.removeItem(key)
        })
      }
    } catch (error) {
      console.warn('Error cleaning up old media:', error)
    }
  }

  // Clear all feed data and start fresh
  clearFeedData() {
    localStorage.removeItem('sportshub_feed')
    this.clearAllMedia()
    console.log('Feed data and media cleared')
  }

  // Force refresh with default data (ignores localStorage)
  refreshWithDefaultData() {
    localStorage.removeItem('sportshub_feed')
    this.clearAllMedia()
    return this.getDefaultFeedData()
  }

  // Get default mock feed data
  getDefaultFeedData() {
    const defaultFeed = [
      {
        id: 'post_1',
        author: {
          id: 'user_1',
          name: 'Suraj Kumar',
          avatar: null,
          role: 'Player'
        },
        caption: 'Just finished an amazing training session! The team is looking stronger than ever. Can\'t wait for the upcoming season!',
        image: 'https://images.unsplash.com/photo-1759354001829-233b2025c6b2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzfHx8ZW58MHx8fHx8',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        stats: {
          likes: 24,
          comments: 8,
          shares: 3
        },
        liked: false
      },
      {
        id: 'post_2',
        author: {
          id: 'user_2',
          name: 'Tejaswii Singh',
          avatar: null,
          role: 'Academy'
        },
        caption: 'Our youth academy is expanding! We\'re now accepting applications for the 2024 season. Join us and be part of the next generation of champions! 🏆',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=300&fit=crop',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        stats: {
          likes: 45,
          comments: 12,
          shares: 7
        },
        liked: false
      },
      {
        id: 'post_3',
        author: {
          id: 'user_3',
          name: 'Trisha',
          avatar: null,
          role: 'Scout'
        },
        caption: 'Scouting report: Found an incredible talent at the regional tournament. This young player has the potential to go professional! 🌟',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=500&h=300&fit=crop',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        stats: {
          likes: 18,
          comments: 5,
          shares: 2
        },
        liked: false
      },
      {
        id: 'post_4',
        author: {
          id: 'user_4',
          name: 'Jay',
          avatar: null,
          role: 'Player'
        },
        caption: 'Recovery day after yesterday\'s intense match. Proper rest and nutrition are just as important as training! 💤',
        image: null,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        stats: {
          likes: 32,
          comments: 9,
          shares: 4
        },
        liked: false
      },
      {
        id: 'post_5',
        author: {
          id: 'user_5',
          name: 'David',
          avatar: null,
          role: 'Club'
        },
        caption: 'Exciting news! Our club has signed a partnership with a major sports brand. This will help us provide better facilities and equipment for our players!',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        stats: {
          likes: 67,
          comments: 15,
          shares: 11
        },
        liked: false
      }
    ]
    
    // Save default data
    this.saveFeedData(defaultFeed)
    return defaultFeed
  }

  async getFeed(page = 1, limit = 10) {
    try {
      console.log('FeedService.getFeed called with:', { page, limit })
      
      const response = await axiosInstance.get('/api/feed', {
        params: { page, limit }
      })
      
      console.log('Backend getFeed response:', response.data)
      
      // Transform backend posts to match frontend structure
      const transformedPosts = (response.data.data || []).map(post => ({
        id: post._id,
        author: {
          id: post.authorId._id,
          name: post.authorId.name,
          avatar: post.authorId.profilePic || null,
          role: post.authorId.role
        },
        caption: post.caption,
        image: post.mediaType === 'image' ? post.mediaUrl : null,
        video: post.mediaType === 'video' ? post.mediaUrl : null,
        timestamp: post.createdAt,
        stats: {
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
          shares: 0 // Backend doesn't track shares yet
        },
        liked: post.likes?.includes(post.authorId._id) || false
      }))
      
      return {
        posts: transformedPosts,
        total: transformedPosts.length,
        page: response.data.page,
        limit: response.data.limit,
        hasMore: response.data.hasMore
      }
    } catch (error) {
      console.error('FeedService.getFeed error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async getPersonalizedFeed(page = 1, limit = 10) {
    try {
      // Try backend API first
      const response = await axiosInstance.get('/api/feed/personalized', {
        params: { page, limit }
      })
      // Transform backend response to match frontend expectations
      return {
        posts: response.data.data || [],
        total: response.data.data?.length || 0,
        page: response.data.page,
        limit: response.data.limit
      }
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const feed = this.getFeedData()
      // For now, return the same feed (in a real app, this would filter by followed users)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return {
        posts: feed.slice(startIndex, endIndex),
        total: feed.length,
        page,
        limit
      }
    }
  }

  async createPost(postData) {
    try {
      console.log('FeedService.createPost called with:', postData)
      
      let mediaUrl = null
      let mediaType = null
      
      // Handle media upload if files are provided
      if (postData.image && postData.image instanceof File) {
        console.log('Uploading image to backend...')
        const formData = new FormData()
        formData.append('media', postData.image)
        const uploadResponse = await axiosInstance.post('/api/feed/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        mediaUrl = uploadResponse.data.data.url
        mediaType = uploadResponse.data.data.type
        console.log('Image upload successful:', { mediaUrl, mediaType })
      } else if (postData.video && postData.video instanceof File) {
        console.log('Uploading video to backend...')
        const formData = new FormData()
        formData.append('media', postData.video)
        const uploadResponse = await axiosInstance.post('/api/feed/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        mediaUrl = uploadResponse.data.data.url
        mediaType = uploadResponse.data.data.type
        console.log('Video upload successful:', { mediaUrl, mediaType })
      }
      
      console.log('Creating post with data:', { caption: postData.caption, mediaUrl, mediaType })
      const response = await axiosInstance.post('/api/feed', {
        caption: postData.caption,
        mediaUrl,
        mediaType
      })
      
      console.log('Backend create post response:', response.data)
      
      // Transform backend response to match frontend structure
      const post = response.data.data
      return {
        id: post._id,
        author: {
          id: post.authorId._id,
          name: post.authorId.name,
          avatar: post.authorId.profilePic || null,
          role: post.authorId.role
        },
        caption: post.caption,
        image: post.mediaType === 'image' ? post.mediaUrl : null,
        video: post.mediaType === 'video' ? post.mediaUrl : null,
        timestamp: post.createdAt,
        stats: {
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
          shares: 0
        },
        liked: false
      }
    } catch (error) {
      console.error('FeedService.createPost error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async likePost(postId) {
    try {
      console.log('FeedService.likePost called with:', postId)
      
      const response = await axiosInstance.post(`/api/feed/${postId}/toggle-like`)
      
      console.log('Backend likePost response:', response.data)
      
      return {
        likesCount: response.data.data.likesCount,
        liked: response.data.data.likesCount > 0 // This would need to be determined by checking if current user liked
      }
    } catch (error) {
      console.error('FeedService.likePost error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async getComments(postId) {
    try {
      // Try backend API first
      const response = await axiosInstance.get(`/api/feed/${postId}/comments`)
      
      // Transform backend comments to match frontend structure
      return (response.data.data || []).map(comment => ({
        id: comment._id,
        postId: postId,
        author: {
          id: comment.userId._id,
          name: comment.userId.name,
          avatar: comment.userId.profilePic || null
        },
        text: comment.text,
        timestamp: comment.createdAt
      }))
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const comments = localStorage.getItem(`sportshub_comments_${postId}`)
      return comments ? JSON.parse(comments) : []
    }
  }

  async addComment(postId, commentData) {
    try {
      console.log('FeedService.addComment called with:', { postId, commentData })
      
      const response = await axiosInstance.post(`/api/feed/${postId}/comment`, commentData)
      
      console.log('Backend addComment response:', response.data)
      
      // Transform backend comment to match frontend structure
      const comment = response.data.data
      return {
        id: comment._id,
        postId: postId,
        author: {
          id: comment.userId._id,
          name: comment.userId.name,
          avatar: comment.userId.profilePic || null
        },
        text: comment.text,
        timestamp: comment.createdAt
      }
    } catch (error) {
      console.error('FeedService.addComment error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // If backend is not running, throw a clear error
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend server is not running. Please start the server and try again.')
      }
      
      // For other errors, throw the original error
      throw error
    }
  }

  async deletePost(postId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        throw new Error('User not authenticated')
      }

      const feed = this.getFeedData()
      const postIndex = feed.findIndex(p => p.id === postId)
      
      if (postIndex === -1) {
        throw new Error('Post not found')
      }

      const post = feed[postIndex]
      if (post.author.id !== user.id) {
        throw new Error('Unauthorized to delete this post')
      }

      feed.splice(postIndex, 1)
      this.saveFeedData(feed)
      
      return { message: 'Post deleted successfully' }
    } catch (error) {
      throw new Error(error.message || 'Failed to delete post')
    }
  }

  async getUserPosts(userId, page = 1, limit = 10) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const feed = this.getFeedData()
      const userPosts = feed.filter(p => p.author.id === userId)
      
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return {
        posts: userPosts.slice(startIndex, endIndex),
        total: userPosts.length,
        page,
        limit
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user posts')
    }
  }

  async uploadImage() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would upload to a cloud service
      // For now, return a mock URL
      return {
        url: `https://images.unsplash.com/photo-${Date.now()}?w=500&h=300&fit=crop`,
        filename: `upload_${Date.now()}.jpg`
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to upload image')
    }
  }
}

export default new FeedService()
