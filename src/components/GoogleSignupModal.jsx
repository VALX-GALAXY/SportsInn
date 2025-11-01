import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { X, AlertCircle } from 'lucide-react'

const SPORTS = [
  'Cricket',
  'Football',
  'Basketball',
  'Tennis',
  'Badminton',
  'Volleyball',
  'Hockey',
  'Athletics',
  'Swimming',
  'Other'
]

const CRICKET_ROLES = [
  'Batsman',
  'Bowler',
  'All-Rounder',
  'Wicket-Keeper'
]

const GENDERS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
]

export default function GoogleSignupModal({ isOpen, onClose, onSubmit, userInfo }) {
  const [formData, setFormData] = useState({
    sport: '',
    gender: 'Prefer not to say',
    cricketRole: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.sport) {
      newErrors.sport = 'Sport is required'
    }
    
    if (formData.sport === 'Cricket' && !formData.cricketRole) {
      newErrors.cricketRole = 'Cricket role is required when sport is Cricket'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...userInfo,
        sport: formData.sport,
        gender: formData.gender,
        cricketRole: formData.sport === 'Cricket' ? formData.cricketRole : undefined
      })
    } catch (error) {
      console.error('Error submitting Google signup:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Complete Your Profile
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {userInfo?.name || userInfo?.email}! Please provide some additional information to complete your registration.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sport Selection */}
            <div>
              <Label htmlFor="sport" className="text-gray-700 dark:text-gray-300">
                Sport <span className="text-red-500">*</span>
              </Label>
              <select
                id="sport"
                value={formData.sport}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, sport: e.target.value, cricketRole: '' }))
                  setErrors(prev => ({ ...prev, sport: '' }))
                }}
                className={`w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.sport ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Select a sport</option>
                {SPORTS.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
              {errors.sport && (
                <p className="mt-1 text-sm text-red-500">{errors.sport}</p>
              )}
            </div>

            {/* Cricket Role (only if Cricket is selected) */}
            {formData.sport === 'Cricket' && (
              <div>
                <Label htmlFor="cricketRole" className="text-gray-700 dark:text-gray-300">
                  Cricket Role <span className="text-red-500">*</span>
                </Label>
                <select
                  id="cricketRole"
                  value={formData.cricketRole}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, cricketRole: e.target.value }))
                    setErrors(prev => ({ ...prev, cricketRole: '' }))
                  }}
                  className={`w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.cricketRole ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select your cricket role</option>
                  {CRICKET_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.cricketRole && (
                  <p className="mt-1 text-sm text-red-500">{errors.cricketRole}</p>
                )}
              </div>
            )}

            {/* Gender Selection */}
            <div>
              <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">
                Gender
              </Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GENDERS.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This information is required to create your account. You can update your profile later.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

