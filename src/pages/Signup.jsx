import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { PasswordInput } from '@/components/ui/password-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import GoogleButton from '@/components/GoogleButton'
import { cn } from '@/lib/utils'

export default function Signup() {
  const navigate = useNavigate()
  const { signupWithRole } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Player-specific fields
    gender: '',
    sport: '',
    age: '',
    playerRole: '',
    // Other role-specific fields
    location: '',
    contactInfo: '',
    organization: '',
    yearsOfExperience: ''
  })
  const [errors, setErrors] = useState({})

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

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
    if (formData.role === 'player') {
      if (!formData.gender) {
        newErrors.gender = 'Gender is required for players'
      }
      if (!formData.sport) {
        newErrors.sport = 'Sport selection is required for players'
      }
      if (!formData.age) {
        newErrors.age = 'Age is required for players'
      } else if (isNaN(formData.age) || formData.age < 10 || formData.age > 50) {
        newErrors.age = 'Age must be between 10 and 50'
      }
      // Player role is only required if Cricket is selected
      if (formData.sport === 'Cricket') {
        if (!formData.playerRole) {
          newErrors.playerRole = 'Player role is required for Cricket'
        }
      }
    }
    
    if (formData.role === 'academy' || formData.role === 'club') {
      if (!formData.location) {
        newErrors.location = 'Location is required'
      }
      if (!formData.contactInfo) {
        newErrors.contactInfo = 'Contact information is required'
      }
    }
    
    if (formData.role === 'scout') {
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
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      // Clear playerRole if sport changes from Cricket to something else
      if (name === 'sport' && value !== 'Cricket') {
        newData.playerRole = ''
      }
      return newData
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleGenderChange = (value) => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }))
    if (errors.gender) {
      setErrors(prev => ({
        ...prev,
        gender: ''
      }))
    }
  }

  return (
    <div className="min-h-screen fixed inset-0 flex items-center justify-center py-4 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto" style={{ overflowY: 'auto' }}>
      {/* Fullscreen Video Background Hero Section */}
      <div className="fixed inset-0 w-full h-full z-0">
        {/* Mobile: Static background image fallback */}
        <div 
          className="md:hidden absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/hero/hero-mobile.jpg')`
          }}
        ></div>
        
        {/* Desktop: Auto-playing muted cricket/sports video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          poster="/assets/hero/hero-mobile.jpg"
        >
          {/* Primary cricket video source */}
          <source 
            src="/assets/hero/hero-video.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Dynamic gradient overlay for better text readability and brand energy */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-emerald-900/60 to-amber-900/50 dark:from-slate-950/80 dark:via-blue-950/70 dark:to-emerald-950/60"></div>
        
        {/* Animated overlay pattern for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse"></div>
        
        {/* Floating energetic sports elements - Hidden on mobile for performance */}
        <div className="hidden sm:block absolute top-16 left-16 w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-emerald-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
        <div className="hidden sm:block absolute top-24 right-24 w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-blue-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
        <div className="hidden sm:block absolute bottom-24 left-24 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-purple-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '2.5s', animationDuration: '4.5s' }}></div>
        <div className="hidden sm:block absolute bottom-16 right-16 w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 bg-orange-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '3.5s', animationDuration: '3s' }}></div>
        
        {/* Energetic particle effects - Hidden on mobile for performance */}
        <div className="hidden md:block absolute top-1/2 left-1/4 w-3 h-3 bg-blue-400/60 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="hidden md:block absolute top-1/3 right-1/3 w-2 h-2 bg-emerald-400/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="hidden md:block absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="hidden md:block absolute bottom-1/2 right-1/4 w-2 h-2 bg-orange-400/60 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        
        {/* Subtle animated light rays - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent transform rotate-12 animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent transform -rotate-12 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        </div>
      </div>
      
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 relative z-10 my-4 sm:my-6 md:my-8 px-4 sm:px-0">
        <Card className="shadow-2xl border border-white/20 bg-white/10 dark:bg-slate-950/10 backdrop-blur-lg max-h-[90vh] flex flex-col">
          <CardHeader className="space-y-2 px-4 sm:px-6 pt-4 sm:pt-6 flex-shrink-0">
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 dark:from-blue-400 dark:via-emerald-400 dark:to-blue-400 bg-clip-text text-transparent animate-pulse">
              Join SportsInn
            </CardTitle>
            <CardDescription className="text-center text-slate-800 dark:text-slate-100 text-base font-medium">
              Start your sports journey today
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingLabelInput
                id="name"
                name="name"
                type="text"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
              />
              
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
                  <option value="player">Player</option>
                  <option value="academy">Academy</option>
                  <option value="club">Club</option>
                  <option value="scout">Scout</option>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>
              
              <FloatingLabelInput
                id="email"
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              
              {/* Role-specific fields */}
              {formData.role === 'player' && (
                <>
                  {/* Gender Field - 2 column grid */}
                  <div className="space-y-2">
                    <Label className="text-slate-900 dark:text-slate-100">Gender *</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={handleGenderChange}
                      className={cn("grid-cols-2", errors.gender ? 'border-red-500' : '')}
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
                  
                  {/* Sport and Age in 2 column grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sport Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="sport">Sport *</Label>
                      <Select
                        id="sport"
                        name="sport"
                        value={formData.sport}
                        onChange={handleChange}
                        className={errors.sport ? 'border-red-500' : ''}
                      >
                        <option value="">Select a sport</option>
                        <option value="Cricket">Cricket</option>
                        <option value="Football">Football</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Table Tennis">Table Tennis</option>
                        <option value="Basketball">Basketball</option>
                      </Select>
                      {errors.sport && (
                        <p className="text-sm text-red-500 dark:text-red-400">{errors.sport}</p>
                      )}
                    </div>
                    
                    {/* Age Field */}
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
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
                        <p className="text-sm text-red-500 dark:text-red-400">{errors.age}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Conditional Player Role Field (only for Cricket) */}
                  {formData.sport === 'Cricket' && (
                    <div className="space-y-2">
                      <Label htmlFor="playerRole">Player Role *</Label>
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
                        <option value="All-Rounder">All-Rounder</option>
                        <option value="Wicket-Keeper">Wicket-Keeper</option>
                      </Select>
                      {errors.playerRole && (
                        <p className="text-sm text-red-500 dark:text-red-400">{errors.playerRole}</p>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {(formData.role === 'academy' || formData.role === 'club') && (
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
              
              {formData.role === 'scout' && (
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
              
              <PasswordInput
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                showPasswordRequirements={true}
              />
              
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
              
              <Button type="submit" className="w-full sportsin-gradient-button">
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
              <p className="text-sm text-slate-600 dark:text-slate-100">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-emerald-600 dark:text-blue-500 dark:hover:text-emerald-400 font-medium transition-colors duration-200">
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
