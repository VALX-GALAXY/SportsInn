import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Profile() {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePicture: null
  })
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
      // an API call
      setIsSubmitted(true)
    }
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
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        profilePicture: ''
      }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Complete Your Profile</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Add some details to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-md shadow-sm">
                <p className="text-sm text-green-800 font-medium">
                  🎉 Profile completed successfully! Check the console for form data.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
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
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-blue-300 ${
                    errors.bio ? 'border-red-500' : ''
                  }`}
                />
                <div className="flex justify-between text-xs">
                  <span>{errors.bio && <span className="text-red-500">{errors.bio}</span>}</span>
                  <span className={`${formData.bio.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.bio.length}/500
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
                <div className="space-y-2">
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
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                Complete Profile
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Want to go back?{' '}
                <Link to="/login" className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200">
                  Back to Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
