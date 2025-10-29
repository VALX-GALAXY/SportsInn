import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Trophy, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  ArrowLeft,
  Loader2,
  Share2,
  Bookmark,
  ExternalLink
} from 'lucide-react'
import tournamentService from '../api/tournamentService'
import { useToast } from '../components/ui/simple-toast'
import PageTransition from '../components/PageTransition'

export default function TournamentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [isApplying, setIsApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applicationData, setApplicationData] = useState({
    teamName: '',
    contactEmail: '',
    contactPhone: '',
    additionalInfo: ''
  })
  const [validationErrors, setValidationErrors] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchTournamentDetails()
      fetchApplicationStatus()
    }
  }, [id])

  const fetchTournamentDetails = async () => {
    try {
      setIsLoading(true)
      const response = await tournamentService.getTournament(id)
      setTournament(response)
    } catch (error) {
      console.error('Error fetching tournament details:', error)
      toast({
        title: "Error",
        description: "Failed to load tournament details",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchApplicationStatus = async () => {
    try {
      const status = await tournamentService.getApplicationStatus(id)
      setApplicationStatus(status)
    } catch (error) {
      console.error('Error fetching application status:', error)
    }
  }

  // Validation functions
  const validateForm = () => {
    const errors = {}
    
    // Team name validation
    if (!applicationData.teamName.trim()) {
      errors.teamName = 'Team name is required'
    } else if (applicationData.teamName.trim().length < 2) {
      errors.teamName = 'Team name must be at least 2 characters'
    }
    
    // Email validation
    if (!applicationData.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address'
    }
    
    // Phone validation
    if (!applicationData.contactPhone.trim()) {
      errors.contactPhone = 'Contact phone is required'
    } else if (!/^[0-9+\-\s()]+$/.test(applicationData.contactPhone)) {
      errors.contactPhone = 'Phone number can only contain numbers, +, -, (, ), and spaces'
    } else if (applicationData.contactPhone.replace(/[^0-9]/g, '').length < 10) {
      errors.contactPhone = 'Phone number must have at least 10 digits'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePhoneChange = (value) => {
    // Only allow numbers, +, -, (, ), and spaces
    const sanitizedValue = value.replace(/[^0-9+\-\s()]/g, '')
    handleInputChange('contactPhone', sanitizedValue)
  }

  const handleApply = async () => {
    if (!tournament) return

    // Validate form before submitting
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      })
      return
    }

    try {
      setIsApplying(true)
      const response = await tournamentService.applyToTournament(tournament.id, applicationData)
      
      toast({
        title: "Success",
        description: response.message || "Application submitted successfully!",
        variant: "default"
      })
      
      setApplicationStatus({ 
        status: 'applied', 
        applicationId: response.applicationId,
        appliedAt: new Date().toISOString()
      })
      
      setShowApplyModal(false)
      setApplicationData({
        teamName: '',
        contactEmail: '',
        contactPhone: '',
        additionalInfo: ''
      })
      setValidationErrors({})
    } catch (error) {
      console.error('Error applying to tournament:', error)
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      const response = await tournamentService.withdrawApplication(id)
      
      toast({
        title: "Success",
        description: response.message || "Application withdrawn successfully!",
        variant: "default"
      })
      
      setApplicationStatus({ status: 'not_applied' })
    } catch (error) {
      console.error('Error withdrawing application:', error)
      toast({
        title: "Error",
        description: "Failed to withdraw application",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'full':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4" />
      case 'closed':
        return <XCircle className="w-4 h-4" />
      case 'full':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getApplicationButton = () => {
    if (!tournament) return null
    
    const appStatus = applicationStatus?.status || 'not_applied'
    
    switch (appStatus) {
      case 'applied':
        return (
          <div className="space-y-2">
            <Button
              disabled
              className="w-full bg-yellow-600 text-white cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Applied
            </Button>
            <Button
              onClick={handleWithdraw}
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              Withdraw Application
            </Button>
          </div>
        )
      case 'approved':
        return (
          <Button
            disabled
            className="w-full bg-green-600 text-white cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Selected
          </Button>
        )
      case 'rejected':
        return (
          <Button
            disabled
            className="w-full bg-red-600 text-white cursor-not-allowed"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </Button>
        )
      default:
        if (tournament.status === 'open') {
          return (
            <Button
              onClick={() => setShowApplyModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Now
            </Button>
          )
        } else if (tournament.status === 'full') {
          return (
            <Button
              disabled
              className="w-full bg-yellow-600 text-white cursor-not-allowed"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Tournament Full
            </Button>
          )
        } else {
          return (
            <Button
              disabled
              className="w-full bg-gray-600 text-white cursor-not-allowed"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Registration Closed
            </Button>
          )
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading tournament details...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Tournament Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The tournament you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/tournaments')}>
            Back to Tournaments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/tournaments')}
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament Header */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {tournament.title}
                    </h1>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={`${getStatusColor(tournament.status)} flex items-center space-x-1`}>
                        {getStatusIcon(tournament.status)}
                        <span className="capitalize">{tournament.status}</span>
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {tournament.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {tournament.description}
                    </p>
                  </div>
                  {tournament.image && (
                    <img
                      src={tournament.image}
                      alt={tournament.title}
                      className="w-32 h-32 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Tournament Details */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tournament Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{tournament.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(tournament.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Team Size</p>
                      <p className="font-medium">{tournament.teamSize} {tournament.teamSize === 1 ? 'player' : 'players'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Entry Fee</p>
                      <p className="font-medium text-green-600 dark:text-green-400">{formatCurrency(tournament.entryFee)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Prize Pool</p>
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">{formatCurrency(tournament.prizePool)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Organizer</p>
                      <p className="font-medium">{tournament.organizer?.name}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration Status */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Registration Status</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Teams Registered: {tournament.registeredTeams}/{tournament.maxTeams}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round((tournament.registeredTeams / tournament.maxTeams) * 100)}% Full
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {tournament.requirements && tournament.requirements.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Requirements</h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tournament.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Apply to Tournament
                </h3>
                {getApplicationButton()}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Tournament
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save for Later
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Organizer Profile
                </Button>
              </CardContent>
            </Card>

            {/* Tournament Stats */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tournament Stats</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Age Group</span>
                  <span className="font-medium">{tournament.ageGroup || 'All Ages'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Skill Level</span>
                  <span className="font-medium">{tournament.skillLevel || 'All Levels'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium">
                    {Math.ceil((new Date(tournament.endDate) - new Date(tournament.startDate)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Apply to {tournament.title}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={applicationData.teamName}
                    onChange={(e) => handleInputChange('teamName', e.target.value)}
                    placeholder="Enter your team name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      validationErrors.teamName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.teamName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.teamName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={applicationData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="Enter contact email"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      validationErrors.contactEmail 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={applicationData.contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter contact phone (e.g., +91 98765 43210)"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      validationErrors.contactPhone 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  {validationErrors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.contactPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={applicationData.additionalInfo}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    placeholder="Any additional information about your team..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Tournament Details */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tournament Details</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Entry Fee: {formatCurrency(tournament.entryFee)}</div>
                    <div>Team Size: {tournament.teamSize} players</div>
                    <div>Prize Pool: {formatCurrency(tournament.prizePool)}</div>
                    <div>Location: {tournament.location}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <Button
                  onClick={() => setShowApplyModal(false)}
                  variant="outline"
                  disabled={isApplying}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  {isApplying ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isApplying ? 'Applying...' : 'Submit Application'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
