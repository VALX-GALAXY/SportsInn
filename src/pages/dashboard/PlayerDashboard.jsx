import { useState, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Trophy, Users, Target } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import statsService from '../../api/statsService'
import { DashboardStatsSkeleton } from '../../components/SkeletonLoaders'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        if (user?.id) {
          const s = await statsService.getPlayerStats(user.id)
          setStats(s)
        } else {
          setStats({ tournamentsApplied: 0, acceptedPercentage: 0, connectionsCount: 0 })
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id])

  if (isLoading) return <DashboardStatsSkeleton />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="relative bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl p-8 text-white overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-100">Only real API-backed metrics are shown.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tournaments Applied</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.tournamentsApplied || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Accepted %</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.acceptedPercentage || 0}%</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sportsin-card sportsin-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Connections</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats?.connectionsCount || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}