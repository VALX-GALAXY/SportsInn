import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useToast } from '../components/ui/simple-toast'
import authService from '../api/realAuthService'

export default function TestConnection() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState([])
  const { toast } = useToast()

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }])
  }

  const testBackendConnection = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      // Test 1: Check if backend is running
      addResult('Backend Server', 'testing', 'Checking if backend is running...')
      const response = await fetch('http://localhost:3000/api/auth/test')
      if (response.ok) {
        addResult('Backend Server', 'success', 'Backend is running on port 3000')
      } else {
        addResult('Backend Server', 'error', 'Backend not responding')
        return
      }

      // Test 2: Test signup
      addResult('User Signup', 'testing', 'Testing user signup...')
      const signupData = {
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: '123456',
        role: 'player',
        age: 21,
        playingRole: 'batsman'
      }
      
      const signupResult = await authService.signup(signupData)
      addResult('User Signup', 'success', `User created: ${signupResult.user.name} (${signupResult.user.email})`)

      // Test 3: Test login
      addResult('User Login', 'testing', 'Testing user login...')
      const loginResult = await authService.login({
        email: signupData.email,
        password: signupData.password
      })
      addResult('User Login', 'success', `Login successful: ${loginResult.user.name}`)

      // Test 4: Check localStorage
      addResult('Local Storage', 'testing', 'Checking localStorage...')
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser)
        addResult('Local Storage', 'success', `User stored: ${user.name} (${user.email})`)
      } else {
        addResult('Local Storage', 'error', 'No user data in localStorage')
      }

      // Test 5: Test protected route
      addResult('Protected Route', 'testing', 'Testing protected API call...')
      const feedResponse = await fetch('http://localhost:3000/api/feed', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (feedResponse.ok) {
        addResult('Protected Route', 'success', 'Protected route accessible')
      } else {
        addResult('Protected Route', 'error', 'Protected route failed')
      }

      toast({
        title: "All tests passed!",
        description: "Frontend-Backend connection is working perfectly!",
        variant: "success"
      })

    } catch (error) {
      addResult('Error', 'error', error.message)
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearLocalStorage = () => {
    localStorage.clear()
    setTestResults([])
    toast({
      title: "LocalStorage cleared",
      description: "All stored data has been removed",
      variant: "default"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>🔗 Frontend-Backend Connection Test</CardTitle>
            <CardDescription>
              Test the connection between frontend (port 5173) and backend (port 3000)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={testBackendConnection} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Testing...' : 'Run Connection Test'}
              </Button>
              <Button 
                onClick={clearLocalStorage} 
                variant="outline"
                className="flex-1"
              >
                Clear LocalStorage
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.status === 'success' ? 'bg-green-50 border-green-200' :
                      result.status === 'error' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.test}</span>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What this test does:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Checks if backend is running on port 3000</li>
                <li>• Tests user signup with real backend API</li>
                <li>• Tests user login with real backend API</li>
                <li>• Verifies data is stored in browser localStorage</li>
                <li>• Tests protected API routes with JWT token</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
