import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './components/ui/simple-toast'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Feed from './pages/Feed'
import Notifications from './pages/Notifications'
import Search from './pages/Search'
import Messages from './pages/Messages'
import Requests from './pages/Requests'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <ErrorBoundary>
                <Navbar />
              </ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={
                  <ErrorBoundary>
                    <Login />
                  </ErrorBoundary>
                } />
                <Route path="/signup" element={
                  <ErrorBoundary>
                    <Signup />
                  </ErrorBoundary>
                } />
                <Route path="/profile" element={
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                } />
                <Route path="/feed" element={
                  <ErrorBoundary>
                    <Feed />
                  </ErrorBoundary>
                } />
                <Route path="/notifications" element={
                  <ErrorBoundary>
                    <Notifications />
                  </ErrorBoundary>
                } />
                <Route path="/search" element={
                  <ErrorBoundary>
                    <Search />
                  </ErrorBoundary>
                } />
                <Route path="/messages" element={
                  <ErrorBoundary>
                    <Messages />
                  </ErrorBoundary>
                } />
                <Route path="/requests" element={
                  <ErrorBoundary>
                    <Requests />
                  </ErrorBoundary>
                } />
              </Routes>
            </div>
          </Router>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
