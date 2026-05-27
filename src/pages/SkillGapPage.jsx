import { useState, useEffect } from 'react'
import { getRoles, analyzeSkillGap } from '../api/skillGapApi'
import toast from 'react-hot-toast'
import {
  Target, CheckCircle2, XCircle, Loader2,
  ChevronRight, Sparkles, Trophy, Clock,
  BookOpen, Code, Server, Smartphone,
  Database, RefreshCw
} from 'lucide-react'

// ── Role icons map ─────────────────────────────────────
const ROLE_CONFIG = {
  'Java Backend Developer at MNC': {
    icon: Server,
    emoji: '☕',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    desc: 'Spring Boot, JPA, Microservices, Docker'
  },
  'Full Stack Developer': {
    icon: Code,
    emoji: '🌐',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    desc: 'React, Spring Boot, MySQL, Docker'
  },
  'Android Developer': {
    icon: Smartphone,
    emoji: '📱',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    desc: 'Kotlin, Jetpack Compose, Firebase'
  },
  'DevOps Engineer': {
    icon: Server,
    emoji: '⚙️',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    desc: 'Docker, Kubernetes, AWS, CI/CD'
  },
  'Data Engineer': {
    icon: Database,
    emoji: '📊',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    desc: 'Python, Spark, Kafka, AWS'
  },
}

// ── Readiness Ring ─────────────────────────────────────
const ReadinessRing = ({ score }) => {
  const radius        = 54
  const circumference = 2 * Math.PI * radius
  const progress      = (score / 100) * circumference

  const color = score >= 70 ? '#22c55e'
    : score >= 50 ? '#f59e0b'
    : '#ef4444'

  const grade = score >= 90 ? 'A+'
    : score >= 80 ? 'A'
    : score >= 70 ? 'B+'
    : score >= 60 ? 'B'
    : score >= 50 ? 'C' : 'F'

  const label = score >= 70 ? 'Job Ready'
    : score >= 50 ? 'Almost Ready'
    : 'Keep Learning'

  const textColor = score >= 70
    ? 'text-green-600 dark:text-green-400'
    : score >= 50
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg width="176" height="176"
          viewBox="0 0 120 120"
          className="-rotate-90">
          {/* Background ring */}
          <circle cx="60" cy="60" r={radius}
            fill="none" stroke="currentColor"
            className="text-gray-100 dark:text-gray-800"
            strokeWidth="10" />
          {/* Progress ring */}
          <circle cx="60" cy="60" r={radius}
            fill="none" stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={
              `${progress} ${circumference - progress}`
            }
            style={{ transition: 'stroke-dasharray 1.2s ease' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col
          items-center justify-center">
          <span className="text-4xl font-black
            text-gray-900 dark:text-white">
            {score}%
          </span>
          <span className="text-base font-bold"
            style={{ color }}>
            {grade}
          </span>
        </div>
      </div>

      {/* Label pill */}
      <div className={`mt-3 px-4 py-1.5 rounded-full
        text-sm font-semibold ${textColor}
        ${score >= 70
          ? 'bg-green-100 dark:bg-green-900/30'
          : score >= 50
          ? 'bg-yellow-100 dark:bg-yellow-900/30'
          : 'bg-red-100 dark:bg-red-900/30'
        }`}>
        {label}
      </div>
    </div>
  )
}

// ── Skill Chip ─────────────────────────────────────────
const SkillChip = ({ skill, type }) => (
  <span className={`inline-flex items-center gap-1.5
    px-3 py-1.5 rounded-xl text-xs font-medium
    transition-all duration-150 hover:scale-105
    ${type === 'present'
      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
    }`}>
    {type === 'present'
      ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
      : <XCircle className="w-3 h-3 flex-shrink-0" />
    }
    {skill}
  </span>
)

// ── Roadmap Step ───────────────────────────────────────
// Each step in the learning roadmap as a timeline card
const RoadmapStep = ({ step, index, total }) => {
  // Different color for each step
  const colors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
  ]
  const color = colors[index % colors.length]

  return (
    <div className="flex gap-4">

      {/* Timeline line + dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Numbered circle */}
        <div className={`w-8 h-8 ${color} rounded-full
          flex items-center justify-center
          text-white text-xs font-bold flex-shrink-0
          shadow-sm`}>
          {index + 1}
        </div>
        {/* Vertical line connecting steps */}
        {index < total - 1 && (
          <div className="w-0.5 bg-gray-200 dark:bg-gray-700
            flex-1 mt-2 mb-0 min-h-[24px]" />
        )}
      </div>

      {/* Step content */}
      <div className={`flex-1 pb-6`}>
        <div className="bg-white dark:bg-gray-900 rounded-xl
          border border-gray-100 dark:border-gray-800
          p-4 shadow-sm hover:shadow-md
          transition-shadow duration-200">
          <p className="text-sm text-gray-700 dark:text-gray-300
            leading-relaxed">
            {step}
          </p>
        </div>
      </div>

    </div>
  )
}

