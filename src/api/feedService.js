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
      const transformedPosts = (response.data.data || []).map(post => {
        console.log('Transforming post:', post)
        console.log('Media type:', post.mediaType)
        console.log('Media URL:', post.mediaUrl)
        
        const transformedPost = {
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
        }
        
        console.log('Transformed post:', transformedPost)
        return transformedPost
      })
      
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
      
      // Check if upload endpoint exists, if not, use alternative approach
      let uploadEndpointExists = false
      if (postData.image || postData.video) {
        console.log('Testing upload endpoint availability...')
        try {
          // Test with a small dummy request to see if endpoint exists
          const testResponse = await axiosInstance.get('/api/feed/upload')
          console.log('Upload endpoint test response:', testResponse.data)
          uploadEndpointExists = true
        } catch (testError) {
          console.log('Upload endpoint test failed (expected for GET):', testError.response?.status)
          if (testError.response?.status === 404) {
            console.warn('Upload endpoint /api/feed/upload does not exist! Using alternative approach...')
            uploadEndpointExists = false
          }
        }
      }
      
      let mediaUrl = null
      let mediaType = null
      
      // Handle media upload if files are provided
      if (postData.image && postData.image instanceof File) {
        console.log('Processing image upload...')
        console.log('Image file details:', {
          name: postData.image.name,
          size: postData.image.size,
          type: postData.image.type
        })
        
        if (uploadEndpointExists) {
          // Use the dedicated upload endpoint
          try {
            const formData = new FormData()
            formData.append('media', postData.image)
            
            console.log('Calling /api/feed/upload endpoint...')
            const uploadResponse = await axiosInstance.post('/api/feed/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            console.log('Upload response:', uploadResponse.data)
            
            if (uploadResponse.data && uploadResponse.data.success) {
              mediaUrl = uploadResponse.data.data.url
              mediaType = uploadResponse.data.data.type
              console.log('Image upload successful:', { mediaUrl, mediaType })
            } else {
              console.error('Upload failed - no success response:', uploadResponse.data)
              throw new Error('Upload failed - invalid response')
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError)
            console.error('Upload error response:', uploadError.response?.data)
            console.error('Upload error status:', uploadError.response?.status)
            throw new Error(`Image upload failed: ${uploadError.message}`)
          }
        } else {
          // Use alternative approach - convert to base64 and send with post
          console.log('Using base64 approach for image upload...')
          try {
            const base64String = await this.fileToBase64(postData.image)
            mediaUrl = base64String
            mediaType = 'image'
            console.log('Image converted to base64 successfully')
          } catch (base64Error) {
            console.error('Base64 conversion error:', base64Error)
            throw new Error(`Image processing failed: ${base64Error.message}`)
          }
        }
      } else if (postData.video && postData.video instanceof File) {
        console.log('Processing video upload...')
        console.log('Video file details:', {
          name: postData.video.name,
          size: postData.video.size,
          type: postData.video.type
        })
        
        if (uploadEndpointExists) {
          // Use the dedicated upload endpoint
          try {
            const formData = new FormData()
            formData.append('media', postData.video)
            
            console.log('Calling /api/feed/upload endpoint...')
            const uploadResponse = await axiosInstance.post('/api/feed/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            console.log('Upload response:', uploadResponse.data)
            
            if (uploadResponse.data && uploadResponse.data.success) {
              mediaUrl = uploadResponse.data.data.url
              mediaType = uploadResponse.data.data.type
              console.log('Video upload successful:', { mediaUrl, mediaType })
            } else {
              console.error('Upload failed - no success response:', uploadResponse.data)
              throw new Error('Upload failed - invalid response')
            }
          } catch (uploadError) {
            console.error('Video upload error:', uploadError)
            console.error('Upload error response:', uploadError.response?.data)
            console.error('Upload error status:', uploadError.response?.status)
            throw new Error(`Video upload failed: ${uploadError.message}`)
          }
        } else {
          // Use alternative approach - convert to base64 and send with post
          console.log('Using base64 approach for video upload...')
          try {
            const base64String = await this.fileToBase64(postData.video)
            mediaUrl = base64String
            mediaType = 'video'
            console.log('Video converted to base64 successfully')
          } catch (base64Error) {
            console.error('Base64 conversion error:', base64Error)
            throw new Error(`Video processing failed: ${base64Error.message}`)
          }
        }
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
      console.log('Raw post data from backend:', post)
      console.log('Media type:', post.mediaType)
      console.log('Media URL:', post.mediaUrl)
      
      const transformedPost = {
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
      
      console.log('Transformed post for frontend:', transformedPost)
      return transformedPost
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
      
      // Backend expects PUT on /:id/toggle-like
      const response = await axiosInstance.put(`/api/feed/${postId}/toggle-like`)
      
      console.log('Backend likePost response:', response.data)
      
      return {
        likesCount: response.data?.data?.likesCount ?? 0
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

  // Helper function to convert file to base64 with compression
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      console.log('feedService.fileToBase64 called with:', {
        fileName: file.name,
        fileSize: file.size,
        fileSizeKB: (file.size / 1024).toFixed(2) + 'KB',
        fileType: file.type
      })
      
      // File size validation is already done in the frontend
      // No need to validate again here

      // For images, compress them before converting to base64
      if (file.type.startsWith('image/')) {
        console.log('Starting image compression...')
        
        // Try multiple compression levels to get the smallest possible size
        this.compressImageAggressively(file)
          .then(compressedFile => {
            console.log('Image compression successful:', {
              originalSize: file.size,
              compressedSize: compressedFile.size,
              sizeReduction: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
            })
            
            // Check if compressed file is still too large for base64
            const estimatedBase64Size = compressedFile.size * 1.37 // Base64 is ~37% larger
            console.log('Estimated base64 size:', estimatedBase64Size, 'bytes')
            
            if (estimatedBase64Size > 1024 * 1024) { // If estimated > 1MB
              console.warn('Compressed file still too large for base64, trying more aggressive compression...')
              return this.compressImageAggressively(file, true) // Ultra compression
            }
            
            if (estimatedBase64Size > 512 * 1024) { // If estimated > 512KB
              console.warn('File still quite large, using ultra compression...')
              return this.compressImageAggressively(file, true) // Ultra compression
            }
            
            return compressedFile
          })
          .then(finalCompressedFile => {
            const reader = new FileReader()
            reader.onload = () => {
              const base64Size = reader.result.length
              console.log('Base64 conversion successful, length:', base64Size)
              console.log('Final base64 size:', (base64Size / 1024).toFixed(2) + 'KB')
              
              // Final check - if still too large, create a tiny image
              if (base64Size > 1024 * 1024) { // Still > 1MB
                console.error('Base64 still too large, creating minimal image...')
                return this.createMinimalImage(file)
                  .then(minimalBlob => {
                    const minimalReader = new FileReader()
                    minimalReader.onload = () => {
                      console.log('Minimal image created, size:', (minimalReader.result.length / 1024).toFixed(2) + 'KB')
                      resolve(minimalReader.result)
                    }
                    minimalReader.readAsDataURL(minimalBlob)
                  })
              }
              
              resolve(reader.result)
            }
            reader.onerror = (error) => {
              console.error('Base64 conversion failed:', error)
              reject(error)
            }
            reader.readAsDataURL(finalCompressedFile)
          })
          .catch(error => {
            console.error('Image compression failed:', error)
            reject(error)
          })
      } else {
        // For videos, just convert directly (but warn about size)
        if (file.size > 5 * 1024 * 1024) { // 5MB limit for videos
          reject(new Error(`Video too large. Please choose a video smaller than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`))
          return
        }
        
        const reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.onerror = (error) => {
          reject(error)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Helper function for aggressive image compression
  compressImageAggressively(file, ultraCompression = false) {
    if (ultraCompression) {
      console.log('Using ultra compression mode')
      return this.compressImage(file, 0.3, 400, 300) // 30% quality, 400x300 max
    } else {
      console.log('Using standard aggressive compression')
      return this.compressImage(file, 0.5, 600, 450) // 50% quality, 600x450 max
    }
  }

  // Create a minimal image as last resort
  createMinimalImage(file) {
    return new Promise((resolve, reject) => {
      console.log('Creating minimal image as last resort...')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Create a very small image (200x150 max)
        const maxWidth = 200
        const maxHeight = 150
        let { width, height } = img
        
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio

        canvas.width = width
        canvas.height = height

        // Draw with very low quality
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Minimal image created:', {
                width: width,
                height: height,
                size: blob.size
              })
              resolve(blob)
            } else {
              reject(new Error('Failed to create minimal image'))
            }
          },
          'image/jpeg', // Force JPEG for smallest size
          0.1 // 10% quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image for minimal creation'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Helper function to compress images
  compressImage(file, quality = 0.7, maxWidth = 800, maxHeight = 600) {
    return new Promise((resolve, reject) => {
      console.log('compressImage called with:', {
        fileName: file.name,
        fileSize: file.size,
        quality: quality,
        maxWidth: maxWidth,
        maxHeight: maxHeight
      })
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        console.log('Image loaded for compression:', {
          originalWidth: img.width,
          originalHeight: img.height
        })
        
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
          console.log('Image will be resized to:', { width, height })
        } else {
          console.log('Image dimensions are within limits, no resizing needed')
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('Compression completed:', {
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: (blob.size / file.size * 100).toFixed(1) + '%'
              })
              resolve(blob)
            } else {
              console.error('Canvas.toBlob returned null')
              reject(new Error('Image compression failed'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = (error) => {
        console.error('Failed to load image for compression:', error)
        reject(new Error('Failed to load image for compression'))
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

export default new FeedService()
