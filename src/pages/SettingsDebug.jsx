import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../components/ui/simple-toast'

export default function SettingsDebug() {
  const [debugInfo, setDebugInfo] = useState({})
  const { user, isAuthenticated } = useAuth()
  const { theme, primaryColor, accentColor } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    console.log('SettingsDebug: Component mounted')
    console.log('SettingsDebug: User:', user)
    console.log('SettingsDebug: IsAuthenticated:', isAuthenticated)
    console.log('SettingsDebug: Theme:', theme)
    console.log('SettingsDebug: PrimaryColor:', primaryColor)
    console.log('SettingsDebug: AccentColor:', accentColor)

    setDebugInfo({
      user: user ? 'Present' : 'Missing',
      isAuthenticated,
      theme,
      primaryColor,
      accentColor,
      timestamp: new Date().toISOString()
    })
  }, [user, isAuthenticated, theme, primaryColor, accentColor])

  const testToast = () => {
    toast({
      title: "Test Toast",
      description: "This is a test toast message",
      variant: "default"
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Settings Debug Page
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Context Tests</h2>
          <div className="space-y-2">
            <p>User: {user ? `${user.name} (${user.email})` : 'Not logged in'}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Theme: {theme}</p>
            <p>Primary Color: {primaryColor}</p>
            <p>Accent Color: {accentColor}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            onClick={testToast}
          >
            Test Toast
          </button>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => console.log('Console test - check browser console')}
          >
            Console Test
          </button>
        </div>
      </div>
    </div>
  )
}