// ── History Card ───────────────────────────────────────
const HistoryCard = ({ item }) => {
  const cfg = ROLE_CONFIG[item.targetRole] || {
    emoji: '🎯',
    color: 'text-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700'
  }

  const scoreColor = item.readinessScore >= 70
    ? 'text-green-600 dark:text-green-400'
    : item.readinessScore >= 50
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400'

  const scoreBg = item.readinessScore >= 70
    ? 'bg-green-50 dark:bg-green-900/20'
    : item.readinessScore >= 50
    ? 'bg-yellow-50 dark:bg-yellow-900/20'
    : 'bg-red-50 dark:bg-red-900/20'

  return (
    <div className="flex items-center gap-4 p-4
      bg-white dark:bg-gray-900 rounded-xl
      border border-gray-100 dark:border-gray-800
      hover:shadow-sm transition-shadow duration-200">

      {/* Role emoji */}
      <div className={`w-12 h-12 ${cfg.bg} rounded-xl
        flex items-center justify-center flex-shrink-0
        text-2xl`}>
        {cfg.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900
          dark:text-white truncate">
          {item.targetRole}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="w-3 h-3 text-gray-400" />
          <p className="text-xs text-gray-500
            dark:text-gray-400">
            {item.createdAt
              ? new Date(item.createdAt)
                  .toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
              : 'Unknown date'}
          </p>
        </div>
      </div>

      {/* Score badge */}
      <div className={`flex flex-col items-center
        px-3 py-2 rounded-xl ${scoreBg}`}>
        <span className={`text-lg font-black ${scoreColor}`}>
          {item.readinessScore}%
        </span>
        <span className={`text-xs font-bold ${scoreColor}`}>
          {item.readinessGrade}
        </span>
      </div>
    </div>
  )
}

// ── Main Skill Gap Page ────────────────────────────────
export default function SkillGapPage() {

  const [roles, setRoles]           = useState([])
  const [selected, setSelected]     = useState(null)
  const [analyzing, setAnalyzing]   = useState(false)
  const [result, setResult]         = useState(null)
  const [history, setHistory]       = useState([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  // Load roles on page open
  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setLoadingRoles(true)
    try {
      const res = await getRoles()
      setRoles(res.data || [])
    } catch (err) {
      // Fallback to hardcoded roles if API fails
      setRoles(Object.keys(ROLE_CONFIG))
    } finally {
      setLoadingRoles(false)
    }
  }

  // ── Analyze skill gap ──────────────────────────────
  const handleAnalyze = async () => {
    if (!selected) {
      toast.error('Please select a target role first')
      return
    }

    setAnalyzing(true)
    try {
      const res = await analyzeSkillGap(selected)
      setResult(res.data)
      // Add to history
      setHistory(prev => [res.data, ...prev])
      toast.success('Skill gap analysis complete!')
    } catch (err) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Reset result ───────────────────────────────────
  const handleReset = () => {
    setResult(null)
    setSelected(null)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br
            from-red-500 to-orange-500 rounded-xl
            flex items-center justify-center shadow-sm">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900
              dark:text-white">
              Skill Gap Analyzer
            </h1>
            <p className="text-sm text-gray-500
              dark:text-gray-400">
              See how ready you are for your target role
            </p>
          </div>
        </div>
      </div>

      {!result ? (
        // ── Selection screen ──
        <div className="max-w-3xl">

          {/* Info bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { icon: '📊', text: 'Checks quiz performance' },
              { icon: '📄', text: 'Analyzes resume skills' },
              { icon: '🗺️', text: 'Generates learning roadmap' },
            ].map(({ icon, text }) => (
              <div key={text}
                className="flex items-center gap-2 px-3 py-2
                  bg-white dark:bg-gray-900 rounded-xl
                  border border-gray-100 dark:border-gray-800
                  text-xs text-gray-600 dark:text-gray-400">
                <span>{icon}</span>
                {text}
              </div>
            ))}
          </div>

          {/* Role selection */}
          <p className="text-sm font-semibold text-gray-700
            dark:text-gray-300 mb-3">
            Select Your Target Role
          </p>

          {loadingRoles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2
              gap-3 mb-6">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-20 bg-gray-100
                  dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2
              gap-3 mb-6">
              {roles.map(role => {
                const cfg = ROLE_CONFIG[role] || {
                  emoji: '🎯',
                  color: 'text-gray-600 dark:text-gray-400',
                  bg: 'bg-gray-50 dark:bg-gray-800',
                  border: 'border-gray-200 dark:border-gray-700',
                  desc: 'Software Engineering role'
                }
                const isSelected = selected === role

                return (
                  <button
                    key={role}
                    onClick={() => setSelected(role)}
                    className={`flex items-center gap-4 p-4
                      rounded-xl border-2 text-left
                      transition-all duration-200
                      ${isSelected
                        ? `${cfg.border} ${cfg.bg} scale-[1.01]`
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>

                    {/* Role emoji */}
                    <span className="text-3xl flex-shrink-0">
                      {cfg.emoji}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm
                        ${isSelected
                          ? cfg.color
                          : 'text-gray-900 dark:text-white'
                        }`}>
                        {role}
                      </p>
                      <p className="text-xs text-gray-500
                        dark:text-gray-400 mt-0.5 truncate">
                        {cfg.desc}
                      </p>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <CheckCircle2 className={`w-5 h-5
                        flex-shrink-0 ${cfg.color}`} />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!selected || analyzing}
            className="w-full flex items-center justify-center
              gap-2 py-3.5 bg-gradient-to-r from-red-500
              to-orange-500 hover:from-red-600
              hover:to-orange-600 text-white rounded-xl
              font-semibold text-sm shadow-sm
              shadow-red-500/25
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150">
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing your skills...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze My Skills
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Analyzing hint */}
          {analyzing && (
            <p className="text-xs text-center text-gray-500
              dark:text-gray-400 mt-3">
              Checking your quiz scores and resume skills...
              This may take a few seconds.
            </p>
          )}
        </div>

      ) : (
        // ── Result screen ──
        <div className="space-y-6">

          {/* Result header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900
                dark:text-white">
                Analysis Result
              </h2>
              <p className="text-sm text-gray-500
                dark:text-gray-400">
                Target: {result.targetRole}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2
                text-xs text-gray-500 hover:text-primary-600
                dark:hover:text-primary-400
                hover:bg-gray-100 dark:hover:bg-gray-800
                rounded-xl transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Analyze another role
            </button>
          </div>

          {/* Score + skills row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Score ring — takes 1 column */}
            <div className="bg-white dark:bg-gray-900
              rounded-2xl border border-gray-100
              dark:border-gray-800 shadow-sm p-6
              flex flex-col items-center justify-center">

              <ReadinessRing score={result.readinessScore} />

              {/* Stats below ring */}
              <div className="flex gap-6 mt-6 w-full
                justify-center">
                <div className="text-center">
                  <p className="text-2xl font-black
                    text-green-600 dark:text-green-400">
                    {result.presentSkills?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500
                    dark:text-gray-400">Have</p>
                </div>
                <div className="w-px bg-gray-200
                  dark:bg-gray-700" />
                <div className="text-center">
                  <p className="text-2xl font-black
                    text-red-500 dark:text-red-400">
                    {result.missingSkills?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500
                    dark:text-gray-400">Missing</p>
                </div>
              </div>
            </div>

            {/* Skills — takes 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-1
              sm:grid-cols-2 gap-4">

              {/* Present skills */}
              <div className="bg-white dark:bg-gray-900
                rounded-2xl border border-gray-100
                dark:border-gray-800 shadow-sm p-5">

                <h3 className="font-semibold text-gray-900
                  dark:text-white mb-3 flex items-center
                  gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4
                    text-green-500" />
                  Skills You Have
                  <span className="ml-auto px-2 py-0.5
                    bg-green-100 dark:bg-green-900/30
                    text-green-600 dark:text-green-400
                    text-xs font-bold rounded-lg">
                    {result.presentSkills?.length || 0}
                  </span>
                </h3>

                {result.presentSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.presentSkills.map(s => (
                      <SkillChip key={s} skill={s}
                        type="present" />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400
                    dark:text-gray-500">
                    No matching skills found yet.
                    Take quizzes and upload your resume!
                  </p>
                )}
              </div>

              {/* Missing skills */}
              <div className="bg-white dark:bg-gray-900
                rounded-2xl border border-gray-100
                dark:border-gray-800 shadow-sm p-5">

                <h3 className="font-semibold text-gray-900
                  dark:text-white mb-3 flex items-center
                  gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Skills You Need
                  <span className="ml-auto px-2 py-0.5
                    bg-red-100 dark:bg-red-900/30
                    text-red-600 dark:text-red-400
                    text-xs font-bold rounded-lg">
                    {result.missingSkills?.length || 0}
                  </span>
                </h3>

                {result.missingSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map(s => (
                      <SkillChip key={s} skill={s}
                        type="missing" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center
                    py-4 text-center">
                    <Trophy className="w-8 h-8 text-yellow-500
                      mb-2" />
                    <p className="text-xs font-semibold
                      text-green-600 dark:text-green-400">
                      You have all required skills!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Roadmap */}
          {result.learningRoadmap?.length > 0 && (
            <div className="bg-white dark:bg-gray-900
              rounded-2xl border border-gray-100
              dark:border-gray-800 shadow-sm p-6">

              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5
                  text-primary-500" />
                <h3 className="font-bold text-gray-900
                  dark:text-white">
                  Your Learning Roadmap
                </h3>
                <span className="ml-auto text-xs
                  text-gray-500 dark:text-gray-400">
                  AI generated · {result.learningRoadmap.length} steps
                </span>
              </div>

              {/* Timeline steps */}
              <div>
                {result.learningRoadmap.map((step, i) => (
                  <RoadmapStep
                    key={i}
                    step={step}
                    index={i}
                    total={result.learningRoadmap.length}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.location.href = '/quiz'}
              className="flex items-center gap-2 px-5 py-2.5
                bg-primary-500 hover:bg-primary-600
                text-white rounded-xl text-sm font-semibold
                shadow-sm shadow-primary-500/25
                transition-all duration-150">
              <BookOpen className="w-4 h-4" />
              Practice Quiz
            </button>
            <button
              onClick={() => window.location.href = '/resume'}
              className="flex items-center gap-2 px-5 py-2.5
                bg-white dark:bg-gray-900
                hover:bg-gray-50 dark:hover:bg-gray-800
                text-gray-700 dark:text-gray-300
                border border-gray-200 dark:border-gray-700
                rounded-xl text-sm font-semibold
                transition-all duration-150">
              <Target className="w-4 h-4" />
              Update Resume
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5
                bg-white dark:bg-gray-900
                hover:bg-gray-50 dark:hover:bg-gray-800
                text-gray-700 dark:text-gray-300
                border border-gray-200 dark:border-gray-700
                rounded-xl text-sm font-semibold
                transition-all duration-150">
              <RefreshCw className="w-4 h-4" />
              Check Another Role
            </button>
          </div>

        </div>
      )}

      {/* ── History section ── */}
      {history.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900
            dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Past Analyses
          </h2>
          <div className="space-y-3">
            {history.map((item, i) => (
              <HistoryCard key={i} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}