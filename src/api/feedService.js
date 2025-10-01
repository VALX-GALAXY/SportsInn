import axiosInstance from './axiosInstance'

class FeedService {
  // Get feed posts
  async getFeed(page = 1, limit = 10) {
    try {
      const response = await axiosInstance.get(`/feed?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch feed')
    }
  }

  // Create new post
  async createPost(postData) {
    try {
      const response = await axiosInstance.post('/feed', postData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create post')
    }
  }

  // Like/unlike a post
  async toggleLike(postId) {
    try {
      const response = await axiosInstance.post(`/feed/${postId}/like`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle like')
    }
  }

  // Get post comments
  async getComments(postId) {
    try {
      const response = await axiosInstance.get(`/feed/${postId}/comments`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments')
    }
  }

  // Add comment to post
  async addComment(postId, commentData) {
    try {
      const response = await axiosInstance.post(`/feed/${postId}/comments`, commentData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment')
    }
  }

  // Delete post (only by author)
  async deletePost(postId) {
    try {
      const response = await axiosInstance.delete(`/feed/${postId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete post')
    }
  }

  // Get user's posts
  async getUserPosts(userId) {
    try {
      const response = await axiosInstance.get(`/feed/user/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user posts')
    }
  }

  // Upload image for post
  async uploadImage(imageFile) {
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const response = await axiosInstance.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  }
}

export default new FeedService()
