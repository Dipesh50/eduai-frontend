import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboard } from '../api/userApi'
import { getQuizHistory } from '../api/quizApi'
import { checkIn, getStreakStatus } from '../api/streakApi'
import toast from 'react-hot-toast'
import {
  BookOpen, Flame, StickyNote, Calendar,
  MessageSquare, FileText, Mic, Target,
  ChevronRight, Trophy, TrendingUp,
  CheckCircle2, Clock, Zap
} from 'lucide-react'

// ── Stat Card Component ────────────────────────────────
// Defined outside to prevent re-creation on every render
const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6
    border border-gray-100 dark:border-gray-800
    shadow-sm hover:shadow-md transition-shadow duration-200">

    <div className="flex items-center justify-between mb-4">
      {/* Icon circle with color */}
      <div className={`w-12 h-12 ${bg} rounded-xl
        flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      {/* Trending up indicator */}
      <TrendingUp className="w-4 h-4 text-gray-300
        dark:text-gray-600" />
    </div>

    {/* Value — show skeleton while loading */}
    {loading ? (
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700
        rounded-lg animate-pulse mb-1" />
    ) : (
      <p className="text-3xl font-bold text-gray-900
        dark:text-white mb-1">
        {value}
      </p>
    )}

    <p className="text-sm text-gray-500 dark:text-gray-400">
      {label}
    </p>
  </div>
)

// ── Quick Action Button ────────────────────────────────
const QuickAction = ({ icon: Icon, label, desc, color, bg, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 w-full
      bg-white dark:bg-gray-900 rounded-xl
      border border-gray-100 dark:border-gray-800
      hover:border-primary-200 dark:hover:border-primary-800
      hover:shadow-md transition-all duration-200 text-left group">

    <div className={`w-10 h-10 ${bg} rounded-xl
      flex items-center justify-center flex-shrink-0
      group-hover:scale-110 transition-transform duration-200`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900
        dark:text-white">{label}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400
        truncate">{desc}</p>
    </div>

    <ChevronRight className="w-4 h-4 text-gray-300
      dark:text-gray-600 group-hover:text-primary-500
      group-hover:translate-x-0.5 transition-all duration-200
      flex-shrink-0" />
  </button>
)

// ── Grade Badge ────────────────────────────────────────
const GradeBadge = ({ grade }) => {
  const colors = {
    'A+': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'A':  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'B':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'C':  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'F':  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold
      ${colors[grade] || colors['C']}`}>
      {grade}
    </span>
  )
}

