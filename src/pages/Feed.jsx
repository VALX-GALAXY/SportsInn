import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share, MoreHorizontal, Loader2 } from 'lucide-react'


// Mock feed service for now
const feedService = {
  getFeed: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          posts: [
            {
              id: 1,
              author: {
                name: 'Suraj kumar',
                role: 'Player',
                avatar: 'https://i.pravatar.cc/150?img=66',
                verified: true
              },
              content: {
                text: 'Just finished an amazing training session! The new techniques we learned today are going to take my game to the next level.',
                image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop&auto=format'
              },
              stats: {
                likes: 42,
                comments: 8,
                shares: 3
              },
              timestamp: '2 hours ago'
            }
          ]
        })
      }, 1000)
    })
  },
  toggleLike: async (postId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ likes: Math.floor(Math.random() * 100) })
      }, 500)
    })
  }
}
import { useToast } from '@/components/ui/simple-toast'

// Dummy feed data with reliable image sources
const dummyFeedData = [
  {
    id: 1,
    author: {
      name: 'Suraj kumar',
      role: 'Player',
      avatar: 'https://i.pravatar.cc/150?img=66',
      verified: true
    },
    content: {
      text: 'Just finished an amazing training session! The new techniques we learned today are going to take my game to the next level. Can\'t wait to apply them in the next match! 🏏',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=300&fit=crop&auto=format'
    },
    stats: {
      likes: 42,
      comments: 8,
      shares: 3
    },
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    author: {
      name: 'Cricket Academy Mumbai',
      role: 'Academy',
      avatar: 'https://i.pravatar.cc/150?img=2',
      verified: true
    },
    content: {
      text: 'Registration is now open for our summer cricket camp! Join us for intensive training sessions with professional coaches. Limited spots available. Contact us for more details.',
      image: "https://plus.unsplash.com/premium_photo-1683887033886-6c45d4b659f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWNhZGVteXxlbnwwfHwwfHx8MA%3D%3D"
    },
    stats: {
      likes: 28,
      comments: 12,
      shares: 15
    },
    timestamp: '4 hours ago'
  },
  {
    id: 3,
    author: {
      name: 'Jay Kumar',
      role: 'Scout',
      avatar: 'https://i.pravatar.cc/150?img=3',
      verified: false
    },
    content: {
      text: 'Spotted some incredible talent at the local tournament today. The young players are showing great potential. Always exciting to discover the next generation of cricket stars!',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop&auto=format'
    },
    stats: {
      likes: 15,
      comments: 5,
      shares: 2
    },
    timestamp: '6 hours ago'
  },
  {
    id: 4,
    author: {
      name: 'Delhi Cricket Club',
      role: 'Club',
      avatar: 'https://i.pravatar.cc/150?img=4',
      verified: true
    },
    content: {
      text: 'Congratulations to our U-19 team for winning the district championship! The boys played exceptionally well. Special mention to our captain for his outstanding leadership.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&h=300&fit=crop&auto=format'
    },
    stats: {
      likes: 67,
      comments: 23,
      shares: 18
    },
    timestamp: '1 day ago'
  },
  {
    id: 5,
    author: {
      name: 'Aman Singh',
      role: 'Player',
      avatar: 'https://i.pravatar.cc/150?img=5',
      verified: false
    },
    content: {
      text: 'Working on my batting technique with the new coach. The focus on footwork and timing is really paying off. Practice makes perfect!',
      image: "https://plus.unsplash.com/premium_photo-1685231505268-c8f27c4e8870?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGxheWVyfGVufDB8fDB8fHww"
    },
    stats: {
      likes: 31,
      comments: 7,
      shares: 4
    },
    timestamp: '2 days ago'
  }
]

export default function Feed() {
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [feedData, setFeedData] = useState([])
  const [imageErrors, setImageErrors] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(new Set())
  const { toast } = useToast()

  // Fetch feed data on component mount
  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      setIsLoading(true)
      const response = await feedService.getFeed()
      setFeedData(response.posts || [])
    } catch (error) {
      console.error('Error fetching feed:', error)
      toast({
        title: "Failed to load feed",
        description: error.message || "Unable to fetch posts",
        variant: "destructive"
      })
      // Fallback to dummy data if API fails
      setFeedData(dummyFeedData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId) => {
    if (isLiking.has(postId)) return // Prevent multiple clicks
    
    try {
      setIsLiking(prev => new Set([...prev, postId]))
      
      const response = await feedService.toggleLike(postId)
      
      // Update local state optimistically
      setLikedPosts(prev => {
        const newLikedPosts = new Set(prev)
        if (newLikedPosts.has(postId)) {
          newLikedPosts.delete(postId)
        } else {
          newLikedPosts.add(postId)
        }
        return newLikedPosts
      })

      // Update the feed data with server response
      setFeedData(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            stats: {
              ...post.stats,
              likes: response.likes
            }
          }
        }
        return post
      }))
      
    } catch (error) {
      console.error('Error liking post:', error)
      toast({
        title: "Failed to like post",
        description: error.message || "Unable to like post",
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

  const handleImageError = (imageId) => {
    setImageErrors(prev => new Set([...prev, imageId]))
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Player':
        return 'text-green-600 bg-green-50'
      case 'Academy':
        return 'text-blue-600 bg-blue-50'
      case 'Club':
        return 'text-purple-600 bg-purple-50'
      case 'Scout':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:text-3xl">Sports Feed</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">Stay updated with the latest from the sports community</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading feed...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {feedData.map((post) => (
            <Card key={post.id} className="bg-white dark:bg-gray-800 shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {imageErrors.has(`avatar-${post.id}`) ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                        onError={() => handleImageError(`avatar-${post.id}`)}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {post.author.name}
                        </h3>
                        {post.author.verified && (
                          <span className="text-blue-500 text-sm">✓</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                          {post.author.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {post.timestamp}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 px-4 sm:px-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-900 dark:text-white leading-relaxed sm:text-base">
                    {post.content.text}
                  </p>
                  
                  {post.content.image && (
                    <div className="rounded-lg overflow-hidden">
                      {imageErrors.has(`content-${post.id}`) ? (
                        <div className="w-full h-32 sm:h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">📷</div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Image not available</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={post.content.image}
                          alt="Post content"
                          className="w-full h-auto object-cover max-h-64 sm:max-h-80"
                          onError={() => handleImageError(`content-${post.id}`)}
                        />
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        disabled={isLiking.has(post.id)}
                        className={`flex items-center space-x-2 px-3 py-2 ${
                          likedPosts.has(post.id) 
                            ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300' 
                            : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                        }`}
                      >
                        {isLiking.has(post.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart 
                            className={`w-4 h-4 ${
                              likedPosts.has(post.id) ? 'fill-current' : ''
                            }`} 
                          />
                        )}
                        <span className="text-sm">{post.stats.likes}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.stats.comments}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
                      >
                        <Share className="w-4 h-4" />
                        <span className="text-sm">{post.stats.shares}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Button variant="outline" className="px-6 py-2 text-sm">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  )
}
