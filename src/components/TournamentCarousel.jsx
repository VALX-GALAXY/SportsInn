import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Trophy, 
  MapPin, 
  Users, 
  Calendar, 
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TournamentCarousel = ({ tournaments = [], onTournamentClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || tournaments.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tournaments.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, tournaments.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? tournaments.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tournaments.length)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const getStatusBadge = (tournament) => {
    const now = new Date()
    const startDate = new Date(tournament.startDate)
    const endDate = new Date(tournament.endDate)
    
    if (now < startDate) {
      return {
        status: 'upcoming',
        label: 'Upcoming',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock
      }
    } else if (now >= startDate && now <= endDate) {
      return {
        status: 'active',
        label: 'Active',
        color: 'bg-green-100 text-green-800',
        icon: Star
      }
    } else {
      return {
        status: 'completed',
        label: 'Completed',
        color: 'bg-gray-100 text-gray-800',
        icon: Trophy
      }
    }
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No tournaments available</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            <Card className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Left Content */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      {(() => {
                        const statusInfo = getStatusBadge(tournaments[currentIndex])
                        const IconComponent = statusInfo.icon
                        return <IconComponent className="w-3 h-3 mr-1" />
                      })()}
                      {getStatusBadge(tournaments[currentIndex]) && (
                        <Badge className={getStatusBadge(tournaments[currentIndex]).color}>
                          {getStatusBadge(tournaments[currentIndex]).label}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {tournaments[currentIndex]?.type}
                      </Badge>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {tournaments[currentIndex]?.title}
                    </h3>

                    <p className="text-gray-600 text-lg leading-relaxed">
                      {tournaments[currentIndex]?.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-200" />
                        <span className="text-sm text-blue-100">{tournaments[currentIndex]?.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-200 font-bold">₹</span>
                        <span className="text-sm text-blue-100">₹{tournaments[currentIndex]?.entryFee?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-200" />
                        <span className="text-sm text-blue-100">{tournaments[currentIndex]?.registeredTeams}/{tournaments[currentIndex]?.maxTeams} teams</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-200" />
                        <span className="text-sm text-blue-100">
                          {new Date(tournaments[currentIndex]?.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => onTournamentClick?.(tournaments[currentIndex])}
                        className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        View Details
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">
                          ₹{tournaments[currentIndex]?.prizePool?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-blue-200">Prize Pool</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - Tournament Image */}
                  <div className="relative">
                    {tournaments[currentIndex]?.image ? (
                      <div className="relative rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={tournaments[currentIndex].image}
                          alt={tournaments[currentIndex].title}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
                        <Trophy className="w-16 h-16 text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {tournaments.length > 1 && (
        <>
          <Button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-12 h-12 p-0"
            size="sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-12 h-12 p-0"
            size="sm"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {tournaments.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {tournaments.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Toggle */}
      {tournaments.length > 1 && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            {isAutoPlaying ? 'Pause' : 'Play'} Auto-slide
          </Button>
        </div>
      )}
    </div>
  )
}

export default TournamentCarousel
