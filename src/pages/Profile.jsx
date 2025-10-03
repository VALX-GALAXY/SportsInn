import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { User, Home, Users, Eye, Edit, Save, X, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/simple-toast'
import followService from '@/api/followService'

export default function Profile() {
  const { user, updateUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: user?.name || '',
    bio: user?.bio || '',
    profilePicture: null,
    // Role-specific fields
    age: user?.age || '',
    playerRole: user?.playerRole || '',
    location: user?.location || '',
    contactInfo: user?.contactInfo || '',
    organization: user?.organization || '',
    yearsOfExperience: user?.yearsOfExperience || ''
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  
  // Follow functionality state
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
    isFollowing: false
  })
  const { toast } = useToast()

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.name || '',
        bio: user.bio || '',
        profilePicture: null,
        age: user.age || '',
        playerRole: user.playerRole || '',
        location: user.location || '',
        contactInfo: user.contactInfo || '',
        organization: user.organization || '',
        yearsOfExperience: user.yearsOfExperience || ''
      })
      setImagePreview(user.profilePicture || null)
    }
  }, [user])

  // Load follow stats when user changes
  useEffect(() => {
    if (user) {
      loadFollowStats()
    }
  }, [user])

  const loadFollowStats = async () => {
    try {
      const stats = followService.getUserStats(user.id)
      const isFollowing = followService.isFollowing(user.id, user.id) // This will be false for self
      setFollowStats({
        ...stats,
        isFollowing
      })
    } catch (error) {
      console.error('Error loading follow stats:', error)
    }
  }

  const handleFollow = async () => {
    try {
      setIsFollowLoading(true)
      
      if (followStats.isFollowing) {
        await followService.unfollowUser(user.id)
        setFollowStats(prev => ({
          ...prev,
          followers: prev.followers - 1,
          isFollowing: false
        }))
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user",
          variant: "default"
        })
      } else {
        await followService.followUser(user.id)
        setFollowStats(prev => ({
          ...prev,
          followers: prev.followers + 1,
          isFollowing: true
        }))
        toast({
          title: "Following",
          description: "You are now following this user",
          variant: "default"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsFollowLoading(false)
    }
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Profile form data:', {
        ...formData,
        profilePicture: formData.profilePicture ? 'Image file selected' : 'No image'
      })
      
      // Prepare update data
      const updateData = {
        name: formData.username,
        bio: formData.bio,
        ...(formData.profilePicture && { profilePicture: imagePreview }),
        // Role-specific updates
        ...(formData.age && { age: formData.age }),
        ...(formData.playerRole && { playerRole: formData.playerRole }),
        ...(formData.location && { location: formData.location }),
        ...(formData.contactInfo && { contactInfo: formData.contactInfo }),
        ...(formData.organization && { organization: formData.organization }),
        ...(formData.yearsOfExperience && { yearsOfExperience: formData.yearsOfExperience })
      }
      
      // Update user data
      updateUser(updateData)
      setIsSubmitted(true)
      setEditingSection(null)
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    }
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
  }

  const handleCancelEdit = () => {
    setEditingSection(null)
    // Reset form data to current user data
    setFormData({
      username: user?.name || '',
      bio: user?.bio || '',
      profilePicture: null,
      age: user?.age || '',
      playerRole: user?.playerRole || '',
      location: user?.location || '',
      contactInfo: user?.contactInfo || '',
      organization: user?.organization || '',
      yearsOfExperience: user?.yearsOfExperience || ''
    })
    setImagePreview(user?.profilePicture || null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select a valid image file'
        }))
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Image size must be less than 5MB'
        }))
        return
      }
      
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target.result
        setImagePreview(imageUrl)
        // Immediately update the user's profile picture
        updateUser({ profilePicture: imageUrl })
      }
      reader.readAsDataURL(file)
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        profilePicture: ''
      }))
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Player':
        return <User className="w-5 h-5" />
      case 'Academy':
        return <Home className="w-5 h-5" />
      case 'Club':
        return <Users className="w-5 h-5" />
      case 'Scout':
        return <Eye className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
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

  const renderRoleSpecificFields = () => {
    switch (user?.role) {
      case 'Player':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Player Information</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditSection('player')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingSection === 'player' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className={errors.age ? 'border-red-500' : ''}
                      />
                      {errors.age && (
                        <p className="text-sm text-red-500">{errors.age}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="playerRole">Player Role</Label>
                      <select
                        id="playerRole"
                        name="playerRole"
                        value={formData.playerRole}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <option value="">Select role</option>
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-rounder">All-rounder</option>
                      </select>
                      {errors.playerRole && (
                        <p className="text-sm text-red-500">{errors.playerRole}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Age</Label>
                    <p className="text-lg">{user?.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Player Role</Label>
                    <p className="text-lg">{user?.playerRole || 'Not specified'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      
      case 'Academy':
      case 'Club':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {user?.role === 'Academy' ? <Home className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  <span>{user?.role} Information</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditSection('organization')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingSection === 'organization' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={errors.location ? 'border-red-500' : ''}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Textarea
                      id="contactInfo"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      rows={3}
                      className={errors.contactInfo ? 'border-red-500' : ''}
                    />
                    {errors.contactInfo && (
                      <p className="text-sm text-red-500">{errors.contactInfo}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Location</Label>
                    <p className="text-lg">{user?.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Contact Information</Label>
                    <p className="text-lg whitespace-pre-line">{user?.contactInfo || 'Not specified'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      
      case 'Scout':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Scout Information</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditSection('scout')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingSection === 'scout' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className={errors.organization ? 'border-red-500' : ''}
                    />
                    {errors.organization && (
                      <p className="text-sm text-red-500">{errors.organization}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className={errors.yearsOfExperience ? 'border-red-500' : ''}
                    />
                    {errors.yearsOfExperience && (
                      <p className="text-sm text-red-500">{errors.yearsOfExperience}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Organization</Label>
                    <p className="text-lg">{user?.organization || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Years of Experience</Label>
                    <p className="text-lg">{user?.yearsOfExperience || 'Not specified'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isSubmitted && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-md shadow-sm">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              Profile updated successfully!
            </p>
          </div>
        )}
        
        {/* Welcome message for new users */}
        {!user?.bio && !user?.profilePicture && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-md shadow-sm">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
               Welcome! Complete your profile to get started.
            </p>
          </div>
        )}

        {/* Profile Header */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                    <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user?.name || 'User Name'}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role)}`}>
                    {getRoleIcon(user?.role)}
                    <span className="ml-1">{user?.role}</span>
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                {user?.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-2 italic">
                    "{user.bio}"
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Member since {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Follow/Unfollow Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {followStats.followers}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {followStats.following}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                  </div>
                </div>
                
                <Button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  variant={followStats.isFollowing ? "outline" : "default"}
                  className={`transition-all duration-200 ${
                    followStats.isFollowing 
                      ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isFollowLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Loading...</span>
                    </div>
                  ) : followStats.isFollowing ? (
                    <div className="flex items-center">
                      <UserMinus className="w-4 h-4 mr-2" />
                      <span>Unfollow</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      <span>Follow</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-specific Information */}
        {renderRoleSpecificFields()}

        {/* Basic Profile Information */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Basic Information</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditSection('basic')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingSection === 'basic' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className={errors.bio ? 'border-red-500' : ''}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <Input
                    id="profilePicture"
                    name="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {errors.profilePicture && (
                    <p className="text-sm text-red-500">{errors.profilePicture}</p>
                  )}
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</Label>
                  <p className="text-lg text-gray-900 dark:text-white">{user?.name || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</Label>
                  <p className="text-lg text-gray-900 dark:text-white">{user?.bio || 'No bio available'}</p>
                </div>
                {user?.profilePicture && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Picture</Label>
                    <div className="mt-2">
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}