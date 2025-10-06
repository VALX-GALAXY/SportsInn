import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { User, Home, Users, Eye, Edit, Save, X, UserPlus, UserMinus, Loader2, Trophy, Target, BarChart3, Star, TrendingUp, Calendar, Award, MailPlus, Mail } from 'lucide-react'
import requestService from '@/api/requestService'
import { useToast } from '@/components/ui/simple-toast'
import followService from '@/api/followService'

export default function Profile() {
  const { user, updateUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('About') // About | Performance
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
  const handleInviteOrApply = () => {
    const currentUser = user
    const target = { id: 'target_user', name: 'Target Profile' }
    const isPlayer = currentUser?.role === 'Player'
    const payload = {
      fromUser: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      toUser: target,
      message: isPlayer ? 'Player application' : 'Invitation to player'
    }
    const record = isPlayer ? requestService.sendApplication(payload) : requestService.sendInvite(payload)
    toast({ title: isPlayer ? 'Applied' : 'Invite sent', description: `Request ID: ${record.id}` })
  }

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
                
                <div className="flex items-center space-x-2">
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
                <Button
                  onClick={handleInviteOrApply}
                  variant="outline"
                  className="flex items-center"
                >
                  {user?.role === 'Player' ? <Mail className="w-4 h-4 mr-2" /> : <MailPlus className="w-4 h-4 mr-2" />}
                  {user?.role === 'Player' ? 'Apply' : 'Invite Player'}
                </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mt-6">
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full">
            {['About', 'Performance'].map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`transition-all duration-200 ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === 'About' && (
        <>
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
        </>
        )}

        {activeTab === 'Performance' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Performance</span>
              </CardTitle>
              <CardDescription>Season stats and trends (mock data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Matches Played</p>
                      <p className="text-2xl font-bold">34</p>
                    </div>
                    <Calendar className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Runs Scored</p>
                      <p className="text-2xl font-bold">1,120</p>
                    </div>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Wickets Taken</p>
                      <p className="text-2xl font-bold">27</p>
                    </div>
                    <BarChart3 className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Runs by Match</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{ m: 'M1', runs: 34 }, { m: 'M2', runs: 56 }, { m: 'M3', runs: 12 }, { m: 'M4', runs: 78 }, { m: 'M5', runs: 44 }] }>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="m" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} />
                      <Legend />
                      <Line type="monotone" dataKey="runs" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wickets by Match</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ m: 'M1', wkts: 1 }, { m: 'M2', wkts: 2 }, { m: 'M3', wkts: 0 }, { m: 'M4', wkts: 4 }, { m: 'M5', wkts: 3 }] }>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="m" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#E5E7EB' }} />
                      <Legend />
                      <Bar dataKey="wkts" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role-Based Dashboard Sections */}
        {user?.role === 'Player' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>My Performance</span>
              </CardTitle>
              <CardDescription>
                Track your athletic performance and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Goals This Season</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Target className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Games Played</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <BarChart3 className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Win Rate</p>
                      <p className="text-2xl font-bold">75%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Recent Achievements</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Player of the Month</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">December 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Star className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Top Scorer</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last 3 games</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'Academy' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>My Students/Players</span>
              </CardTitle>
              <CardDescription>
                Manage your academy students and track their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Students</p>
                      <p className="text-2xl font-bold">45</p>
                    </div>
                    <Users className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Active Programs</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <Calendar className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Graduates</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Trophy className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Top Performing Students</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        A
                      </div>
                      <div>
                        <p className="font-medium">Alex Johnson</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Forward • Age 16</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Excellent</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">95% Progress</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        S
                      </div>
                      <div>
                        <p className="font-medium">Sarah Wilson</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Midfielder • Age 15</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Very Good</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">88% Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'Club' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span>My Players</span>
              </CardTitle>
              <CardDescription>
                Manage your club players and team performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Squad Size</p>
                      <p className="text-2xl font-bold">25</p>
                    </div>
                    <Users className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Season Wins</p>
                      <p className="text-2xl font-bold">18</p>
                    </div>
                    <Trophy className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">League Position</p>
                      <p className="text-2xl font-bold">3rd</p>
                    </div>
                    <BarChart3 className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Key Players</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        M
                      </div>
                      <div>
                        <p className="font-medium">Mike Davis</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Captain • Midfielder</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Captain</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">8 Goals</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        J
                      </div>
                      <div>
                        <p className="font-medium">John Smith</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Striker</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Top Scorer</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">15 Goals</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'Scout' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <span>Players of Interest</span>
              </CardTitle>
              <CardDescription>
                Track and manage your scouting targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Active Targets</p>
                      <p className="text-2xl font-bold">15</p>
                    </div>
                    <Target className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Reports This Month</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <BarChart3 className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Successful Signings</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <Trophy className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Top Prospects</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        R
                      </div>
                      <div>
                        <p className="font-medium">Ryan Martinez</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Forward • Age 19</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-yellow-600">High Priority</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rating: 9.2/10</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        L
                      </div>
                      <div>
                        <p className="font-medium">Liam Thompson</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Midfielder • Age 20</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Medium Priority</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rating: 8.5/10</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}