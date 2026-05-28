// useState — stores form data and UI states
// useNavigate — programmatically redirect to another page
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginApi } from '../api/authApi'
import toast from 'react-hot-toast'

// Icons from lucide-react
import {
  GraduationCap, Mail, Lock,
  Eye, EyeOff, Loader2, ArrowRight
} from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // ── Form state ─────────────────────────────────────
  // Stores what user types in email and password fields
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  // Controls showing/hiding password text
  const [showPassword, setShowPassword] = useState(false)

  // True while waiting for API response (shows spinner)
  const [loading, setLoading] = useState(false)

  // Stores error message to show under the form
  const [error, setError] = useState('')

  // ── Handle input changes ───────────────────────────
  // Called every time user types in any input field
  // [e.target.name] uses the input's name attribute as the key
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('') // clear error when user starts typing
  }

  // ── Handle form submit ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault() // prevent page reload on form submit

    // Basic validation
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)  // show spinner
    setError('')      // clear old errors

    try {
      // Call POST /api/auth/login
      const response = await loginApi({
        email: form.email,
        password: form.password
      })

      // response.data = { token, name, email, role }
      login(response.data) // save to localStorage + context

      toast.success(`Welcome back, ${response.data.name}! 👋`)

      // Redirect to dashboard after successful login
      navigate('/')

    } catch (err) {
      // err.response.data = error from Spring Boot
      const msg = err.response?.data?.message
        || err.response?.data
        || 'Invalid email or password'
      setError(typeof msg === 'string' ? msg : 'Login failed')
    } finally {
      setLoading(false) // always hide spinner
    }
  }

  // ── UI ─────────────────────────────────────────────
  return (
    // Full screen centered layout
    // min-h-screen = at least full viewport height
    // flex items-center justify-center = center everything
    <div className="min-h-screen bg-gradient-to-br
      from-primary-50 via-white to-indigo-50
      dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
      flex items-center justify-center p-4">

      {/* Card container — max-w-md limits width on large screens */}
      <div className="w-full max-w-md">

        {/* ── Logo section ── */}
        <div className="text-center mb-8">
          {/* Brand icon circle */}
          <div className="inline-flex items-center justify-center
            w-16 h-16 bg-primary-500 rounded-2xl shadow-lg
            shadow-primary-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900
            dark:text-white mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* ── Form card ── */}
        {/* bg-white/80 = white with 80% opacity */}
        {/* backdrop-blur = frosted glass effect */}
        <div className="bg-white/80 dark:bg-gray-900/80
          backdrop-blur-sm rounded-2xl shadow-xl
          shadow-gray-200/50 dark:shadow-gray-950/50
          border border-gray-200/50 dark:border-gray-700/50 p-8">

          {/* Error alert — only shows when error is not empty */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800
              rounded-xl text-red-600 dark:text-red-400
              text-sm flex items-start gap-2">
              {/* ⚠ warning symbol */}
              <span className="text-lg leading-none">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* onSubmit calls handleSubmit when form is submitted */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Email field ── */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 dark:text-gray-300 mb-1.5">
                Email address
              </label>

              {/* relative + absolute = icon positioned inside input */}
              <div className="relative">
                {/* Mail icon inside input on left side */}
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                  w-4 h-4 text-gray-400 pointer-events-none" />

                <input
                  type="email"
                  name="email"         // matches handleChange key
                  value={form.email}   // controlled input
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  // pl-10 = padding-left to avoid overlapping icon
                  className="w-full pl-10 pr-4 py-3 rounded-xl
                    border border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:border-primary-500 dark:focus:border-primary-400
                    focus:ring-2 focus:ring-primary-500/20
                    transition-all duration-150 text-sm"
                />
              </div>
            </div>

            {/* ── Password field ── */}
            <div>
              <label className="block text-sm font-medium
                text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>

              <div className="relative">
                {/* Lock icon on left */}
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                  w-4 h-4 text-gray-400 pointer-events-none" />

                <input
                  // Toggle between text and password type
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  // pl-10 for lock icon, pr-10 for eye icon
                  className="w-full pl-10 pr-10 py-3 rounded-xl
                    border border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-800
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:border-primary-500 dark:focus:border-primary-400
                    focus:ring-2 focus:ring-primary-500/20
                    transition-all duration-150 text-sm"
                />

                {/* Eye icon button on right — toggles password visibility */}
                <button
                  type="button" // prevent form submit
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600
                    dark:hover:text-gray-300 transition-colors">
                  {/* Show EyeOff when password is visible */}
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ── Submit button ── */}
            <button
              type="submit"
              disabled={loading} // disable while loading
              className="w-full flex items-center justify-center
                gap-2 py-3 px-4 rounded-xl font-semibold text-sm
                bg-primary-500 hover:bg-primary-600
                active:bg-primary-700 text-white
                shadow-lg shadow-primary-500/25
                hover:shadow-primary-500/40
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-150">

              {/* Show spinner when loading, arrow icon when not */}
              {loading ? (
                <>
                  {/* animate-spin = rotating animation */}
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
          </div>

          {/* ── Register link ── */}
          <p className="text-center text-sm text-gray-500
            dark:text-gray-400">
            Don't have an account?{' '}
            {/* Link from react-router-dom — no page reload */}
            <Link
              to="/register"
              className="font-semibold text-primary-600
                dark:text-primary-400 hover:text-primary-700
                dark:hover:text-primary-300 transition-colors">
              Create account
            </Link>
          </p>

        </div>

        {/* ── Demo credentials hint ── */}
        <div className="mt-4 p-4 bg-white/60 dark:bg-gray-900/60
          backdrop-blur-sm rounded-xl border
          border-gray-200/50 dark:border-gray-700/50">
          <p className="text-xs text-center text-gray-500
            dark:text-gray-400 font-medium mb-2">
            Test credentials
          </p>
          <div className="flex justify-center gap-6 text-xs
            text-gray-600 dark:text-gray-300 font-mono">
            <span>📧 user@gmail.com</span>
            <span>🔑 uer123</span>
          </div>
        </div>

      </div>
    </div>
  )
}