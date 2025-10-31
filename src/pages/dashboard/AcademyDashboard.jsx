import { useState, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Users, Trophy, Target } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import statsService from '../../api/statsService'

export default function AcademyDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setStats({ playersScouted: 0, tournamentsHosted: 0, selectionRate: 0, totalApplications: 0 }); return }
      const s = await statsService.getAcademyStats(user.id)
      setStats(s)
    }
    load()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Academy Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Players (Followers)</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.playersScouted || 0}</p></div><div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400"/></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tournaments Hosted</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.tournamentsHosted || 0}</p></div><div className="p-2 bg-green-100 dark:bg-green-900 rounded-full"><Trophy className="w-5 h-5 text-green-600 dark:text-green-400"/></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Selection Rate</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.selectionRate || 0}%</p></div><div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full"><Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400"/></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Applications</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalApplications || 0}</p></div></div></CardContent></Card>
        </div>
      </div>
    </div>
  )
}