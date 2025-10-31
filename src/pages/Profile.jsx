import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { User, Home, Users, Eye, Edit, Save, X, UserPlus, UserMinus, Loader2, Trophy, Target, BarChart3, Star, TrendingUp, Calendar, Award, MailPlus, Mail, Upload, Image, Trash2, Plus, CheckCircle, AlertCircle, Send, MessageSquare, ChevronLeft, ChevronRight, QrCode, Share2 } from 'lucide-react'
import requestService from '@/api/requestService'
import { useToast } from '@/components/ui/simple-toast'
import followService from '@/api/followService'
import uploadService from '@/api/uploadService'
import profileService from '@/api/profileService'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'

export default function Profile() {
  const { user, updateUser, reloadUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('About') // About | Performance
  const [formData, setFormData] = useState({
    username: user?.name || '',
    bio: user?.bio || '',
    profilePicture: null,
    // Role-specific fields
    gender: user?.gender || '',
    sports: user?.sports || '',
    age: user?.age || '',
    playerRole: user?.playerRole || '',
    location: user?.location || '',
    contactInfo: user?.contactInfo || '',
    organization: user?.organization || '',
    yearsOfExperience: user?.yearsOfExperience || ''
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(user?.profilePic || user?.profilePicture || null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [galleryImages, setGalleryImages] = useState(user?.galleryImages || [])
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('idle') // 'idle', 'uploading', 'success', 'error'
  
  // Invite/Apply modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  
  // Follow functionality state
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
    isFollowing: false
  })
  
  // Gallery carousel state
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  
  // Inline validation state
  const [editingField, setEditingField] = useState(null)
  const [fieldValidation, setFieldValidation] = useState({})
  
  // QR code state
  const [showShareModal, setShowShareModal] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const { toast } = useToast()
  const handleInviteOrApply = () => {
    setShowInviteModal(true)
  }

  const handleSendInvite = async () => {
    if (!inviteMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message for your invitation/application",
        variant: "destructive"
      })
      return
    }

    setIsSendingInvite(true)
    
    try {
      const currentUser = user
      const target = { id: 'target_user', name: 'Target Profile' }
      const isPlayer = currentUser?.role === 'Player' || currentUser?.role === 'player'
      
      const payload = {
        fromUser: { 
          id: currentUser.id, 
          name: currentUser.name, 
          role: currentUser.role,
          email: currentUser.email 
        },
        toUser: target,
        message: inviteMessage.trim(),
        type: isPlayer ? 'application' : 'invitation',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const record = isPlayer ? requestService.sendApplication(payload) : requestService.sendInvite(payload)
      
      toast({
        title: isPlayer ? "Application sent!" : "Invitation sent!",
        description: `Your ${isPlayer ? 'application' : 'invitation'} has been sent successfully`,
        variant: "default"
      })
      
      setShowInviteModal(false)
      setInviteMessage('')
      
    } catch (error) {
      console.error('Error sending invite/application:', error)
      toast({
        title: "Error",
        description: "Failed to send invitation/application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleCloseInviteModal = () => {
    setShowInviteModal(false)
    setInviteMessage('')
  }

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.name || '',
        bio: user.bio || '',
        profilePicture: null,
        gender: user.gender || '',
        sports: user.sports || '',
        age: user.age || '',
        playerRole: user.playerRole || '',
        location: user.location || '',
        contactInfo: user.contactInfo || '',
        organization: user.organization || '',
        yearsOfExperience: user.yearsOfExperience || ''
      })
      setImagePreview(user.profilePic || null)
      
      // Initialize gallery images
      console.log('Initializing gallery images for user:', user)
      console.log('User.galleryImages:', user.galleryImages)
      console.log('User.gallery:', user.gallery)
      // Check if user already has formatted galleryImages, otherwise convert from gallery
      if (user.galleryImages && Array.isArray(user.galleryImages) && user.galleryImages.length > 0) {
        // User already has formatted gallery images
        console.log('Using existing galleryImages:', user.galleryImages)
        setGalleryImages(user.galleryImages)
      } else {
        // Convert from raw gallery URLs
        const galleryUrls = user.gallery || []
        console.log('Converting from gallery URLs:', galleryUrls)
        const formattedGallery = galleryUrls.map((url, index) => ({
          id: `gallery_${index}_${Date.now()}`,
          url: url
        }))
        console.log('Formatted gallery from URLs:', formattedGallery)
        setGalleryImages(formattedGallery)
      }
    }
  }, [user])

  // Load follow stats when user changes
  useEffect(() => {
    if (user) {
      loadFollowStats()
    }
  }, [user])

  // Load user profile data when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user && (user._id || user.id)) {
        try {
          const userId = user._id || user.id
          const profileData = await profileService.getProfile(userId)
          
          if (profileData) {
            // Update form data with fresh profile data
            setFormData({
              username: profileData.name || '',
              bio: profileData.bio || '',
              profilePicture: profileData.profilePic || profileData.profilePicture || null,
              age: profileData.age || '',
              playerRole: profileData.playerRole || '',
              location: profileData.location || '',
              contactInfo: profileData.contactInfo || '',
              organization: profileData.organization || '',
              yearsOfExperience: profileData.yearsOfExperience || ''
            })
            
            // Update gallery images
            if (profileData.galleryImages) {
              setGalleryImages(profileData.galleryImages)
            }
            
            // Update image preview - prioritize profilePic from user object
            const profilePic = user.profilePic || profileData.profilePic || profileData.profilePicture
            if (profilePic) {
              setImagePreview(profilePic)
            }
            
            // Update user context with complete profile data if needed
            if (profileData.profilePic && !user.profilePic) {
              const updatedUser = { ...user, profilePic: profileData.profilePic }
              updateUser(updatedUser)
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error)
          // Fallback to user data from context
          if (user.profilePic) {
            setImagePreview(user.profilePic)
          }
        }
      }
    }

    loadUserProfile()
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

  // Inline validation functions
  const validateField = (fieldName, value) => {
    let isValid = true
    let message = ''

    switch (fieldName) {
      case 'username':
        if (!value.trim()) {
          isValid = false
          message = 'Username is required'
        } else if (value.trim().length < 3) {
          isValid = false
          message = 'Username must be at least 3 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
          isValid = false
          message = 'Username can only contain letters, numbers, and underscores'
        }
        break
      case 'bio':
        if (!value.trim()) {
          isValid = false
          message = 'Bio is required'
        } else if (value.length > 500) {
          isValid = false
          message = 'Bio must be less than 500 characters'
        }
        break
      case 'email':
        if (!value.trim()) {
          isValid = false
          message = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false
          message = 'Please enter a valid email address'
        }
        break
      case 'phone':
        if (!value.trim()) {
          isValid = false
          message = 'Phone number is required'
        } else if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
          isValid = false
          message = 'Please enter a valid phone number'
        }
        break
    }

    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: { isValid, message }
    }))

    return isValid
  }

  const handleFieldEdit = (fieldName) => {
    setEditingField(fieldName)
  }

  const handleFieldSave = (fieldName) => {
    const value = formData[fieldName]
    if (validateField(fieldName, value)) {
      setEditingField(null)
      // Save the field value here
      updateUser({ [fieldName]: value })
      toast({
        title: "Success",
        description: `${fieldName} updated successfully!`,
        variant: "default"
      })
    }
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setFieldValidation({})
  }

  // Gallery carousel functions
  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    )
  }

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    )
  }

  const openGalleryModal = (index = 0) => {
    setCurrentGalleryIndex(index)
    setShowGalleryModal(true)
  }

  const handleRemoveGalleryImage = async (imageId) => {
    try {
      const userId = user._id || user.id
      if (!userId) {
        throw new Error('User ID not found')
      }
      
      // Find the image URL by ID
      const imageToRemove = galleryImages.find(img => img.id === imageId || img === imageId)
      const imageUrl = imageToRemove?.url || imageToRemove
      
      if (!imageUrl) {
        throw new Error('Image not found')
      }
      
      const result = await profileService.removeFromGallery(userId, imageUrl)
      
      if (result.success) {
        // Refresh the gallery from backend
        const updatedUser = await profileService.getProfile(userId)
        setGalleryImages(updatedUser.galleryImages || [])
        updateUser(updatedUser)
        
        if (currentGalleryIndex >= (updatedUser.galleryImages || []).length) {
          setCurrentGalleryIndex(Math.max(0, (updatedUser.galleryImages || []).length - 1))
        }
        
        toast({
          title: "Success",
          description: "Image removed from gallery",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Error removing gallery image:', error)
      toast({
        title: "Error",
        description: "Failed to remove image from gallery",
        variant: "destructive"
      })
    }
  }

  // QR code generation function
  const generateQRCode = async (profileUrl) => {
    try {
      setIsGeneratingQR(true)
      const qrCodeDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      setQrCodeDataUrl(qrCodeDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingQR(false)
    }
  }

  // Generate QR code when share modal opens
  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${user?.id}`
    generateQRCode(profileUrl)
    setShowShareModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Profile form data:', {
        ...formData,
        profilePicture: formData.profilePicture ? 'Image file selected' : 'No image'
      })
      
      // Check if user is authenticated and has valid user object
      if (!user) {
        console.error('No user found in context')
        toast({
          title: "Error",
          description: "User not found. Please log in again.",
          variant: "destructive"
        })
        return
      }
      
      // Check if user object is corrupted (contains API response structure)
      if (user.success !== undefined || user.data !== undefined || user.message !== undefined) {
        console.error('User object appears to be corrupted with API response structure')
        console.log('Corrupted user object:', user)
        
        // Try to reload user from localStorage using AuthContext
        const reloadedUser = reloadUser()
        if (reloadedUser && (reloadedUser._id || reloadedUser.id)) {
          console.log('Successfully reloaded user:', reloadedUser)
          toast({
            title: "User data reloaded",
            description: "Please try updating your profile again.",
            variant: "default"
          })
          return // Retry the operation
        }
        
        toast({
          title: "Error",
          description: "User data corrupted. Please log in again.",
          variant: "destructive"
        })
        return
      }
      
      try {
        // Prepare update data
        const updateData = {
          name: formData.username,
          bio: formData.bio,
          ...(imagePreview && { profilePic: imagePreview }),
          // Role-specific updates
          ...(formData.gender && { gender: formData.gender }),
          ...(formData.sports && { sports: formData.sports }),
          ...(formData.age && { age: formData.age }),
          ...(formData.playerRole && { playerRole: formData.playerRole }),
          ...(formData.location && { location: formData.location }),
          ...(formData.contactInfo && { contactInfo: formData.contactInfo }),
          ...(formData.organization && { organization: formData.organization }),
          ...(formData.yearsOfExperience && { yearsOfExperience: formData.yearsOfExperience })
        }
        
        // Debug: Log user object to see its structure
        console.log('User object:', user)
        console.log('User keys:', Object.keys(user || {}))
        console.log('User._id:', user?._id)
        console.log('User.id:', user?.id)
        
        // Update user data using profile service
        // Handle both _id (from backend) and id (from mock data)
        const userId = user?._id || user?.id
        if (!userId) {
          console.error('User object:', user)
          console.error('Available user properties:', Object.keys(user || {}))
          throw new Error('User ID not found. Available properties: ' + Object.keys(user || {}).join(', '))
        }
        
        console.log('Using user ID:', userId)
        const updatedUser = await profileService.updateProfile(userId, updateData)
        
        // Update local user context with the returned user data
        updateUser(updatedUser)
        setIsSubmitted(true)
        setEditingSection(null)
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false)
        }, 3000)
      } catch (error) {
        console.error('Error updating profile:', error)
        
        // Show error message to user
        toast({
          title: "Update failed",
          description: error.message || "Failed to update profile. Using local update.",
          variant: "destructive"
        })
        
        // Fallback to local update using AuthContext
        const fallbackData = {
          name: formData.username,
          bio: formData.bio,
          ...(imagePreview && { profilePic: imagePreview }),
          ...(formData.age && { age: formData.age }),
          ...(formData.playerRole && { playerRole: formData.playerRole }),
          ...(formData.location && { location: formData.location }),
          ...(formData.contactInfo && { contactInfo: formData.contactInfo }),
          ...(formData.organization && { organization: formData.organization }),
          ...(formData.yearsOfExperience && { yearsOfExperience: formData.yearsOfExperience })
        }
        
        // Use AuthContext updateUser function directly
        updateUser(fallbackData)
        setIsSubmitted(true)
        setEditingSection(null)
        
        setTimeout(() => {
          setIsSubmitted(false)
        }, 3000)
      }
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
    setImagePreview(user?.profilePic || user?.profilePicture || null)
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select a valid image file'
        }))
        setUploadStatus('error')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Image size must be less than 5MB'
        }))
        setUploadStatus('error')
        return
      }
      
      setIsUploading(true)
      setUploadStatus('uploading')
      setUploadProgress(0)
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)
      
      try {
        // Check if user object is corrupted
        if (user.success !== undefined || user.data !== undefined || user.message !== undefined) {
          console.error('User object corrupted during image upload')
          throw new Error('User data corrupted. Please refresh the page.')
        }
        
        // Upload image using profile service
        const userId = user._id || user.id
        if (!userId) {
          throw new Error('User ID not found')
        }
        
        const uploadResult = await profileService.uploadProfilePicture(userId, file)
        
        if (uploadResult.success) {
          setUploadProgress(100)
          setImagePreview(uploadResult.url)
          // Update the user object with the new profile picture
          const updatedUser = { ...user, profilePic: uploadResult.url }
          updateUser(updatedUser)
          setUploadStatus('success')
          
          toast({
            title: "Success",
            description: "Profile picture updated successfully!",
            variant: "default"
          })
          
          // Reset status after 2 seconds
          setTimeout(() => {
            setUploadStatus('idle')
            setUploadProgress(0)
          }, 2000)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        setUploadStatus('error')
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        })
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setUploadStatus('idle')
          setUploadProgress(0)
        }, 3000)
      } finally {
        clearInterval(progressInterval)
        setIsUploading(false)
      }
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        profilePicture: ''
      }))
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not a valid image file`,
          variant: "destructive"
        })
        return false
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        })
        return false
      }
      
      return true
    })
    
    if (validFiles.length === 0) return
    
    // Check if adding these files would exceed the limit
    if (galleryImages.length + validFiles.length > 3) {
      toast({
        title: "Gallery limit reached",
        description: "You can only have 3 images in your gallery",
        variant: "destructive"
      })
      return
    }
    
    setIsUploadingGallery(true)
    setUploadStatus('uploading')
    setUploadProgress(0)
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 10
      })
    }, 300)
    
    try {
      const userId = user._id || user.id
      if (!userId) {
        throw new Error('User ID not found')
      }
      
      // Upload each file individually to the backend gallery endpoint
      const uploadedImages = []
      for (const file of validFiles) {
        const uploadResult = await profileService.addToGallery(userId, file)
        if (uploadResult.success) {
          uploadedImages.push(uploadResult.url)
        }
      }
      
      if (uploadedImages.length > 0) {
        setUploadProgress(100)
        
        // Refresh the gallery from backend
        const updatedUser = await profileService.getProfile(userId)
        console.log('Updated user after gallery upload:', updatedUser)
        console.log('Updated user.gallery:', updatedUser.gallery)
        // Convert gallery URLs to the expected format
        const galleryUrls = updatedUser.gallery || []
        console.log('Gallery URLs after upload:', galleryUrls)
        const formattedGallery = galleryUrls.map((url, index) => ({
          id: `gallery_${index}_${Date.now()}`,
          url: url
        }))
        console.log('Formatted gallery after upload:', formattedGallery)
        setGalleryImages(formattedGallery)
        // Update user with formatted gallery data
        const userWithFormattedGallery = { ...updatedUser, galleryImages: formattedGallery }
        console.log('User with formatted gallery:', userWithFormattedGallery)
        updateUser(userWithFormattedGallery)
        setUploadStatus('success')
        
        toast({
          title: "Success",
          description: `${uploadedImages.length} image(s) uploaded successfully!`,
          variant: "default"
        })
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setUploadStatus('idle')
          setUploadProgress(0)
        }, 2000)
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error)
      setUploadStatus('error')
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      })
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle')
        setUploadProgress(0)
      }, 3000)
    } finally {
      clearInterval(progressInterval)
      setIsUploadingGallery(false)
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
        return 'text-slate-600 bg-gray-50'
    }
  }

  const renderRoleSpecificFields = () => {
    switch (user?.role) {
      case 'Player':
        return (
          <Card className="sportsin-card sportsin-fade-in">
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
                  {/* Gender Field */}
                  <div className="space-y-2">
                    <Label className="text-slate-900 dark:text-slate-100">Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, gender: value }))
                        if (errors.gender) {
                          setErrors(prev => ({ ...prev, gender: '' }))
                        }
                      }}
                      className={errors.gender ? 'border-red-500' : ''}
                    >
                      <RadioGroupItem value="Male">Male</RadioGroupItem>
                      <RadioGroupItem value="Female">Female</RadioGroupItem>
                      <RadioGroupItem value="Other">Other</RadioGroupItem>
                      <RadioGroupItem value="Prefer not to say">Prefer not to say</RadioGroupItem>
                    </RadioGroup>
                    {errors.gender && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.gender}</p>
                    )}
                  </div>
                  
                  {/* Sports Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="sports">Sports</Label>
                    <Select
                      id="sports"
                      name="sports"
                      value={formData.sports}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData(prev => {
                          const newData = { ...prev, sports: value }
                          // Clear playerRole if sports changes from Cricket
                          if (value !== 'Cricket') {
                            newData.playerRole = ''
                          }
                          return newData
                        })
                        if (errors.sports) {
                          setErrors(prev => ({ ...prev, sports: '' }))
                        }
                      }}
                      className={errors.sports ? 'border-red-500' : ''}
                    >
                      <option value="">Select a sport</option>
                      <option value="Cricket">Cricket</option>
                      <option value="Football">Football</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Table Tennis">Table Tennis</option>
                      <option value="Basketball">Basketball</option>
                    </Select>
                    {errors.sports && (
                      <p className="text-sm text-red-500 dark:text-red-400">{errors.sports}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        <p className="text-sm text-red-500 dark:text-red-400">{errors.age}</p>
                      )}
                    </div>
                    {/* Conditional Player Role Field (only for Cricket) */}
                    {formData.sports === 'Cricket' && (
                      <div className="space-y-2">
                        <Label htmlFor="playerRole">Player Role</Label>
                        <Select
                          id="playerRole"
                          name="playerRole"
                          value={formData.playerRole}
                          onChange={handleChange}
                          className={errors.playerRole ? 'border-red-500' : ''}
                        >
                          <option value="">Select role</option>
                          <option value="Batsman">Batsman</option>
                          <option value="Bowler">Bowler</option>
                          <option value="All-Rounder">All-Rounder</option>
                          <option value="Wicket-Keeper">Wicket-Keeper</option>
                        </Select>
                        {errors.playerRole && (
                          <p className="text-sm text-red-500 dark:text-red-400">{errors.playerRole}</p>
                        )}
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
                  {user?.gender && (
                    <div>
                      <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Gender</Label>
                      <p className="text-lg text-slate-900 dark:text-slate-100">{user.gender}</p>
                    </div>
                  )}
                  {user?.sports && (
                    <div>
                      <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Sports</Label>
                      <p className="text-lg text-slate-900 dark:text-slate-100">{user.sports}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Age</Label>
                    <p className="text-lg text-slate-900 dark:text-slate-100">{user?.age || 'Not specified'}</p>
                  </div>
                  {user?.playerRole && (
                    <div>
                      <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Player Role</Label>
                      <p className="text-lg text-slate-900 dark:text-slate-100">{user.playerRole}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      
      case 'Academy':
      case 'Club':
        return (
          <Card className="sportsin-card sportsin-fade-in">
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
          <Card className="sportsin-card sportsin-fade-in">
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

  // Add safety check for user object
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isSubmitted && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-md shadow-sm">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              Profile updated successfully!
            </p>
          </div>
        )}
        
        {/* Welcome message for new users */}
        {!user?.bio && !user?.profilePic && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-md shadow-sm">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
               Welcome! Complete your profile to get started.
            </p>
          </div>
        )}

        {/* Profile Header */}
        <Card className="mb-8 sportsin-card sportsin-fade-in">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex-shrink-0">
                {user?.profilePic ? (
                  <div className="relative">
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                    {isUploading ? (
                      <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 dark:text-slate-400 animate-spin" />
                    ) : (
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || 'User Name'}
                  </h1>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleColor(user?.role)} flex items-center justify-center sm:justify-start`}>
                    {getRoleIcon(user?.role)}
                    <span className="ml-1">{user?.role}</span>
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2 truncate">{user?.email}</p>
                {user?.bio && (
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-100 mb-2 italic break-words">
                    "{user.bio}"
                  </p>
                )}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Member since {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Follow/Unfollow Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center justify-center sm:justify-start space-x-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {followStats.followers}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {followStats.following}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Following</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    variant={followStats.isFollowing ? "outline" : "default"}
                    size="sm"
                    className={`w-full sm:w-auto transition-all duration-200 ${
                      followStats.isFollowing 
                        ? 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900' 
                        : 'sportsin-gradient-button'
                    }`}
                  >
                    {isFollowLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : followStats.isFollowing ? (
                      <div className="flex items-center justify-center">
                        <UserMinus className="w-4 h-4 mr-2" />
                        <span className="text-sm">Unfollow</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span className="text-sm">Follow</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleInviteOrApply}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto flex items-center justify-center sportsin-gradient-button"
                  >
                    {(user?.role === 'Player' || user?.role === 'player') ? <Mail className="w-4 h-4 mr-2" /> : <MailPlus className="w-4 h-4 mr-2" />}
                    <span className="text-sm">{(user?.role === 'Player' || user?.role === 'player') ? 'Apply' : 'Invite Player'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Carousel */}
        {galleryImages.length > 0 && (
          <Card className="mb-6 sportsin-card sportsin-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gallery</span>
                <Button
                  onClick={handleShareProfile}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 sportsin-gradient-button"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Profile</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 cursor-pointer group"
                    onClick={() => openGalleryModal(index)}
                  >
                    <img
                      src={image?.url || image}
                      alt={`Gallery ${index + 1}`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-lg hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Profile Button */}
        {galleryImages.length === 0 && (
          <div className="mb-6 flex justify-center">
            <Button
              onClick={handleShareProfile}
              variant="outline"
              className="flex items-center space-x-2 sportsin-gradient-button"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Profile</span>
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <div className="flex space-x-1 sm:space-x-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-1 w-full">
            {['About', 'Performance'].map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none transition-all duration-200 text-xs sm:text-sm ${activeTab === tab ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm' : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'}`}
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
          <Card className="mt-6 sportsin-card sportsin-fade-in">
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
            <AnimatePresence mode="wait">
              {editingSection === 'basic' ? (
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
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
                  <div className="flex items-center space-x-4">
                    <Input
                      id="profilePicture"
                      name="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploading}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <AnimatePresence>
                      {isUploading && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center space-x-2 text-blue-600"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Uploading...</span>
                          {uploadProgress > 0 && (
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {uploadStatus === 'success' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center space-x-2 text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Uploaded!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {uploadStatus === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center space-x-2 text-red-600"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Upload failed</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.profilePicture && (
                    <p className="text-sm text-red-500">{errors.profilePicture}</p>
                  )}
                  <AnimatePresence>
                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mt-2"
                      >
                        <p className="text-sm text-slate-600 mb-2">Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-lg"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                </motion.form>
              ) : (
                <motion.div
                  key="view-mode"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                <div className="group">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-500 dark:text-slate-400">Username</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldEdit('username')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {editingField === 'username' ? (
                    <div className="space-y-2">
                      <Input
                        value={formData.username}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, username: e.target.value }))
                          validateField('username', e.target.value)
                        }}
                        className={`${fieldValidation.username?.isValid === false ? 'border-red-500' : fieldValidation.username?.isValid === true ? 'border-green-500' : ''}`}
                      />
                      {fieldValidation.username && (
                        <div className="flex items-center space-x-2">
                          {fieldValidation.username.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm ${fieldValidation.username.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {fieldValidation.username.message}
                          </span>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave('username')}
                          disabled={!fieldValidation.username?.isValid}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFieldCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-slate-900 dark:text-white">{user?.name || 'Not specified'}</p>
                  )}
                </div>
                <div className="group">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-500 dark:text-slate-400">Bio</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldEdit('bio')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {editingField === 'bio' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, bio: e.target.value }))
                          validateField('bio', e.target.value)
                        }}
                        rows={3}
                        className={`${fieldValidation.bio?.isValid === false ? 'border-red-500' : fieldValidation.bio?.isValid === true ? 'border-green-500' : ''}`}
                      />
                      {fieldValidation.bio && (
                        <div className="flex items-center space-x-2">
                          {fieldValidation.bio.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm ${fieldValidation.bio.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {fieldValidation.bio.message}
                          </span>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave('bio')}
                          disabled={!fieldValidation.bio?.isValid}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFieldCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-slate-900 dark:text-white">{user?.bio || 'No bio available'}</p>
                  )}
                </div>
                {user?.profilePic && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-slate-400">Profile Picture</Label>
                    <div className="mt-2">
                      <img
                        src={user.profilePic}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-slate-800"
                      />
                    </div>
                  </div>
                )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Gallery Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Gallery</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  disabled={isUploadingGallery || galleryImages.length >= 3}
                  className="hidden"
                  id="gallery-upload"
                />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('gallery-upload').click()}
                    disabled={isUploadingGallery || galleryImages.length >= 3}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2"
                  >
                    {isUploadingGallery ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span className="text-sm">Add Images</span>
                  </Button>
                  <AnimatePresence>
                    {isUploadingGallery && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center space-x-2 text-blue-600"
                      >
                        <span className="text-sm">Uploading...</span>
                        {uploadProgress > 0 && (
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-blue-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {uploadStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center space-x-2 text-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Uploaded!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {uploadStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center space-x-2 text-red-600"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Upload failed</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <CardDescription>
              Upload up to 3 images to showcase your achievements and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {console.log('Main gallery section - galleryImages:', galleryImages)}
            {console.log('Gallery images structure:', galleryImages.map(img => ({ id: img.id, url: img.url, type: typeof img })))}
            {galleryImages.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-slate-400 mb-2">No images in gallery yet</p>
                <p className="text-sm text-gray-400">Click "Add Images" to upload photos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <AnimatePresence>
                  {galleryImages.map((image, index) => (
                    <motion.div
                      key={image.id || `gallery-${index}-${Date.now()}`}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative group"
                    >
                      <img
                        src={image.url || image}
                        alt="Gallery"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-slate-800 shadow-lg"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveGalleryImage(image.id || image.url || image)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {galleryImages.length < 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: galleryImages.length * 0.1 }}
                    className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center min-h-[192px] hover:border-blue-400 transition-colors duration-200 cursor-pointer"
                    onClick={() => document.getElementById('gallery-upload').click()}
                  >
                    <div className="text-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      </motion.div>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Add more images</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </>
        )}

        {activeTab === 'Performance' && (user?.role === 'Player' || user?.role === 'player') && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Player Performance</span>
              </CardTitle>
              <CardDescription>Season stats and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Performance data will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'Performance' && (user?.role === 'Academy' || user?.role === 'academy') && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Academy Performance</span>
              </CardTitle>
              <CardDescription>Training program statistics and student progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Performance data will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'Performance' && (user?.role === 'Scout' || user?.role === 'scout') && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <span>Scouting Performance</span>
              </CardTitle>
              <CardDescription>Scouting activities and success metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Performance data will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'Performance' && (user?.role === 'Club' || user?.role === 'club') && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span>Club Performance</span>
              </CardTitle>
              <CardDescription>Team performance and management metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Performance data will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fallback Performance tab for any role not specifically handled */}
        {activeTab === 'Performance' && !['Player', 'Academy', 'Scout', 'Club', 'player', 'academy', 'scout', 'club'].includes(user?.role) && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Performance Overview</span>
              </CardTitle>
              <CardDescription>Your performance metrics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Performance data will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role-Based Dashboard Sections */}
        {user?.role === 'Player' && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
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
                      <p className="text-sm text-slate-600 dark:text-slate-400">December 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Star className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Top Scorer</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Last 3 games</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'Academy' && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Academy Performance</span>
              </CardTitle>
              <CardDescription>
                Track your academy's training programs and capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Number of Trainees</p>
                      <p className="text-2xl font-bold">45</p>
                    </div>
                    <Users className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Open Slots</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <Calendar className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Top Performing Students</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        A
                      </div>
                      <div>
                        <p className="font-medium">jay kumar</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Forward • Age 16</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Excellent</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">95% Progress</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        S
                      </div>
                      <div>
                        <p className="font-medium"></p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Midfielder • Age 15</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Very Good</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">88% Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'Club' && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
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
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        M
                      </div>
                      <div>
                        <p className="font-medium">Mike Davis</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Captain • Midfielder</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Captain</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">8 Goals</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        J
                      </div>
                      <div>
                        <p className="font-medium">John Smith</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Striker</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Top Scorer</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">15 Goals</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'Scout' && (
          <Card className="mt-6 sportsin-card sportsin-fade-in">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
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
                      <p className="text-sm opacity-90">Applicants Reviewed</p>
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
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        R
                      </div>
                      <div>
                        <p className="font-medium">Ryan Martinez</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Forward • Age 19</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-yellow-600">High Priority</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Rating: 9.2/10</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        L
                      </div>
                      <div>
                        <p className="font-medium">Liam Thompson</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Midfielder • Age 20</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">Medium Priority</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Rating: 8.5/10</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invite/Apply Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={handleCloseInviteModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {user?.role === 'Player' || user?.role === 'player' ? 'Apply to Organization' : 'Invite Player'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseInviteModal}
                    className="text-gray-500 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteMessage" className="text-sm font-medium">
                      {user?.role === 'Player' || user?.role === 'player' ? 'Application Message' : 'Invitation Message'}
                    </Label>
                    <Textarea
                      id="inviteMessage"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder={
                        user?.role === 'Player' || user?.role === 'player' 
                          ? "Tell them why you'd be a great fit for their organization..."
                          : "Tell the player why they should join your organization..."
                      }
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleSendInvite}
                      disabled={isSendingInvite || !inviteMessage.trim()}
                      className="flex-1"
                    >
                      {isSendingInvite ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {user?.role === 'Player' || user?.role === 'player' ? 'Send Application' : 'Send Invitation'}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCloseInviteModal}
                      disabled={isSendingInvite}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Modal */}
        <AnimatePresence>
          {showGalleryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowGalleryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={galleryImages[currentGalleryIndex]?.url || galleryImages[currentGalleryIndex]}
                    alt={`Gallery ${currentGalleryIndex + 1}`}
                    className="w-full h-96 object-cover"
                  />
                  <Button
                    onClick={() => setShowGalleryModal(false)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {galleryImages.length > 1 && (
                    <>
                      <Button
                        onClick={prevGalleryImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={nextGalleryImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                        size="sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Gallery Image {currentGalleryIndex + 1} of {galleryImages.length}</h3>
                    <Button
                      onClick={() => handleRemoveGalleryImage(currentGalleryIndex)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  <div className="flex space-x-2 overflow-x-auto">
                    {galleryImages.map((image, index) => (
                      <img
                        key={index}
                        src={image?.url || image}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                          index === currentGalleryIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        onClick={() => setCurrentGalleryIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Profile Modal with QR Code */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Share Profile</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Share your profile with others using the QR code or link below
                  </p>
                  
                  {/* QR Code Display */}
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 mb-6 flex items-center justify-center">
                    {isGeneratingQR ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-gray-500">Generating QR Code...</p>
                      </div>
                    ) : qrCodeDataUrl ? (
                      <div className="text-center">
                        <img
                          src={qrCodeDataUrl}
                          alt="Profile QR Code"
                          className="w-48 h-48 mx-auto mb-2 rounded-lg shadow-lg"
                        />
                        <p className="text-sm text-gray-500">Scan to view profile</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">QR Code</p>
                        <p className="text-xs text-gray-400">Click to generate</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Link */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Profile Link:</p>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={`${window.location.origin}/profile/${user?.id}`}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/profile/${user?.id}`)
                          toast({
                            title: "Copied!",
                            description: "Profile link copied to clipboard",
                            variant: "default"
                          })
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Regenerate QR Code Button */}
                  {qrCodeDataUrl && (
                    <div className="mb-6">
                      <Button
                        onClick={() => {
                          const profileUrl = `${window.location.origin}/profile/${user?.id}`
                          generateQRCode(profileUrl)
                        }}
                        variant="outline"
                        className="w-full"
                        disabled={isGeneratingQR}
                      >
                        {isGeneratingQR ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Regenerate QR Code
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowShareModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/profile/${user?.id}`)
                        toast({
                          title: "Copied!",
                          description: "Profile link copied to clipboard",
                          variant: "default"
                        })
                      }}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}