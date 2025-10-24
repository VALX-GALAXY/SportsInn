import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system')
  const [primaryColor, setPrimaryColor] = useState('blue')
  const [accentColor, setAccentColor] = useState('emerald')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system'
    const savedPrimaryColor = localStorage.getItem('primaryColor') || 'blue'
    const savedAccentColor = localStorage.getItem('accentColor') || 'emerald'
    
    setTheme(savedTheme)
    setPrimaryColor(savedPrimaryColor)
    setAccentColor(savedAccentColor)
    
    // Apply theme immediately
    applyTheme(savedTheme)
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else if (newTheme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  // Apply color theme to document
  const applyColorTheme = (primaryColor, accentColor) => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange', 'theme-pink', 'theme-indigo', 'theme-teal')
    
    // Add new theme class
    root.classList.add(`theme-${primaryColor}`)
  }

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  // Handle color change
  const handleColorChange = (type, color) => {
    if (type === 'primary') {
      setPrimaryColor(color)
      localStorage.setItem('primaryColor', color)
      applyColorTheme(color, accentColor)
    } else {
      setAccentColor(color)
      localStorage.setItem('accentColor', color)
      applyColorTheme(primaryColor, color)
    }
  }

  // Apply color theme on mount
  useEffect(() => {
    applyColorTheme(primaryColor, accentColor)
  }, [primaryColor, accentColor])

  // Get current theme classes
  const getThemeClasses = () => {
    return {
      primary: `from-${primaryColor}-500 to-${accentColor}-500`,
      primaryHover: `from-${primaryColor}-600 to-${accentColor}-600`,
      primaryBg: `bg-${primaryColor}-500`,
      primaryText: `text-${primaryColor}-500`,
      primaryBorder: `border-${primaryColor}-500`,
      accent: `bg-${accentColor}-500`,
      accentText: `text-${accentColor}-500`
    }
  }

  const value = {
    theme,
    primaryColor,
    accentColor,
    setTheme: handleThemeChange,
    setPrimaryColor: (color) => handleColorChange('primary', color),
    setAccentColor: (color) => handleColorChange('accent', color),
    getThemeClasses
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
