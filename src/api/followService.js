// Mock Follow Service - Frontend Only
class FollowService {
  // Get follow relationships
  getFollowData() {
    const follows = localStorage.getItem('sportshub_follows')
    return follows ? JSON.parse(follows) : []
  }

  saveFollowData(follows) {
    localStorage.setItem('sportshub_follows', JSON.stringify(follows))
  }

  // Get user stats
  getUserStats(userId) {
    const follows = this.getFollowData()
    const followers = follows.filter(f => f.followingId === userId)
    const following = follows.filter(f => f.followerId === userId)
    
    return {
      followers: followers.length,
      following: following.length
    }
  }

  // Check if user A follows user B
  isFollowing(followerId, followingId) {
    const follows = this.getFollowData()
    return follows.some(f => f.followerId === followerId && f.followingId === followingId)
  }

  async followUser(userId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      if (currentUser.id === userId) {
        throw new Error('Cannot follow yourself')
      }

      const follows = this.getFollowData()
      
      // Check if already following
      if (this.isFollowing(currentUser.id, userId)) {
        throw new Error('Already following this user')
      }

      // Add follow relationship
      const newFollow = {
        id: `follow_${Date.now()}`,
        followerId: currentUser.id,
        followingId: userId,
        createdAt: new Date().toISOString()
      }

      follows.push(newFollow)
      this.saveFollowData(follows)

      // Return updated stats
      const stats = this.getUserStats(userId)
      return {
        ...stats,
        isFollowing: true
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to follow user')
    }
  }

  async unfollowUser(userId) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const currentUser = JSON.parse(localStorage.getItem('user'))
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const follows = this.getFollowData()
      
      // Find and remove follow relationship
      const followIndex = follows.findIndex(f => 
        f.followerId === currentUser.id && f.followingId === userId
      )

      if (followIndex === -1) {
        throw new Error('Not following this user')
      }

      follows.splice(followIndex, 1)
      this.saveFollowData(follows)

      // Return updated stats
      const stats = this.getUserStats(userId)
      return {
        ...stats,
        isFollowing: false
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to unfollow user')
    }
  }

  async getFollowers(userId, page = 1, limit = 20) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const follows = this.getFollowData()
      const followerIds = follows
        .filter(f => f.followingId === userId)
        .map(f => f.followerId)

      // Mock user data for followers
      const followers = followerIds.map(id => ({
        id,
        name: `User ${id.split('_')[1]}`,
        avatar: null,
        role: 'Player',
        isFollowing: false // Current user's relationship with this follower
      }))

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return {
        users: followers.slice(startIndex, endIndex),
        total: followers.length,
        page,
        limit
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch followers')
    }
  }

  async getFollowing(userId, page = 1, limit = 20) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const follows = this.getFollowData()
      const followingIds = follows
        .filter(f => f.followerId === userId)
        .map(f => f.followingId)

      // Mock user data for following
      const following = followingIds.map(id => ({
        id,
        name: `User ${id.split('_')[1]}`,
        avatar: null,
        role: 'Player',
        isFollowing: true // Current user follows this user
      }))

      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      
      return {
        users: following.slice(startIndex, endIndex),
        total: following.length,
        page,
        limit
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch following')
    }
  }
}

export default new FollowService()