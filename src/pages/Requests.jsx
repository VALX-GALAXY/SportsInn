import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import requestService from '@/api/requestService'
import { Badge } from '@/components/ui/badge'
import { Check, X, Mail } from 'lucide-react'

export default function Requests() {
  const [data, setData] = useState({ sent: [], received: [] })

  const refresh = () => setData(requestService.list())

  useEffect(() => {
    refresh()
  }, [])

  const handleAction = (id, status) => {
    requestService.updateStatus(id, status)
    refresh()
  }

  const Item = ({ r }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 space-y-3 sm:space-y-0">
      <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
        <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 sm:w-4 sm:h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
            <span className="font-medium text-sm sm:text-base">{r.type === 'invite' ? 'Invite' : 'Application'}</span>
            <Badge variant="secondary" className="text-xs w-fit">{r.status}</Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{r.message}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:ml-4">
        {r.status === 'pending' && (
          <>
            <Button 
              size="sm" 
              onClick={() => handleAction(r.id, 'accepted')} 
              className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none"
            >
              <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 
              <span className="hidden xs:inline">Accept</span>
              <span className="xs:hidden">✓</span>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleAction(r.id, 'rejected')}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 
              <span className="hidden xs:inline">Reject</span>
              <span className="xs:hidden">✗</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="px-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Requests</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Track sent and received invites/applications</p>
        </div>

        {/* Received Requests */}
        <Card className="border border-white/20 bg-white/10 dark:bg-slate-950/10 backdrop-blur-lg shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Received Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {data.received.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Mail className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No received requests yet.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {data.received.map(r => <Item key={r.id} r={r} />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sent Requests */}
        <Card className="border border-white/20 bg-white/10 dark:bg-slate-950/10 backdrop-blur-lg shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Sent Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {data.sent.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Mail className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">No sent requests yet.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {data.sent.map(r => <Item key={r.id} r={r} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


