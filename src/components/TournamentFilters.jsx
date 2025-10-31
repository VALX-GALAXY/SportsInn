import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { 
  Filter, 
  Search, 
  X, 
  MapPin, 
  Trophy, 
  Calendar,
  Users,
  Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TournamentFilters = ({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  isExpanded, 
  onToggleExpanded 
}) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const filterOptions = {
    status: [
      { value: 'all', label: 'All Status', icon: Star },
      { value: 'open', label: 'Open', icon: Star },
      { value: 'closed', label: 'Closed', icon: Star },
      { value: 'upcoming', label: 'Upcoming', icon: Star }
    ],
    type: [
      { value: 'all', label: 'All Sports', icon: Trophy },
      { value: 'football', label: 'Football', icon: Trophy },
      { value: 'cricket', label: 'Cricket', icon: Trophy },
      { value: 'basketball', label: 'Basketball', icon: Trophy },
      { value: 'tennis', label: 'Tennis', icon: Trophy },
      { value: 'badminton', label: 'Badminton', icon: Trophy }
    ],
    location: [
      { value: 'all', label: 'All Locations', icon: MapPin },
      { value: 'Mumbai', label: 'Mumbai', icon: MapPin },
      { value: 'Delhi', label: 'Delhi', icon: MapPin },
      { value: 'Bangalore', label: 'Bangalore', icon: MapPin },
      { value: 'Chennai', label: 'Chennai', icon: MapPin },
      { value: 'Pune', label: 'Pune', icon: MapPin }
    ],
    feeRange: [
      { value: 'all', label: 'Any Fee', icon: () => <span className="text-green-600 font-bold">₹</span> },
      { value: 'free', label: 'Free', icon: () => <span className="text-green-600 font-bold">₹</span> },
      { value: 'low', label: 'Under ₹1,000', icon: () => <span className="text-green-600 font-bold">₹</span> },
      { value: 'medium', label: '₹1,000 - ₹5,000', icon: () => <span className="text-green-600 font-bold">₹</span> },
      { value: 'high', label: 'Above ₹5,000', icon: () => <span className="text-green-600 font-bold">₹</span> }
    ]
  }

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...localFilters, [filterType]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearch = (searchTerm) => {
    const newFilters = { ...localFilters, search: searchTerm }
    setLocalFilters(newFilters)
    onSearch(searchTerm)
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      status: 'all',
      type: 'all',
      location: 'all',
      feeRange: 'all',
      search: ''
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    onSearch('')
  }

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== 'all' && value !== ''
  )

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search tournaments..."
          value={localFilters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 focus:border-blue-400 focus:ring-blue-200 rounded-xl"
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onToggleExpanded}
          variant="outline"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white border-0 hover:from-blue-600 hover:to-emerald-600 rounded-xl px-6 py-3"
        >
          <Filter className="w-4 h-4" />
          <span>Advanced Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
              {Object.values(localFilters).filter(v => v !== 'all' && v !== '').length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            onClick={clearAllFilters}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Expandable Filter Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 space-y-6">
              {/* Status Filter */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  Status
                </h4>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.status.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleFilterChange('status', option.value)}
                      variant={localFilters.status === option.value ? 'default' : 'outline'}
                      size="sm"
                      className={`transition-all duration-200 ${
                        localFilters.status === option.value
                          ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm'
                          : 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
                      }`}
                    >
                      <option.icon className="w-3 h-3 mr-2" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sport Type Filter */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  Sport Type
                </h4>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.type.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleFilterChange('type', option.value)}
                      variant={localFilters.type === option.value ? 'default' : 'outline'}
                      size="sm"
                      className={`transition-all duration-200 ${
                        localFilters.type === option.value
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-sm'
                          : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400'
                      }`}
                    >
                      <option.icon className="w-3 h-3 mr-2" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  Location
                </h4>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.location.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleFilterChange('location', option.value)}
                      variant={localFilters.location === option.value ? 'default' : 'outline'}
                      size="sm"
                      className={`transition-all duration-200 ${
                        localFilters.location === option.value
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                          : 'hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400'
                      }`}
                    >
                      <option.icon className="w-3 h-3 mr-2" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Fee Range Filter */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <span className="text-white font-bold text-lg">₹</span>
                  </div>
                  Entry Fee
                </h4>
                <div className="flex flex-wrap gap-3">
                  {filterOptions.feeRange.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleFilterChange('feeRange', option.value)}
                      variant={localFilters.feeRange === option.value ? 'default' : 'outline'}
                      size="sm"
                      className={`transition-all duration-200 ${
                        localFilters.feeRange === option.value
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-sm'
                          : 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400'
                      }`}
                    >
                      <option.icon />
                      <span className="ml-2">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TournamentFilters
