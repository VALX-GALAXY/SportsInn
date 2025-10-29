import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Trophy, 
  MapPin, 
  Users, 
  Calendar, 
  Filter, 
  Search, 
  Loader2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Plus
} from 'lucide-react'
import tournamentService from '../api/tournamentService'
import { useToast } from '../components/ui/simple-toast'
import { TournamentSkeleton } from '../components/SkeletonLoaders'
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition'
import TournamentCarousel from '../components/TournamentCarousel'
import TournamentFilters from '../components/TournamentFilters'
import QuickApplyButton from '../components/QuickApplyButton'
import ConfettiAnimation from '../components/ConfettiAnimation'
import { useAuth } from '../contexts/AuthContext'

export default function Tournaments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [featuredTournaments, setFeaturedTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    location: 'all',
    feeRange: 'all',
    search: '',
    sortBy: 'date', // date, fee, prize, popularity
    sortOrder: 'asc' // asc, desc
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applicationData, setApplicationData] = useState({
    teamName: '',
    contactEmail: '',
    contactPhone: '',
    additionalInfo: ''
  })
  const [isApplying, setIsApplying] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [applicationStatuses, setApplicationStatuses] = useState({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiTournament, setConfettiTournament] = useState(null)
  const { toast } = useToast()

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTournaments()
    }, filters.search ? 500 : 0) // Debounce search by 500ms

    return () => clearTimeout(timeoutId)
  }, [filters.status, filters.type, filters.location, filters.feeRange, filters.search, filters.sortBy, filters.sortOrder])

  const fetchTournaments = async () => {
    try {
      setIsLoading(true)
      
      // Validate filters before making the request
      const safeFilters = {
        ...filters,
        minFee: filters.feeRange === 'low' ? 0 : filters.feeRange === 'medium' ? 1000 : filters.feeRange === 'high' ? 5000 : '',
        maxFee: filters.feeRange === 'low' ? 1000 : filters.feeRange === 'medium' ? 5000 : ''
      }
      
      const response = await tournamentService.getTournaments(safeFilters)
      const tournaments = response.tournaments || []
      setTournaments(tournaments)
      
      // Set featured tournaments (first 3 tournaments)
      setFeaturedTournaments(tournaments.slice(0, 3))
      
      // Load application statuses for each tournament
      const statusPromises = tournaments.map(async (tournament) => {
        try {
          const status = await tournamentService.getApplicationStatus(tournament.id)
          return { tournamentId: tournament.id, status }
        } catch (error) {
          console.error(`Error fetching status for tournament ${tournament.id}:`, error)
          return { tournamentId: tournament.id, status: { status: 'not_applied' } }
        }
      })
      
      const statuses = await Promise.all(statusPromises)
      const statusMap = statuses.reduce((acc, { tournamentId, status }) => {
        acc[tournamentId] = status
        return acc
      }, {})
      
      setApplicationStatuses(statusMap)
      
      // Apply sorting
      const sortedTournaments = sortTournaments(tournaments, filters.sortBy, filters.sortOrder)
      setTournaments(sortedTournaments)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast({
        title: "Error",
        description: "Failed to load tournaments. Please try again.",
        variant: "destructive"
      })
      // Set empty array to prevent further errors
      setTournaments([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle confetti animation
  const handleApplicationSuccess = (tournament) => {
    setConfettiTournament(tournament)
    setShowConfetti(true)
  }

  const handleConfettiComplete = () => {
    setShowConfetti(false)
    setConfettiTournament(null)
  }

  const sortTournaments = (tournaments, sortBy, sortOrder) => {
    if (!tournaments || !Array.isArray(tournaments)) {
      return []
    }
    
    try {
      return [...tournaments].sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.startDate)
            bValue = new Date(b.startDate)
            break
          case 'fee':
            aValue = a.entryFee || 0
            bValue = b.entryFee || 0
            break
          case 'prize':
            aValue = a.prizePool || 0
            bValue = b.prizePool || 0
            break
          case 'popularity':
            aValue = (a.registeredTeams || 0) / (a.maxTeams || 1)
            bValue = (b.registeredTeams || 0) / (b.maxTeams || 1)
            break
          default:
            aValue = new Date(a.startDate)
            bValue = new Date(b.startDate)
        }
        
        // Handle invalid dates
        if (isNaN(aValue)) aValue = new Date(0)
        if (isNaN(bValue)) bValue = new Date(0)
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    } catch (error) {
      console.error('Error sorting tournaments:', error)
      return tournaments // Return original array if sorting fails
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
    if (!selectedTournament) return

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
      const response = await tournamentService.applyToTournament(selectedTournament.id, applicationData)
      
      toast({
        title: "Success",
        description: response.message || "Application submitted successfully!",
        variant: "default"
      })
      
      // Update application status
      setApplicationStatuses(prev => ({
        ...prev,
        [selectedTournament.id]: { 
          status: 'applied', 
          applicationId: response.applicationId,
          appliedAt: new Date().toISOString()
        }
      }))
      
      setShowApplyModal(false)
      setSelectedTournament(null)
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

  const handleWithdraw = async (tournamentId) => {
    try {
      const response = await tournamentService.withdrawApplication(tournamentId)
      
      toast({
        title: "Success",
        description: response.message || "Application withdrawn successfully!",
        variant: "default"
      })
      
      // Update application status
      setApplicationStatuses(prev => ({
        ...prev,
        [tournamentId]: { status: 'not_applied' }
      }))
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
      month: 'short',
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

  const getApplicationButton = (tournament) => {
    const appStatus = applicationStatuses[tournament.id]?.status || 'not_applied'
    
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
              onClick={() => handleWithdraw(tournament.id)}
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              Withdraw
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
              onClick={() => {
                setSelectedTournament(tournament)
                setShowApplyModal(true)
              }}
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

  const getStatusBadge = (tournament) => {
    const appStatus = applicationStatuses[tournament.id]?.status || 'not_applied'
    
    if (appStatus === 'applied') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>Applied</span>
        </Badge>
      )
    } else if (appStatus === 'approved') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>Selected</span>
        </Badge>
      )
    } else if (appStatus === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 flex items-center space-x-1">
          <XCircle className="w-3 h-3" />
          <span>Rejected</span>
        </Badge>
      )
    } else {
      return (
        <Badge className={`${getStatusColor(tournament.status)} flex items-center space-x-1`}>
          {getStatusIcon(tournament.status)}
          <span className="capitalize">{tournament.status}</span>
        </Badge>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tournaments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover and join exciting sports tournaments
            </p>
          </div>
          <TournamentSkeleton />
        </div>
      </div>
    )
  }

  return (
    <PageTransition className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 rounded-xl p-6 text-white overflow-hidden mb-6 shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-3 font-sans">
              Discover Tournaments
            </h1>
            <p className="text-blue-100 mb-4 text-lg font-medium">
              Join exciting sports tournaments and showcase your skills
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">{tournaments.length} Active Tournaments</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <Users className="w-5 h-5 text-green-300" />
                <span className="font-semibold">Join Thousands of Players</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Tournaments Carousel */}
        {featuredTournaments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-sans">
                Featured Tournaments
              </h2>
            </div>
            <TournamentCarousel 
              tournaments={featuredTournaments}
              onTournamentClick={(tournament) => navigate(`/tournaments/${tournament.id}`)}
            />
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-8">
          <TournamentFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={(search) => setFilters(prev => ({ ...prev, search }))}
            isExpanded={showFilters}
            onToggleExpanded={() => setShowFilters(!showFilters)}
          />
        </div>




        {/* Tournaments Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <StaggerItem key={tournament.id}>
              <Card 
                className="sportsin-card sportsin-interactive sportsin-fade-in"
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
                      {tournament.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusBadge(tournament)}
                      <Badge variant="outline" className="text-xs">
                        {tournament.type}
                      </Badge>
                    </div>
                  </div>
                  {tournament.image && (
                    <img
                      src={tournament.image}
                      alt={tournament.title}
                      className="w-16 h-16 object-cover rounded-lg ml-3"
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {/* Location */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{tournament.location}</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                  </div>

                  {/* Team Size */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{tournament.teamSize} {tournament.teamSize === 1 ? 'player' : 'players'} per team</span>
                  </div>

                  {/* Entry Fee */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(tournament.entryFee)}</span>
                  </div>

                  {/* Prize Pool */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Trophy className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">Prize: {formatCurrency(tournament.prizePool)}</span>
                  </div>

                  {/* Organizer */}
                  {tournament.organizer && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="w-4 h-4 flex-shrink-0" />
                      <span>Organized by {tournament.organizer.name}</span>
                    </div>
                  )}

                  {/* Registration Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {tournament.registeredTeams}/{tournament.maxTeams} teams registered
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(tournament.registeredTeams / tournament.maxTeams) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {tournament.description}
                  </p>

                  {/* Apply Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    {getApplicationButton(tournament)}
                  </div>
                </div>
              </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Empty State */}
        {tournaments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tournaments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your filters or check back later for new tournaments
            </p>
            <Button
              onClick={() => {
                setFilters({
                  role: 'all',
                  location: 'all',
                  type: 'all',
                  minFee: '',
                  maxFee: '',
                  search: '',
                  sortBy: 'date',
                  sortOrder: 'asc'
                })
                setShowFilters(false)
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedTournament && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Apply to {selectedTournament.title}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <Input
                    value={applicationData.teamName}
                    onChange={(e) => handleInputChange('teamName', e.target.value)}
                    placeholder="Enter your team name"
                    className={validationErrors.teamName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {validationErrors.teamName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.teamName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <Input
                    type="email"
                    value={applicationData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="Enter contact email"
                    className={validationErrors.contactEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {validationErrors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone *
                  </label>
                  <Input
                    type="tel"
                    value={applicationData.contactPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter contact phone (e.g., +91 98765 43210)"
                    className={validationErrors.contactPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
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
                    <div>Entry Fee: {formatCurrency(selectedTournament.entryFee)}</div>
                    <div>Team Size: {selectedTournament.teamSize} players</div>
                    <div>Prize Pool: {formatCurrency(selectedTournament.prizePool)}</div>
                    <div>Location: {selectedTournament.location}</div>
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

        {/* Quick Apply Button */}
        {user && tournaments.length > 0 && (
          <QuickApplyButton
            tournament={tournaments[0]} // Use first tournament for quick apply
            user={user}
            onApplicationSuccess={handleApplicationSuccess}
          />
        )}

        {/* Confetti Animation */}
        <ConfettiAnimation
          isActive={showConfetti}
          onComplete={handleConfettiComplete}
        />
      </div>
    </PageTransition>
  )
}

