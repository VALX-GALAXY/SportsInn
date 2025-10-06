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
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{r.type === 'invite' ? 'Invite' : 'Application'}</span>
            <Badge variant="secondary" className="text-xs">{r.status}</Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{r.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {r.status === 'pending' && (
          <>
            <Button size="sm" onClick={() => handleAction(r.id, 'accepted')} className="bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-4 h-4 mr-1" /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction(r.id, 'rejected')}>
              <X className="w-4 h-4 mr-1" /> Reject
            </Button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Requests</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track sent and received invites/applications</p>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Received</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.received.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No received requests yet.</p>
            ) : data.received.map(r => <Item key={r.id} r={r} />)}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Sent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.sent.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No sent requests yet.</p>
            ) : data.sent.map(r => <Item key={r.id} r={r} />)}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


