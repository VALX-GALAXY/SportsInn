import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import GoogleButton from '@/components/GoogleButton'

export default function Login() {
  const navigate = useNavigate()
  const { login, getUserByEmail } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        await login(formData)
        navigate('/profile')
      } catch (error) {
        // Error is already handled in AuthContext with toast
        console.error('Login failed:', error)
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
        <div className="hidden sm:block absolute top-10 left-10 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-blue-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="hidden sm:block absolute top-20 right-20 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-emerald-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="hidden sm:block absolute bottom-20 left-20 w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 bg-purple-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="hidden sm:block absolute bottom-10 right-10 w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 bg-orange-500/20 rounded-full animate-bounce blur-sm" style={{ animationDelay: '3s', animationDuration: '3.5s' }}></div>
        
        {/* Energetic particle effects - Hidden on mobile for performance */}
        <div className="hidden md:block absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="hidden md:block absolute top-1/3 right-1/3 w-3 h-3 bg-emerald-400/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="hidden md:block absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="hidden md:block absolute bottom-1/4 right-1/4 w-3 h-3 bg-orange-400/60 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
        
        {/* Subtle animated light rays - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent transform rotate-12 animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent transform -rotate-12 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        </div>
      </div>
      
      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10 my-4 sm:my-6 md:my-8 px-4 sm:px-0">
        <Card className="shadow-2xl border border-white/20 bg-white/10 dark:bg-slate-950/10 backdrop-blur-lg">
          <CardHeader className="space-y-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 dark:from-blue-600 dark:via-emerald-400 dark:to-blue-400 bg-clip-text text-transparent animate-pulse">
              Welcome to SportsIn
            </CardTitle>
            <CardDescription className="text-center text-slate-800 dark:text-slate-100 text-base font-medium">
              Enter your credentials to join the action
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FloatingLabelInput
                id="email"
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              
              <PasswordInput
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                showPasswordRequirements={true}
              />
              
              <Button type="submit" className="w-full sportsin-gradient-button">
                Sign In
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
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-emerald-600 dark:text-blue-500 dark:hover:text-emerald-400 font-medium transition-colors duration-200">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
