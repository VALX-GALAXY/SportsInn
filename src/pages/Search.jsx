import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Search as SearchIcon, 
  Users, 
  Building, 
  GraduationCap, 
  User, 
  MapPin, 
  Calendar,
  Loader2,
  Filter,
  X
} from 'lucide-react'
import { useToast } from '../components/ui/simple-toast'
import { SearchResultsSkeleton } from '../components/SkeletonLoaders'

// Dummy search results data
const dummySearchResults = {
  players: [
    {
      id: 1,
      name: 'Jay kumar',
      role: 'Player',
      avatar: 'https://i.pravatar.cc/150?img=32',
      location: 'New York, NY',
      age: 22,
      position: 'Forward',
      experience: '5 years',
      verified: true,
      followers: 1250,
      bio: 'Professional football player with 5 years of experience. Looking for opportunities to grow.'
    },
    {
      id: 2,
      name: 'Ankit kumar',
      role: 'Player',
      avatar: 'https://i.pravatar.cc/150?img=45',
      location: 'Los Angeles, CA',
      age: 19,
      position: 'Midfielder',
      experience: '3 years',
      verified: false,
      followers: 890,
      bio: 'Young talented midfielder with great potential.'
    }
  ],
  academies: [
    {
      id: 3,
      name: 'Elite Sports Academy',
      role: 'Academy',
      avatar: 'https://i.pravatar.cc/150?img=67',
      location: 'Miami, FL',
      established: '2015',
      students: 150,
      verified: true,
      followers: 3200,
      bio: 'Premier sports academy focused on developing young talent.'
    }
  ],
  clubs: [
    {
      id: 4,
      name: 'Csk',
      role: 'Club',
      avatar: 'https://i.pravatar.cc/150?img=78',
      location: 'Chicago, IL',
      founded: '2010',
      players: 25,
      verified: true,
      followers: 4500,
      bio: 'Professional football club competing in the national league.'
    }
  ],
  scouts: [
    {
      id: 5,
      name: 'Trisha',
      role: 'Scout',
      avatar: 'https://i.pravatar.cc/150?img=89',
      location: 'Boston, MA',
      experience: '10 years',
      discoveries: 50,
      verified: true,
      followers: 2100,
      bio: 'Experienced scout with a track record of discovering talented players.'
    }
  ]
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'players', 'academies', 'clubs', 'scouts'
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId
      return (query) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          performSearch(query)
        }, 500)
      }
    })(),
    []
  )

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery)
    } else {
      setSearchResults({})
    }
  }, [searchQuery, debouncedSearch])

  const performSearch = async (query) => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Filter results based on query
      const filteredResults = {}
      Object.keys(dummySearchResults).forEach(category => {
        filteredResults[category] = dummySearchResults[category].filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.bio.toLowerCase().includes(query.toLowerCase()) ||
          item.location.toLowerCase().includes(query.toLowerCase())
        )
      })
      
      setSearchResults(filteredResults)
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "Search failed",
        description: "Unable to perform search",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Player':
        return <User className="w-5 h-5 text-green-500" />
      case 'Academy':
        return <GraduationCap className="w-5 h-5 text-blue-500" />
      case 'Club':
        return <Building className="w-5 h-5 text-purple-500" />
      case 'Scout':
        return <Users className="w-5 h-5 text-orange-500" />
      default:
        return <User className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Player':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Academy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Club':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Scout':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getFilteredResults = () => {
    if (activeFilter === 'all') {
      return Object.values(searchResults).flat()
    }
    return searchResults[activeFilter] || []
  }

  const totalResults = Object.values(searchResults).flat().length
  const filteredResults = getFilteredResults()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:text-3xl">
            Search SportsHub
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Find players, academies, clubs, and scouts
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for players, academies, clubs, scouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </Button>
              
              {searchQuery && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {totalResults} results for "{searchQuery}"
                </div>
              )}
            </div>

            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: totalResults },
              { key: 'players', label: 'Players', count: searchResults.players?.length || 0 },
              { key: 'academies', label: 'Academies', count: searchResults.academies?.length || 0 },
              { key: 'clubs', label: 'Clubs', count: searchResults.clubs?.length || 0 },
              { key: 'scouts', label: 'Scouts', count: searchResults.scouts?.length || 0 }
            ].map(({ key, label, count }) => (
              <Button
                key={key}
                variant={activeFilter === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(key)}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  activeFilter === key 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span>{label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs">
                    {count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {!searchQuery ? (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <SearchIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Start searching
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Enter a name, location, or keyword to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <SearchResultsSkeleton />
        ) : filteredResults.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <SearchIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search terms or filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((result) => (
              <Card 
                key={result.id} 
                className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={result.avatar}
                        alt={result.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {result.name}
                        </h3>
                        {result.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        {getRoleIcon(result.role)}
                        <Badge className={`text-xs ${getRoleColor(result.role)}`}>
                          {result.role}
                        </Badge>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          {result.location}
                        </div>
                        
                        {result.age && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            Age: {result.age}
                          </div>
                        )}
                        
                        {result.position && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Position: {result.position}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {result.bio}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {result.followers} followers
                        </div>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
