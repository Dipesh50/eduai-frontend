import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

// ReactDOM.createRoot — mounts the React app into index.html's <div id="root">
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ThemeProvider must be outermost so dark mode works everywhere */}
    <ThemeProvider>
      {/* AuthProvider wraps everything so login state is global */}
      <AuthProvider>
        {/* App contains all pages and routing */}
        <App />
        {/* Toaster renders success/error popup notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
            }
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)