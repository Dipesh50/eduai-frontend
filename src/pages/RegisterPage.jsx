import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerApi } from '../api/authApi'
import toast from 'react-hot-toast'
import {
  GraduationCap, Mail, Lock, User,
  Eye, EyeOff, Loader2, ArrowRight,
  CheckCircle2, XCircle
} from 'lucide-react'

// ── InputField defined OUTSIDE the page component ─────
// This is the fix — if defined inside, React destroys and
// recreates the input on every keystroke causing focus loss
const InputField = ({
  label, name, type = 'text',
  placeholder, icon: Icon,
  showToggle, onToggle, show,
  autoComplete, value, onChange, error
}) => (
  <div>
    <label className="block text-sm font-medium
      text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2
        w-4 h-4 text-gray-400 pointer-events-none" />

      <input
        type={showToggle ? (show ? 'text' : 'password') : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full pl-10 ${showToggle ? 'pr-10' : 'pr-4'}
          py-3 rounded-xl border text-sm
          bg-gray-50 dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          transition-all duration-150
          ${error
            ? 'border-red-400 dark:border-red-600 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
            : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'
          }`}
      />

      {showToggle && (
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2
            text-gray-400 hover:text-gray-600
            dark:hover:text-gray-300 transition-colors">
          {show
            ? <EyeOff className="w-4 h-4" />
            : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>

    {error && (
      <p className="mt-1.5 text-xs text-red-500
        dark:text-red-400 flex items-center gap-1">
        <XCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
)

// ── Password strength calculator ───────────────────────
// Also outside component so it doesn't get recreated
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)          score++
  if (/[A-Z]/.test(password))        score++
  if (/[0-9]/.test(password))        score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels = [
    { label: '',       color: '' },
    { label: 'Weak',   color: 'bg-red-500' },
    { label: 'Fair',   color: 'bg-orange-500' },
    { label: 'Good',   color: 'bg-yellow-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ]
  return { score, ...levels[score] }
}

// ── Main component ─────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm,  setShowConfirm]    = useState(false)
  const [loading,      setLoading]        = useState(false)
  const [errors,       setErrors]         = useState({})

  const strength = getPasswordStrength(form.password)

  const validate = () => {
    const e = {}
    if (!form.name.trim())
      e.name = 'Full name is required'
    else if (form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters'

    if (!form.email)
      e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Please enter a valid email'

    if (!form.password)
      e.password = 'Password is required'
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters'

    if (!form.confirmPassword)
      e.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match'

    return e
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      const response = await registerApi({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password
      })
      login(response.data)
      toast.success(`Welcome to EduAI, ${response.data.name}! 🎉`)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data
        || 'Registration failed'
      setErrors({
        submit: typeof msg === 'string'
          ? msg : 'Registration failed. Try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br
      from-primary-50 via-white to-indigo-50
      dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
      flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center
            w-16 h-16 bg-primary-500 rounded-2xl shadow-lg
            shadow-primary-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900
            dark:text-white mb-1">
            Create account
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Start your learning journey today
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/80 dark:bg-gray-900/80
          backdrop-blur-sm rounded-2xl shadow-xl
          shadow-gray-200/50 dark:shadow-gray-950/50
          border border-gray-200/50 dark:border-gray-700/50 p-8">

          {/* General error */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800
              rounded-xl text-red-600 dark:text-red-400
              text-sm flex items-start gap-2">
              <span className="text-lg leading-none">⚠</span>
              <span>{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <InputField
              label="Full Name"
              name="name"
              type="text"
              placeholder="Dipesh Solanki"
              icon={User}
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />

            {/* Email */}
            <InputField
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* Password */}
            <div>
              <InputField
                label="Password"
                name="password"
                placeholder="Min. 6 characters"
                icon={Lock}
                showToggle={true}
                onToggle={() => setShowPassword(!showPassword)}
                show={showPassword}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
              />

              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level}
                        className={`h-1.5 flex-1 rounded-full
                          transition-all duration-300
                          ${strength.score >= level
                            ? strength.color
                            : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium
                      ${strength.score <= 1 ? 'text-red-500' :
                        strength.score === 2 ? 'text-orange-500' :
                        strength.score === 3 ? 'text-yellow-600' :
                        'text-green-500'}`}>
                      {strength.label}
                    </span>
                    <div className="flex gap-2">
                      {[
                        { rule: form.password.length >= 8, label: '8+ chars' },
                        { rule: /[A-Z]/.test(form.password), label: 'A-Z' },
                        { rule: /[0-9]/.test(form.password), label: '0-9' },
                      ].map(({ rule, label }) => (
                        <span key={label}
                          className={`text-xs flex items-center gap-0.5
                            ${rule ? 'text-green-500'
                              : 'text-gray-400 dark:text-gray-600'}`}>
                          {rule
                            ? <CheckCircle2 className="w-3 h-3" />
                            : <XCircle className="w-3 h-3" />}
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Repeat your password"
                icon={Lock}
                showToggle={true}
                onToggle={() => setShowConfirm(!showConfirm)}
                show={showConfirm}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              {/* Match indicator */}
              {form.confirmPassword && (
                <p className={`mt-1.5 text-xs flex items-center gap-1
                  ${form.password === form.confirmPassword
                    ? 'text-green-500' : 'text-red-400'}`}>
                  {form.password === form.confirmPassword
                    ? <><CheckCircle2 className="w-3 h-3"/>Passwords match</>
                    : <><XCircle className="w-3 h-3"/>Passwords do not match</>
                  }
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center
                gap-2 py-3 px-4 rounded-xl font-semibold text-sm
                bg-primary-500 hover:bg-primary-600
                active:bg-primary-700 text-white
                shadow-lg shadow-primary-500/25
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-150 mt-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500
            dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login"
              className="font-semibold text-primary-600
                dark:text-primary-400 hover:text-primary-700
                dark:hover:text-primary-300 transition-colors">
              Sign in
            </Link>
          </p>

        </div>

        <p className="text-center text-xs text-gray-400
          dark:text-gray-500 mt-4">
          By creating an account you agree to our Terms of Service
        </p>

      </div>
    </div>
  )
}