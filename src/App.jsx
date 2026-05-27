// BrowserRouter — enables URL-based navigation
// Routes — container for all route definitions
// Route — maps a URL path to a component
// Navigate — redirects to another URL
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Import all pages (we'll create these next)
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import QuizPage from './pages/QuizPage'
import ResumePage from './pages/ResumePage'
import InterviewPage from './pages/InterviewPage'
import SkillGapPage from './pages/SkillGapPage'
import LeaderboardPage from './pages/LeaderboardPage'
import NotesPage from './pages/NotesPage'
import Layout from './components/Layout'

// ProtectedRoute — wraps pages that need login
// If not logged in, redirects to /login automatically
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Show spinner while checking localStorage
  if (loading) return (
    <div className="flex items-center justify-center h-screen
      bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-10 w-10
        border-4 border-primary-500 border-t-transparent"/>
    </div>
  )

  // If user is logged in show the page, otherwise redirect
  return user
    ? children
    : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes — no login needed */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — Login required */}
        {/* Layout contains the sidebar — all pages share it */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* index = default page when URL is exactly "/" */}
          <Route index element={<DashboardPage />} />
          <Route path="chat"        element={<ChatPage />} />
          <Route path="quiz"        element={<QuizPage />} />
          <Route path="resume"      element={<ResumePage />} />
          <Route path="interview"   element={<InterviewPage />} />
          <Route path="skillgap"    element={<SkillGapPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="notes"       element={<NotesPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}