import { useState, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Users, CheckSquare, ClipboardList } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import statsService from '../../api/statsService'

export default function ScoutDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setStats({ applicationsReviewed: 0, decisionsMade: 0, playersScouted: 0 }); return }
      const s = await statsService.getScoutStats(user.id)
      setStats(s)
    }
    load()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Scout Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Applications Reviewed</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.applicationsReviewed || 0}</p></div><div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full"><ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400"/></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Decisions Made</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.decisionsMade || 0}</p></div><div className="p-2 bg-green-100 dark:bg-green-900 rounded-full"><CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400"/></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Players Scouted (Followers)</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.playersScouted || 0}</p></div><div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full"><Users className="w-5 h-5 text-purple-600 dark:text-purple-400"/></div></div></CardContent></Card>
        </div>
      </div>
    </div>
  )
}