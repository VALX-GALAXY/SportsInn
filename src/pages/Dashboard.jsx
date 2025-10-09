import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'Player':
          navigate('/dashboard/player', { replace: true })
          break
        case 'Academy':
          navigate('/dashboard/academy', { replace: true })
          break
        case 'Club':
          navigate('/dashboard/club', { replace: true })
          break
        case 'Scout':
          navigate('/dashboard/scout', { replace: true })
          break
        default:
          navigate('/profile', { replace: true })
      }
    } else {
      navigate('/login', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  )
}
