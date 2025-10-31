import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Test environment variables on startup
console.log('🔍 Environment Variables Check:')
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
console.log('VITE_ENV:', import.meta.env.VITE_ENV)
console.log('MODE:', import.meta.env.MODE)
console.log('DEV:', import.meta.env.DEV)
console.log('PROD:', import.meta.env.PROD)
console.log('All env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')))

if (import.meta.env.VITE_API_URL !== 'http://localhost:3000') {
  console.error('❌ WARNING: VITE_API_URL is NOT localhost:3000!')
  console.error('Current value:', import.meta.env.VITE_API_URL)
  console.error('Please restart your dev server after updating .env file!')
}

if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  console.error('❌ ERROR: VITE_GOOGLE_CLIENT_ID is not loaded!')
  console.error('Please check your .env file and restart the dev server.')
} else {
  console.log('✅ VITE_GOOGLE_CLIENT_ID is loaded correctly!')
}

// Unregister all service workers in development to avoid caching issues
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('🔧 Unregistered service worker in development:', registration.scope);
    });
  });
}

// Register service worker for PWA only in production to avoid dev caching issues
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
