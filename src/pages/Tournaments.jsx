import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Trophy, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Filter, 
  Search, 
  Loader2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import tournamentService from '../api/tournamentService'
import { useToast } from '../components/ui/simple-toast'
import { TournamentSkeleton } from '../components/SkeletonLoaders'
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition'

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: 'all',
    location: 'all',
    type: 'all',
    minFee: '',
    maxFee: '',
    search: ''
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
  const { toast } = useToast()

  useEffect(() => {
    fetchTournaments()
  }, [filters])

  const fetchTournaments = async () => {
    try {
      setIsLoading(true)
      const response = await tournamentService.getTournaments(filters)
      setTournaments(response.tournaments || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async () => {
    if (!selectedTournament) return

    try {
      setIsApplying(true)
      const response = await tournamentService.applyToTournament(selectedTournament.id, applicationData)
      
      toast({
        title: "Success",
        description: response.message || "Application submitted successfully!",
        variant: "default"
      })
      
      setShowApplyModal(false)
      setSelectedTournament(null)
      setApplicationData({
        teamName: '',
        contactEmail: '',
        contactPhone: '',
        additionalInfo: ''
      })
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tournaments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and join exciting sports tournaments
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tournaments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organizer Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="Club">Clubs</option>
                    <option value="Academy">Academies</option>
                    <option value="Player">Players</option>
                    <option value="Scout">Scouts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sport Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sports</option>
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Badminton">Badminton</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Entry Fee
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minFee}
                    onChange={(e) => setFilters(prev => ({ ...prev, minFee: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Entry Fee
                  </label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={filters.maxFee}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxFee: e.target.value }))}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Tournaments Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <StaggerItem key={tournament.id}>
              <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
                      {tournament.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`${getStatusColor(tournament.status)} flex items-center space-x-1`}>
                        {getStatusIcon(tournament.status)}
                        <span className="capitalize">{tournament.status}</span>
                      </Badge>
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
                    <MapPin className="w-4 h-4" />
                    <span>{tournament.location}</span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                  </div>

                  {/* Team Size */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{tournament.teamSize} players per team</span>
                  </div>

                  {/* Entry Fee */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(tournament.entryFee)}</span>
                  </div>

                  {/* Prize Pool */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Trophy className="w-4 h-4" />
                    <span>Prize: {formatCurrency(tournament.prizePool)}</span>
                  </div>

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
                  <Button
                    onClick={() => {
                      setSelectedTournament(tournament)
                      setShowApplyModal(true)
                    }}
                    disabled={tournament.status !== 'open'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {tournament.status === 'open' ? 'Apply Now' : 
                     tournament.status === 'full' ? 'Tournament Full' : 'Registration Closed'}
                  </Button>
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
              onClick={() => setFilters({
                role: 'all',
                location: 'all',
                type: 'all',
                minFee: '',
                maxFee: '',
                search: ''
              })}
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
                    onChange={(e) => setApplicationData(prev => ({ ...prev, teamName: e.target.value }))}
                    placeholder="Enter your team name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <Input
                    type="email"
                    value={applicationData.contactEmail}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="Enter contact email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone *
                  </label>
                  <Input
                    type="tel"
                    value={applicationData.contactPhone}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="Enter contact phone"
                    required
                  />
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
                  disabled={isApplying || !applicationData.teamName || !applicationData.contactEmail || !applicationData.contactPhone}
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
