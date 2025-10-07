import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './components/ui/simple-toast'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Feed from './pages/Feed'
import Notifications from './pages/Notifications'
import Search from './pages/Search'
import Messages from './pages/Messages'
import Requests from './pages/Requests'
import './App.css'

// Layout component for authenticated users
function AuthenticatedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <ErrorBoundary>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </ErrorBoundary>
        <div className="flex-1 flex flex-col lg:ml-64">
          <ErrorBoundary>
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
          </ErrorBoundary>
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// Layout component for unauthenticated users
function UnauthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  )
}

// Main app routes component
function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={
        <UnauthenticatedLayout>
          <ErrorBoundary>
            <Login />
          </ErrorBoundary>
        </UnauthenticatedLayout>
      } />
      <Route path="/signup" element={
        <UnauthenticatedLayout>
          <ErrorBoundary>
            <Signup />
          </ErrorBoundary>
        </UnauthenticatedLayout>
      } />
      <Route path="/profile" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Profile />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/feed" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Feed />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/notifications" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Notifications />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/search" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Search />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/messages" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Messages />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/requests" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Requests />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes />
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