// ── Main Dashboard Component ───────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State for all data
  const [dashboard, setDashboard]       = useState(null)
  const [quizHistory, setQuizHistory]   = useState([])
  const [streakStatus, setStreakStatus] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [checkingIn, setCheckingIn]     = useState(false)

  // ── Load all data on page open ─────────────────────
  useEffect(() => {
    loadDashboard()
  }, []) // [] = run once when page loads

  const loadDashboard = async () => {
    setLoading(true)
    try {
      // Run all 3 API calls at same time (faster than one by one)
      const [dashRes, quizRes, streakRes] = await Promise.all([
        getDashboard(),
        getQuizHistory(),
        getStreakStatus()
      ])
      setDashboard(dashRes.data)
      // Only show last 5 quiz results
      setQuizHistory(quizRes.data?.slice(0, 5) || [])
      setStreakStatus(streakRes.data)
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Daily check-in ─────────────────────────────────
  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const res = await checkIn()
      setStreakStatus(res.data)
      // Update streak in dashboard stats
      setDashboard(prev => ({
        ...prev,
        currentStreak: res.data.currentStreak
      }))
      toast.success(res.data.message || 'Checked in! 🔥')
    } catch (err) {
      toast.error('Check-in failed')
    } finally {
      setCheckingIn(false)
    }
  }

  // ── Get greeting based on time of day ─────────────
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // ── Format date ────────────────────────────────────
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // ── Stats data ─────────────────────────────────────
  const stats = [
    {
      icon: BookOpen,
      label: 'Quizzes Taken',
      value: dashboard?.quizzesTaken ?? 0,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30'
    },
    {
      icon: Flame,
      label: 'Day Streak',
      value: dashboard?.currentStreak ?? 0,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/30'
    },
    {
      icon: StickyNote,
      label: 'Notes Saved',
      value: dashboard?.notesCount ?? 0,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30'
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: dashboard?.memberSince ?? '--',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30'
    },
  ]

  // ── Quick actions ──────────────────────────────────
  const quickActions = [
    {
      icon: BookOpen,
      label: 'Start Quiz',
      desc: 'Test your knowledge on Java, DSA, SQL',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      path: '/quiz'
    },
    {
      icon: FileText,
      label: 'Analyze Resume',
      desc: 'Get ATS score and improvement tips',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30',
      path: '/resume'
    },
    {
      icon: Mic,
      label: 'Mock Interview',
      desc: 'Practice with AI interviewer',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      path: '/interview'
    },
    {
      icon: Target,
      label: 'Skill Gap Check',
      desc: 'See what skills you need for your dream role',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30',
      path: '/skillgap'
    },
    {
      icon: MessageSquare,
      label: 'AI Chatbot',
      desc: 'Ask anything about programming',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      path: '/chat'
    },
    {
      icon: Trophy,
      label: 'Leaderboard',
      desc: 'See how you rank against others',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      path: '/leaderboard'
    },
  ]

  // ── UI ─────────────────────────────────────────────
  return (
    // p-6 = padding on all sides
    // max-w-7xl = limits width on very large screens
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Header section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center
        sm:justify-between gap-4 mb-8">

        <div>
          {/* Greeting with user name */}
          {loading ? (
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700
              rounded-lg animate-pulse mb-2" />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900
              dark:text-white">
              {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400
            mt-0.5">
            {formatDate()}
          </p>
        </div>

        {/* ── Streak check-in button ── */}
        {streakStatus && (
          <div className="flex items-center gap-3">

            {/* Current streak display */}
            <div className="flex items-center gap-2 px-4 py-2
              bg-orange-50 dark:bg-orange-900/20 rounded-xl
              border border-orange-200 dark:border-orange-800">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold
                text-orange-700 dark:text-orange-400">
                {streakStatus.currentStreak} day streak
              </span>
            </div>

            {/* Check-in button — disabled if already checked in */}
            {streakStatus.checkedInToday ? (
              <div className="flex items-center gap-2 px-4 py-2
                bg-green-50 dark:bg-green-900/20 rounded-xl
                border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium
                  text-green-700 dark:text-green-400">
                  Checked in!
                </span>
              </div>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="flex items-center gap-2 px-4 py-2
                  bg-primary-500 hover:bg-primary-600
                  text-white rounded-xl text-sm font-medium
                  shadow-sm shadow-primary-500/25
                  disabled:opacity-60 transition-all duration-150
                  animate-pulse hover:animate-none">
                <Zap className="w-4 h-4" />
                {checkingIn ? 'Checking in...' : 'Check in today'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Stats cards row ── */}
      {/* grid-cols-2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Main content: 2 columns on large screens ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column: Quick actions (takes 2/3 width) ── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-2xl
            border border-gray-100 dark:border-gray-800
            shadow-sm p-6">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900
                dark:text-white">
                Quick Actions
              </h2>
              <Zap className="w-5 h-5 text-primary-500" />
            </div>

            {/* 2 column grid of action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <QuickAction
                  key={action.label}
                  {...action}
                  onClick={() => navigate(action.path)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column: Recent quiz results (1/3 width) ── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl
            border border-gray-100 dark:border-gray-800
            shadow-sm p-6 h-full">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900
                dark:text-white">
                Recent Quizzes
              </h2>
              <button
                onClick={() => navigate('/quiz')}
                className="text-xs text-primary-600
                  dark:text-primary-400 font-medium
                  hover:underline">
                View all
              </button>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-gray-100
                    dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>

            ) : quizHistory.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center
                justify-center py-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-300
                  dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500
                  dark:text-gray-400">
                  No quizzes yet
                </p>
                <p className="text-xs text-gray-400
                  dark:text-gray-500 mt-1">
                  Take your first quiz!
                </p>
                <button
                  onClick={() => navigate('/quiz')}
                  className="mt-4 px-4 py-2 bg-primary-500
                    text-white rounded-xl text-xs font-medium
                    hover:bg-primary-600 transition-colors">
                  Start Quiz
                </button>
              </div>

            ) : (
              // Quiz history list
              <div className="space-y-3">
                {quizHistory.map((quiz, index) => (
                  <div key={index}
                    className="flex items-center gap-3 p-3
                      bg-gray-50 dark:bg-gray-800 rounded-xl">

                    {/* Score percentage circle */}
                    <div className={`w-10 h-10 rounded-xl flex
                      items-center justify-center flex-shrink-0
                      text-xs font-bold
                      ${quiz.scorePercentage >= 80
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : quiz.scorePercentage >= 60
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                      {Math.round(quiz.scorePercentage)}%
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium
                        text-gray-900 dark:text-white truncate">
                        {quiz.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500
                          dark:text-gray-400">
                          {quiz.correctAnswers}/{quiz.totalQuestions} correct
                        </p>
                      </div>
                    </div>

                    {/* Grade badge */}
                    <GradeBadge grade={quiz.grade || 'C'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Progress summary bar ── */}
      {!loading && dashboard && (
        <div className="mt-6 bg-gradient-to-r from-primary-500
          to-indigo-600 rounded-2xl p-6 text-white">

          <div className="flex flex-col sm:flex-row
            sm:items-center sm:justify-between gap-4">

            <div>
              <h3 className="font-bold text-lg mb-1">
                Keep up the great work! 🚀
              </h3>
              <p className="text-primary-100 text-sm">
                You have taken {dashboard.quizzesTaken} quizzes
                and saved {dashboard.notesCount} notes.
                {dashboard.currentStreak > 0
                  ? ` Your ${dashboard.currentStreak}-day streak is amazing!`
                  : ' Start a streak by checking in daily!'}
              </p>
            </div>

            <button
              onClick={() => navigate('/quiz')}
              className="flex items-center gap-2 px-5 py-2.5
                bg-white/20 hover:bg-white/30 backdrop-blur-sm
                rounded-xl text-sm font-semibold
                border border-white/30 transition-colors
                whitespace-nowrap self-start sm:self-auto">
              Continue Learning
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

    </div>
  )
}