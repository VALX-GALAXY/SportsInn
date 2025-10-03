// Mock Feed Service - Frontend Only
class FeedService {
  // Get mock feed data with compression
  getFeedData() {
    try {
      const feed = localStorage.getItem('sportshub_feed')
      return feed ? JSON.parse(feed) : this.getDefaultFeedData()
    } catch (error) {
      console.error('Error parsing feed data:', error)
      // Clear corrupted data and return default
      localStorage.removeItem('sportshub_feed')
      return this.getDefaultFeedData()
    }
  }

  saveFeedData(feed) {
    try {
      // Limit feed to prevent storage overflow (keep last 50 posts)
      const limitedFeed = feed.slice(-50)
      localStorage.setItem('sportshub_feed', JSON.stringify(limitedFeed))
    } catch (error) {
      console.error('Error saving feed data:', error)
      // If still too large, clear and start fresh
      localStorage.removeItem('sportshub_feed')
      localStorage.setItem('sportshub_feed', JSON.stringify(feed.slice(-10)))
    }
  }

  // Get default mock feed data
  getDefaultFeedData() {
    const defaultFeed = [
      {
        id: 'post_1',
        author: {
          id: 'user_1',
          name: 'Alex Johnson',
          avatar: null,
          role: 'Player'
        },
        caption: 'Just finished an amazing training session! 💪 The team is looking stronger than ever. Can\'t wait for the upcoming season!',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
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
          name: 'Sarah Wilson',
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
          name: 'Mike Chen',
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
          name: 'Emma Davis',
          avatar: null,
          role: 'Player'
        },
        caption: 'Recovery day after yesterday\'s intense match. Proper rest and nutrition are just as important as training! 🥗💤',
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
          name: 'David Rodriguez',
          avatar: null,
          role: 'Club'
        },
        caption: 'Exciting news! Our club has signed a partnership with a major sports brand. This will help us provide better facilities and equipment for our players! 🎉',
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const feed = this.getFeedData()
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return {
        posts: feed.slice(startIndex, endIndex),
        total: feed.length,
        page,
        limit
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch feed')
    }
  }

  async getPersonalizedFeed(page = 1, limit = 10) {
    try {
      // Simulate API delay
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
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch personalized feed')
    }
  }

  async createPost(postData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        throw new Error('User not authenticated')
      }

      const newPost = {
        id: `post_${Date.now()}`,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        },
        caption: postData.caption,
        image: postData.image,
        timestamp: new Date().toISOString(),
        stats: {
          likes: 0,
          comments: 0,
          shares: 0
        },
        liked: false
      }

      const feed = this.getFeedData()
      feed.unshift(newPost) // Add to beginning
      this.saveFeedData(feed)
      
      return newPost
    } catch (error) {
      throw new Error(error.message || 'Failed to create post')
    }
  }

  async likePost(postId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const feed = this.getFeedData()
      const post = feed.find(p => p.id === postId)
      
      if (!post) {
        throw new Error('Post not found')
      }

      if (post.liked) {
        post.stats.likes--
        post.liked = false
      } else {
        post.stats.likes++
        post.liked = true
      }

      this.saveFeedData(feed)
      return post
    } catch (error) {
      throw new Error(error.message || 'Failed to like post')
    }
  }

  async getComments(postId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const comments = localStorage.getItem(`sportshub_comments_${postId}`)
      return comments ? JSON.parse(comments) : []
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch comments')
    }
  }

  async addComment(postId, commentData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        throw new Error('User not authenticated')
      }

      const newComment = {
        id: `comment_${Date.now()}`,
        postId,
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        text: commentData.text,
        timestamp: new Date().toISOString()
      }

      const comments = this.getComments(postId)
      comments.push(newComment)
      localStorage.setItem(`sportshub_comments_${postId}`, JSON.stringify(comments))

      // Update post comment count
      const feed = this.getFeedData()
      const post = feed.find(p => p.id === postId)
      if (post) {
        post.stats.comments++
        this.saveFeedData(feed)
      }
      
      return newComment
    } catch (error) {
      throw new Error(error.message || 'Failed to add comment')
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

  async uploadImage(imageFile) {
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