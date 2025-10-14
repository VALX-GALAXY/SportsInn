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
import Tournaments from './pages/Tournaments'
import TournamentDetails from './pages/TournamentDetails'
import Dashboard from './pages/Dashboard'
import PlayerDashboard from './pages/dashboard/PlayerDashboard'
import AcademyDashboard from './pages/dashboard/AcademyDashboard'
import ClubDashboard from './pages/dashboard/ClubDashboard'
import ScoutDashboard from './pages/dashboard/ScoutDashboard'
import TestConnection from './pages/TestConnection'
import './App.css'

// Layout component for authenticated users
function AuthenticatedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar at the top */}
      <ErrorBoundary>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      </ErrorBoundary>
      
      {/* Main content area */}
      <div className="flex min-h-screen pt-16">
        <ErrorBoundary>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </ErrorBoundary>
        <div className="flex-1 min-w-0">
          <main className="min-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 pt-6">
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
      <div className="min-h-screen pt-16">
        <div className="p-4 pt-6">
          {children}
        </div>
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
      <Route path="/tournaments" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Tournaments />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/tournaments/:id" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <TournamentDetails />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/dashboard" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/dashboard/player" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <PlayerDashboard />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/dashboard/academy" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <AcademyDashboard />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/dashboard/club" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <ClubDashboard />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/dashboard/scout" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <ScoutDashboard />
          </ErrorBoundary>
        </AuthenticatedLayout>
      } />
      <Route path="/test-connection" element={
        <AuthenticatedLayout>
          <ErrorBoundary>
            <TestConnection />
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
