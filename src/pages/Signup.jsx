import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import GoogleButton from '@/components/GoogleButton'

export default function Signup() {
  const navigate = useNavigate()
  const { signupWithRole } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Role-specific fields
    age: '',
    playerRole: '',
    location: '',
    contactInfo: '',
    organization: '',
    yearsOfExperience: ''
  })
  const [errors, setErrors] = useState({})

  const validatePassword = (password) => {
    const hasAlphabet = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!hasAlphabet) return 'Password must contain at least one letter'
    if (!hasNumber) return 'Password must contain at least one number'
    if (!hasSpecialChar) return 'Password must contain at least one special character'
    
    return null
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }
    
    // Role-specific validation
    if (formData.role === 'Player') {
      if (!formData.age) {
        newErrors.age = 'Age is required for players'
      } else if (isNaN(formData.age) || formData.age < 10 || formData.age > 50) {
        newErrors.age = 'Age must be between 10 and 50'
      }
      if (!formData.playerRole) {
        newErrors.playerRole = 'Player role is required'
      }
    }
    
    if (formData.role === 'Academy' || formData.role === 'Club') {
      if (!formData.location) {
        newErrors.location = 'Location is required'
      }
      if (!formData.contactInfo) {
        newErrors.contactInfo = 'Contact information is required'
      }
    }
    
    if (formData.role === 'Scout') {
      if (!formData.organization) {
        newErrors.organization = 'Organization is required'
      }
      if (!formData.yearsOfExperience) {
        newErrors.yearsOfExperience = 'Years of experience is required'
      } else if (isNaN(formData.yearsOfExperience) || formData.yearsOfExperience < 0) {
        newErrors.yearsOfExperience = 'Years of experience must be a positive number'
      }
    }
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        await signupWithRole(formData, formData.role)
        navigate('/profile')
      } catch (error) {
        // Error is already handled in AuthContext with toast
        console.error('Signup failed:', error)
      }
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? 'border-red-500' : ''}
                >
                  <option value="">Select your role</option>
                  <option value="Player">Player</option>
                  <option value="Academy">Academy</option>
                  <option value="Club">Club</option>
                  <option value="Scout">Scout</option>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              {/* Role-specific fields */}
              {formData.role === 'Player' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="Enter your age"
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
                    <Select
                      id="playerRole"
                      name="playerRole"
                      value={formData.playerRole}
                      onChange={handleChange}
                      className={errors.playerRole ? 'border-red-500' : ''}
                    >
                      <option value="">Select your role</option>
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                    </Select>
                    {errors.playerRole && (
                      <p className="text-sm text-red-500">{errors.playerRole}</p>
                    )}
                  </div>
                </>
              )}
              
              {(formData.role === 'Academy' || formData.role === 'Club') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Enter your location"
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
                      placeholder="Enter contact details (phone, address, etc.)"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      className={errors.contactInfo ? 'border-red-500' : ''}
                      rows={3}
                    />
                    {errors.contactInfo && (
                      <p className="text-sm text-red-500">{errors.contactInfo}</p>
                    )}
                  </div>
                </>
              )}
              
              {formData.role === 'Scout' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      type="text"
                      placeholder="Enter your organization"
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
                      placeholder="Enter years of experience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className={errors.yearsOfExperience ? 'border-red-500' : ''}
                    />
                    {errors.yearsOfExperience && (
                      <p className="text-sm text-red-500">{errors.yearsOfExperience}</p>
                    )}
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {formData.password && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-300">Password requirements:</div>
                    <div className="space-y-1">
                      <div className={`text-xs flex items-center ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <span className="mr-1">{formData.password.length >= 8 ? '✓' : '○'}</span>
                        At least 8 characters
                      </div>
                      <div className={`text-xs flex items-center ${/[a-zA-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <span className="mr-1">{/[a-zA-Z]/.test(formData.password) ? '✓' : '○'}</span>
                        At least one letter
                      </div>
                      <div className={`text-xs flex items-center ${/\d/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <span className="mr-1">{/\d/.test(formData.password) ? '✓' : '○'}</span>
                        At least one number
                      </div>
                      <div className={`text-xs flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <span className="mr-1">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓' : '○'}</span>
                        At least one special character
                      </div>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                Create Account
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <GoogleButton 
                  className="w-full"
                  onSuccess={() => navigate('/profile')}
                />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-purple-600 dark:text-blue-400 dark:hover:text-purple-400 font-medium transition-colors duration-200">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
