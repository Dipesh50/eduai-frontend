import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  FileText,
  Mic,
  Target,
  Trophy,
  StickyNote,
  LogOut,
  Sun,
  Moon,
  GraduationCap,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/chat',        icon: MessageSquare,   label: 'AI Chatbot'     },
  { to: '/quiz',        icon: BookOpen,        label: 'Quiz'           },
  { to: '/resume',      icon: FileText,        label: 'Resume'         },
  { to: '/interview',   icon: Mic,             label: 'Mock Interview' },
  { to: '/skillgap',    icon: Target,          label: 'Skill Gap'      },
  { to: '/leaderboard', icon: Trophy,          label: 'Leaderboard'    },
  { to: '/notes',       icon: StickyNote,      label: 'Notes'          },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-full
          w-64 bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          flex flex-col flex-shrink-0
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >

        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 py-5
          border-b border-gray-200 dark:border-gray-800"
        >

          <div
            className="w-9 h-9 bg-primary-500 rounded-xl
            flex items-center justify-center shadow-sm"
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <span
            className="text-xl font-bold
            text-primary-600 dark:text-primary-400"
          >
            EduAI
          </span>

          {/* Close Button Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-auto"
          >
            <X className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

          {navItems.map(({ to, icon: Icon, label }) => (

            <NavLink
              key={to}
              to={to}
              end={to === '/'}

              onClick={() => setSidebarOpen(false)}

              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>

          ))}

        </nav>

        {/* Bottom Section */}
        <div
          className="px-3 py-4 border-t border-gray-200
          dark:border-gray-800 space-y-1"
        >

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2">

            <div
              className="w-8 h-8 bg-primary-100 dark:bg-primary-900
              rounded-full flex items-center justify-center
              text-sm font-bold text-primary-600 dark:text-primary-400
              flex-shrink-0"
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">

              <p
                className="text-sm font-semibold text-gray-900
                dark:text-gray-100 truncate"
              >
                {user?.name}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>

            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2
            rounded-xl text-sm text-gray-600 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >

            {dark
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }

            {dark ? 'Light mode' : 'Dark mode'}

          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2
            rounded-xl text-sm text-red-500 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >

            <LogOut className="w-4 h-4" />
            Logout

          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Header */}
        <div
          className="md:hidden flex items-center justify-between
          px-4 py-3 bg-white dark:bg-gray-900 border-b
          border-gray-200 dark:border-gray-800"
        >

          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>

          <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">
            EduAI
          </h1>

          <div className="w-6" />

        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>

      </div>

    </div>
  )
}