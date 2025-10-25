import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { 
  AlertTriangle, 
  Database, 
  RefreshCw, 
  Info,
  ExternalLink
} from 'lucide-react'

export default function NoApiAvailable({ 
  title = "Dashboard API Not Available", 
  description = "The backend API for dashboard data is not available. Showing mock data for demonstration purposes.",
  onRetry = null,
  showMockDataInfo = true 
}) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* API Status Alert */}
      <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                {title}
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-orange-700 dark:text-orange-300">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Backend API: Not Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>Data Source: Mock Data</span>
              </div>
            </div>
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline" 
                size="sm"
                className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mock Data Information */}
      {showMockDataInfo && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Mock Data Information
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  The dashboard is currently displaying mock data for demonstration purposes.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What's Mock:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Tournament participation charts</li>
                  <li>• Performance over time data</li>
                  <li>• Connection breakdowns</li>
                  <li>• Monthly analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What Would Be Real:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Tournament applications count</li>
                  <li>• Acceptance rates</li>
                  <li>• Connection counts</li>
                  <li>• User statistics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Development Information */}
      <Card className="border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <ExternalLink className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Development Mode
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                This dashboard is running in development mode with mock data.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="mb-2">
              To connect to a real backend API, ensure:
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Backend server is running and accessible</li>
              <li>• Dashboard API endpoints are implemented</li>
              <li>• User authentication is working</li>
              <li>• Database contains user data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
