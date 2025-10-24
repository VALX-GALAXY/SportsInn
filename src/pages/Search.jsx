import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  X,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'
import { useToast } from '../components/ui/simple-toast'
import { SearchResultsSkeleton } from '../components/SkeletonLoaders'
import searchService from '../api/searchService'
import { useAuth } from '../contexts/AuthContext'

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
      playerRole: 'Batsman',
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
      playerRole: 'Bowler',
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
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'players', 'academies', 'clubs', 'scouts'
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    name: '',
    playerRole: '', // Batsman | Bowler | All-rounder
    ageMin: '',
    ageMax: '',
    location: ''
  })
  const [page, setPage] = useState(1)
  const pageSize = 9
  const [visibleResults, setVisibleResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [trendingSearches, setTrendingSearches] = useState([])
  const loadMoreRef = useRef(null)
  const { toast } = useToast()

  // Load search history and trending searches on mount
  useEffect(() => {
    const loadSearchData = async () => {
      if (user?.id) {
        try {
          const [history, trending] = await Promise.all([
            searchService.getSearchHistory(user.id),
            searchService.getTrendingSearches()
          ])
          setSearchHistory(history)
          setTrendingSearches(trending)
        } catch (error) {
          console.error('Error loading search data:', error)
        }
      }
    }
    loadSearchData()
  }, [user?.id])

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

  // Debounced suggestions function
  const debouncedSuggestions = useCallback(
    (() => {
      let timeoutId
      return (query) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (query.length > 2) {
            try {
              const suggestionsData = await searchService.getSuggestions(query)
              setSuggestions(suggestionsData)
              setShowSuggestions(true)
            } catch (error) {
              console.error('Error loading suggestions:', error)
            }
          } else {
            setSuggestions([])
            setShowSuggestions(false)
          }
        }, 300)
      }
    })(),
    []
  )

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery)
    } else {
      setSearchResults({})
      setVisibleResults([])
      setPage(1)
    }
  }, [searchQuery, debouncedSearch])

  const performSearch = async (query) => {
    try {
      setIsLoading(true)
      
      // Save search to history
      if (user?.id) {
        await searchService.saveSearchHistory(user.id, query)
      }
      
      // Perform global search
      const searchResults = await searchService.globalSearch(query, page, pageSize)
      
      // Organize results by category
      const organizedResults = {
        players: searchResults.users?.filter(user => user.role === 'Player') || [],
        academies: searchResults.users?.filter(user => user.role === 'Academy') || [],
        clubs: searchResults.users?.filter(user => user.role === 'Club') || [],
        scouts: searchResults.users?.filter(user => user.role === 'Scout') || [],
        posts: searchResults.posts || [],
        tournaments: searchResults.tournaments || []
      }
      
      setSearchResults(organizedResults)
      setPage(1)
      
      // Initialize visible results for current active filter
      const all = Object.values(organizedResults).flat()
      setVisibleResults(all.slice(0, pageSize))
      
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

  // Update visibleResults when filter tab or searchResults change
  useEffect(() => {
    const next = (() => {
      const list = activeFilter === 'all' ? Object.values(searchResults).flat() : (searchResults[activeFilter] || [])
      return list.slice(0, page * pageSize)
    })()
    setVisibleResults(next)
  }, [searchResults, activeFilter, page])

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return
    const el = loadMoreRef.current
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        const total = activeFilter === 'all' ? Object.values(searchResults).flat().length : (searchResults[activeFilter]?.length || 0)
        const canLoadMore = visibleResults.length < total
        if (canLoadMore) {
          setPage(prev => prev + 1)
        }
      }
    }, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [visibleResults.length, searchResults, activeFilter])

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for players, academies, clubs, scouts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                debouncedSuggestions(e.target.value)
              }}
              onFocus={() => {
                if (searchQuery.length > 2) {
                  setShowSuggestions(true)
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              className="pl-10 pr-4 py-3 text-lg glass-input dark:glass-input rounded-xl border-0 shadow-lg"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
            
            {/* Autocomplete Suggestions */}
            <AnimatePresence>
              {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0 || trendingSearches.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                >
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Suggestions</div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion.name)
                            setShowSuggestions(false)
                            performSearch(suggestion.name)
                          }}
                          className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                        >
                          <SearchIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{suggestion.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Recent searches
                      </div>
                      {searchHistory.slice(0, 3).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(item.query)
                            setShowSuggestions(false)
                            performSearch(item.query)
                          }}
                          className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{item.query}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Trending Searches */}
                  {trendingSearches.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </div>
                      {trendingSearches.slice(0, 3).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(item.query)
                            setShowSuggestions(false)
                            performSearch(item.query)
                          }}
                          className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2"
                        >
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{item.query}</span>
                          <Badge variant="secondary" className="text-xs">
                            {item.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

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

          {/* Sidebar filter panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-1 bg-white dark:bg-gray-800 border-0 shadow-sm rounded-lg p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <Input
                      placeholder="e.g., Alex"
                      value={filters.name}
                      onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player Role</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      value={filters.playerRole}
                      onChange={(e) => setFilters(prev => ({ ...prev, playerRole: e.target.value }))}
                    >
                      <option value="">Any</option>
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Min</label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.ageMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, ageMin: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Max</label>
                      <Input
                        type="number"
                        min="0"
                        value={filters.ageMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, ageMax: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <Input
                      placeholder="City, State"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!searchQuery.trim()) {
                          toast({ title: 'Enter a search term first', variant: 'default' })
                          return
                        }
                        performSearch(searchQuery)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFilters({ name: '', playerRole: '', ageMin: '', ageMax: '', location: '' })
                        setPage(1)
                        performSearch(searchQuery)
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3">
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
                      onClick={() => {
                        setActiveFilter(key)
                        setPage(1)
                      }}
                      className={`flex items-center space-x-2 transition-all duration-200 ${
                        activeFilter === key 
                          ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm' 
                          : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
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
            </div>
          )}

          {/* Filter Tabs */}
          {!showFilters && (
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
                onClick={() => {
                  setActiveFilter(key)
                  setPage(1)
                }}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  activeFilter === key 
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm' 
                    : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
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
          )}
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {visibleResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className="glass-card dark:glass-card-dark border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
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
                </motion.div>
              ))}
            </AnimatePresence>
            {/* Infinite scroll sentinel */}
            {visibleResults.length < filteredResults.length && (
              <div ref={loadMoreRef} className="col-span-full flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
