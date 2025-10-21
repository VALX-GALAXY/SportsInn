import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Server, 
  Database, 
  Wifi, 
  WifiOff,
  RefreshCw
} from 'lucide-react'
import { useToast } from '../components/ui/simple-toast'

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState({
    backend: 'checking',
    database: 'checking',
    api: 'checking'
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const testConnections = async () => {
    setIsLoading(true)
    setConnectionStatus({
      backend: 'checking',
      database: 'checking',
      api: 'checking'
    })

    try {
      // Test backend connection
      const backendResponse = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (backendResponse.ok) {
        setConnectionStatus(prev => ({ ...prev, backend: 'connected' }))
      } else {
        setConnectionStatus(prev => ({ ...prev, backend: 'error' }))
      }
    } catch (error) {
      console.error('Backend connection error:', error)
      setConnectionStatus(prev => ({ ...prev, backend: 'error' }))
    }

    try {
      // Test database connection (through backend)
      const dbResponse = await fetch('http://localhost:3000/api/test-db', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (dbResponse.ok) {
        setConnectionStatus(prev => ({ ...prev, database: 'connected' }))
      } else {
        setConnectionStatus(prev => ({ ...prev, database: 'error' }))
      }
    } catch (error) {
      console.error('Database connection error:', error)
      setConnectionStatus(prev => ({ ...prev, database: 'error' }))
    }

    try {
      // Test API endpoints
      const apiResponse = await fetch('http://localhost:3000/api/tournaments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (apiResponse.ok) {
        setConnectionStatus(prev => ({ ...prev, api: 'connected' }))
      } else {
        setConnectionStatus(prev => ({ ...prev, api: 'error' }))
      }
    } catch (error) {
      console.error('API connection error:', error)
      setConnectionStatus(prev => ({ ...prev, api: 'error' }))
    }

    setIsLoading(false)
  }

  useEffect(() => {
    testConnections()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <WifiOff className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800">Checking...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const allConnected = Object.values(connectionStatus).every(status => status === 'connected')
  const hasErrors = Object.values(connectionStatus).some(status => status === 'error')

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Connection Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test the connection status of backend services and database
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Backend Connection */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Backend Server</h3>
              </div>
              {getStatusIcon(connectionStatus.backend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Express.js server running on port 3000
              </p>
              {getStatusBadge(connectionStatus.backend)}
            </div>
          </CardContent>
        </Card>

        {/* Database Connection */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Database</h3>
              </div>
              {getStatusIcon(connectionStatus.database)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                MongoDB connection status
              </p>
              {getStatusBadge(connectionStatus.database)}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">API Endpoints</h3>
              </div>
              {getStatusIcon(connectionStatus.api)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                REST API endpoints availability
              </p>
              {getStatusBadge(connectionStatus.api)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Overall Status</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {allConnected ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    All systems operational
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Backend, database, and API are all connected and working properly.
                  </p>
                </div>
              </>
            ) : hasErrors ? (
              <>
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">
                    Connection issues detected
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Some services are not responding. Check the individual status cards above.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    Testing connections...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please wait while we check all service connections.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button 
          onClick={testConnections}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </Button>
        
        {hasErrors && (
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Troubleshooting Tips",
                description: "Make sure the backend server is running on port 3000 and MongoDB is connected.",
                variant: "default"
              })
            }}
          >
            Get Help
          </Button>
        )}
      </div>
    </div>
  )
}
