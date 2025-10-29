import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  User, 
  Moon, 
  Sun, 
  Monitor,
  Save,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  Languages,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'
import { useToast } from '../components/ui/simple-toast'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Settings() {
  console.log('Settings component rendering')
  
  const { user } = useAuth()
  const { toast } = useToast()
  const { theme, primaryColor, accentColor, setTheme, setPrimaryColor, setAccentColor } = useTheme()
  
  console.log('Settings hooks loaded:', { user, theme, primaryColor, accentColor })
  
  // Website settings
  const [websiteName, setWebsiteName] = useState('SportsInn')
  const [websiteDescription, setWebsiteDescription] = useState('Connect with sports professionals worldwide')
  const [websiteLogo, setWebsiteLogo] = useState('')
  const [websiteFavicon, setWebsiteFavicon] = useState('')
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(false)
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('public')
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showLocation, setShowLocation] = useState(true)
  
  // Language and region
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
  const [timeFormat, setTimeFormat] = useState('12h')
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Color options
  const colorOptions = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Teal', value: 'teal', class: 'bg-teal-500' }
  ]

  const accentColorOptions = [
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
    { name: 'Violet', value: 'violet', class: 'bg-violet-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { name: 'Lime', value: 'lime', class: 'bg-lime-500' },
    { name: 'Sky', value: 'sky', class: 'bg-sky-500' },
    { name: 'Fuchsia', value: 'fuchsia', class: 'bg-fuchsia-500' }
  ]

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} theme`,
      variant: "default"
    })
  }

  // Handle color change
  const handleColorChange = (type, color) => {
    if (type === 'primary') {
      setPrimaryColor(color)
    } else {
      setAccentColor(color)
    }
    
    toast({
      title: "Color updated",
      description: `${type} color changed to ${color}`,
      variant: "default"
    })
  }

  // Save all settings
  const handleSaveSettings = async () => {
    setIsSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage for now
      const settings = {
        theme,
        primaryColor,
        accentColor,
        websiteName,
        websiteDescription,
        websiteLogo,
        websiteFavicon,
        emailNotifications,
        pushNotifications,
        smsNotifications,
        marketingEmails,
        profileVisibility,
        showEmail,
        showPhone,
        showLocation,
        language,
        timezone,
        dateFormat,
        timeFormat
      }
      
      localStorage.setItem('appSettings', JSON.stringify(settings))
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Unable to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to defaults
  const handleResetSettings = () => {
    setTheme('system')
    setPrimaryColor('blue')
    setAccentColor('emerald')
    setWebsiteName('SportsInn')
    setWebsiteDescription('Connect with sports professionals worldwide')
    setEmailNotifications(true)
    setPushNotifications(true)
    setSmsNotifications(false)
    setMarketingEmails(false)
    setProfileVisibility('public')
    setShowEmail(false)
    setShowPhone(false)
    setShowLocation(true)
    setLanguage('en')
    setTimezone('UTC')
    setDateFormat('MM/DD/YYYY')
    setTimeFormat('12h')
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
      variant: "default"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your SportsInn experience
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-blue-500" />
                    <span>Theme & Appearance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Theme Mode
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', icon: Sun, label: 'Light' },
                        { value: 'dark', icon: Moon, label: 'Dark' },
                        { value: 'system', icon: Monitor, label: 'System' }
                      ].map(({ value, icon: Icon, label }) => (
                        <Button
                          key={value}
                          variant={theme === value ? 'default' : 'outline'}
                          onClick={() => handleThemeChange(value)}
                          className={`flex items-center space-x-2 ${
                            theme === value 
                              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white' 
                              : ''
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Primary Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map(({ name, value, class: colorClass }) => (
                        <Button
                          key={value}
                          variant="outline"
                          onClick={() => handleColorChange('primary', value)}
                          className={`flex items-center space-x-2 ${
                            primaryColor === value 
                              ? 'ring-2 ring-blue-500 ring-offset-2' 
                              : ''
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                          <span className="text-xs">{name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Accent Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {accentColorOptions.map(({ name, value, class: colorClass }) => (
                        <Button
                          key={value}
                          variant="outline"
                          onClick={() => handleColorChange('accent', value)}
                          className={`flex items-center space-x-2 ${
                            accentColor === value 
                              ? 'ring-2 ring-blue-500 ring-offset-2' 
                              : ''
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                          <span className="text-xs">{name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Website Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span>Website Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website Name
                    </label>
                    <Input
                      value={websiteName}
                      onChange={(e) => setWebsiteName(e.target.value)}
                      placeholder="Enter website name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website Description
                    </label>
                    <Input
                      value={websiteDescription}
                      onChange={(e) => setWebsiteDescription(e.target.value)}
                      placeholder="Enter website description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Logo URL
                      </label>
                      <Input
                        value={websiteLogo}
                        onChange={(e) => setWebsiteLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Favicon URL
                      </label>
                      <Input
                        value={websiteFavicon}
                        onChange={(e) => setWebsiteFavicon(e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Push Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        SMS Notifications
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Marketing Emails
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive promotional emails and updates
                      </p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Visibility
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'public', label: 'Public', icon: Eye },
                        { value: 'friends', label: 'Friends Only', icon: User },
                        { value: 'private', label: 'Private', icon: EyeOff }
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={profileVisibility === value ? 'default' : 'outline'}
                          onClick={() => setProfileVisibility(value)}
                          className={`flex items-center space-x-2 ${
                            profileVisibility === value 
                              ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white' 
                              : ''
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Show Email Address
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Display your email on your profile
                        </p>
                      </div>
                      <Switch
                        checked={showEmail}
                        onCheckedChange={setShowEmail}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Show Phone Number
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Display your phone number on your profile
                        </p>
                      </div>
                      <Switch
                        checked={showPhone}
                        onCheckedChange={setShowPhone}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Show Location
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Display your location on your profile
                        </p>
                      </div>
                      <Switch
                        checked={showLocation}
                        onCheckedChange={setShowLocation}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Language & Region */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Languages className="w-5 h-5 text-blue-500" />
                    <span>Language & Region</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Asia/Shanghai">Shanghai</option>
                      <option value="Australia/Sydney">Sydney</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date Format
                      </label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time Format
                      </label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        value={timeFormat}
                        onChange={(e) => setTimeFormat(e.target.value)}
                      >
                        <option value="12h">12 Hour</option>
                        <option value="24h">24 Hour</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleResetSettings}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </motion.div>

            {/* Current User Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-500" />
                    <span>Current User</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-sm font-medium">{user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="text-sm font-medium">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
                      <Badge variant="secondary">{user?.role || 'N/A'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
