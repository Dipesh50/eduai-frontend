import { useState, useEffect, useRef } from 'react'
import {
  startInterview, submitAnswer, getInterviewHistory
} from '../api/interviewApi'
import toast from 'react-hot-toast'
import {
  Mic, Bot, User, Send, Loader2, Trophy,
  ChevronRight, RotateCcw, Clock, Brain,
  CheckCircle2, AlertCircle, ChevronDown,
  ChevronUp, Sparkles, Target, BookOpen
} from 'lucide-react'

// ── Topic config ───────────────────────────────────────
const TOPICS = [
  { name: 'Java',          icon: '♨️', desc: 'OOP, Collections, Multithreading' },
  { name: 'DSA',           icon: '🌳', desc: 'Arrays, Trees, Dynamic Programming' },
  { name: 'Spring Boot',   icon: '🍃', desc: 'REST APIs, Security, JPA' },
  { name: 'SQL',           icon: '🗄️', desc: 'Queries, Joins, Optimization' },
  { name: 'System Design', icon: '🏗️', desc: 'Scalability, Architecture' },
  { name: 'AI/ML',         icon: '🤖', desc: 'Machine Learning, Neural Networks, Deep Learning' }
]

// ── Confidence Ring ────────────────────────────────────
const ConfidenceRing = ({ score }) => {
  const radius       = 54
  const circumference = 2 * Math.PI * radius
  const progress     = (score / 100) * circumference

  const color = score >= 70 ? '#22c55e'
    : score >= 50 ? '#f59e0b' : '#ef4444'

  const grade = score >= 90 ? 'A+'
    : score >= 80 ? 'A'
    : score >= 70 ? 'B+'
    : score >= 60 ? 'B'
    : score >= 50 ? 'C' : 'F'

  const msg = score >= 80 ? 'Interview Ready! 🏆'
    : score >= 60 ? 'Good Performance 👏'
    : 'Keep Practicing 💪'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg width="160" height="160" viewBox="0 0 120 120"
          className="-rotate-90">
          <circle cx="60" cy="60" r={radius}
            fill="none" stroke="currentColor"
            className="text-gray-100 dark:text-gray-800"
            strokeWidth="10" />
          <circle cx="60" cy="60" r={radius}
            fill="none" stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference - progress}`}
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col
          items-center justify-center">
          <span className="text-3xl font-black
            text-gray-900 dark:text-white">
            {score}
          </span>
          <span className="text-sm font-bold"
            style={{ color }}>
            {grade}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-600
        dark:text-gray-400">{msg}</p>
    </div>
  )
}

// ── SCREEN 1: Topic Setup ──────────────────────────────
const SetupScreen = ({ onStart }) => {
  const [selected, setSelected] = useState(null)
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    if (!selected) {
      toast.error('Please select a topic first')
      return
    }
    setStarting(true)
    await onStart(selected)
    setStarting(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br
            from-indigo-500 to-purple-600 rounded-xl
            flex items-center justify-center shadow-sm">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900
              dark:text-white">
              Mock Interview
            </h1>
            <p className="text-sm text-gray-500
              dark:text-gray-400">
              AI-powered interview simulation
            </p>
          </div>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: '❓', label: '30 Questions', desc: 'AI generated' },
          { icon: '🔄', label: 'Follow-ups', desc: 'Based on answers' },
          { icon: '📊', label: 'Feedback', desc: 'Detailed report' },
        ].map(({ icon, label, desc }) => (
          <div key={label}
            className="bg-white dark:bg-gray-900 rounded-xl
              border border-gray-100 dark:border-gray-800
              p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-sm font-semibold text-gray-900
              dark:text-white">{label}</p>
            <p className="text-xs text-gray-500
              dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Topic selection */}
      <p className="text-sm font-semibold text-gray-700
        dark:text-gray-300 mb-3">
        Select Interview Topic
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2
        gap-3 mb-6">
        {TOPICS.map(({ name, icon, desc }) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`flex items-center gap-4 p-4
              rounded-xl border-2 text-left transition-all
              duration-200
              ${selected === name
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-900'
              }`}>
            <span className="text-2xl">{icon}</span>
            <div>
              <p className={`font-semibold text-sm
                ${selected === name
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-900 dark:text-white'
                }`}>
                {name}
              </p>
              <p className="text-xs text-gray-500
                dark:text-gray-400">{desc}</p>
            </div>
            {selected === name && (
              <CheckCircle2 className="w-5 h-5
                text-primary-500 ml-auto flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!selected || starting}
        className="w-full flex items-center justify-center
          gap-2 py-3.5 bg-gradient-to-r from-indigo-500
          to-purple-600 hover:from-indigo-600
          hover:to-purple-700 text-white rounded-xl
          font-semibold text-sm shadow-sm
          shadow-indigo-500/25
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150">
        {starting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Starting interview...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Start Interview
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}

// ── SCREEN 2: Interview ────────────────────────────────
const InterviewScreen = ({
  interview, onAnswer, submitting, topic
}) => {
  const [answer, setAnswer]   = useState('')
  const [elapsed, setElapsed] = useState(0)
  const textareaRef           = useRef(null)

  // Timer — counts up from 0
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format elapsed seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error('Please write your answer first')
      return
    }
    onAnswer(answer.trim())
    setAnswer('')
    // Refocus textarea for next question
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const handleKeyDown = (e) => {
    // Ctrl+Enter submits answer
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const currentQ = interview.currentQuestion
  const history  = interview.history || []
  const qNum     = interview.questionNumber

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br
            from-indigo-500 to-purple-600 rounded-xl
            flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900
              dark:text-white text-sm">
              {topic} Interview
            </p>
            <p className="text-xs text-gray-500
              dark:text-gray-400">
              Question {qNum} of 30
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5
          text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-sm font-medium">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200
        dark:bg-gray-700 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500
            to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${(qNum / 30) * 100}%` }}
        />
      </div>

      {/* Previous Q&A history */}
      {history.length > 0 && (
        <div className="space-y-3 mb-6">
          {history.map((item, i) => (
            <div key={i}
              className="bg-gray-50 dark:bg-gray-800/50
                rounded-xl p-4 border border-gray-100
                dark:border-gray-700">

              {/* AI question */}
              <div className="flex gap-3 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br
                  from-indigo-500 to-purple-600 rounded-lg
                  flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-gray-700
                  dark:text-gray-300 leading-relaxed">
                  {item.question}
                </p>
              </div>

              {/* Student answer */}
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-primary-500
                  rounded-lg flex items-center justify-center
                  flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-sm text-gray-600
                  dark:text-gray-400 leading-relaxed italic">
                  "{item.answer}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current question card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm p-6 mb-4">

        {/* AI label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br
            from-indigo-500 to-purple-600 rounded-xl
            flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold
            text-indigo-600 dark:text-indigo-400 uppercase
            tracking-wide">
            Interviewer
          </span>
        </div>

        {/* Question text */}
        <p className="text-base font-medium text-gray-900
          dark:text-white leading-relaxed">
          {currentQ}
        </p>
      </div>

      {/* Answer textarea */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm p-6">

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-primary-500 rounded-xl
            flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold
            text-primary-600 dark:text-primary-400 uppercase
            tracking-wide">
            Your Answer
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here... Be detailed and specific. Include examples where relevant."
          rows={5}
          className="w-full px-4 py-3 rounded-xl
            border border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:border-primary-500 focus:ring-2
            focus:ring-primary-500/20
            text-sm leading-relaxed resize-none
            transition-all duration-150"
        />

        {/* Character count + hint */}
        <div className="flex items-center justify-between
          mt-2">
          <p className="text-xs text-gray-400
            dark:text-gray-500">
            Ctrl+Enter to submit
          </p>
          <span className="text-xs text-gray-400
            dark:text-gray-500">
            {answer.length} chars
          </span>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting}
          className="w-full mt-4 flex items-center
            justify-center gap-2 py-3 bg-gradient-to-r
            from-indigo-500 to-purple-600
            hover:from-indigo-600 hover:to-purple-700
            text-white rounded-xl font-semibold text-sm
            shadow-sm shadow-indigo-500/25
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {qNum >= 30 ? 'Generating feedback...' : 'Getting next question...'}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {qNum >= 30 ? 'Finish Interview' : 'Submit Answer'}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── SCREEN 3: Feedback Report ──────────────────────────
const FeedbackScreen = ({ feedback, topic, onRestart }) => {
  const [showTips, setShowTips] = useState(false)

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br
          from-indigo-500 to-purple-600 rounded-2xl
          flex items-center justify-center mx-auto mb-4
          shadow-lg shadow-indigo-500/25">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900
          dark:text-white mb-1">
          Interview Complete!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {topic} · 30 questions answered
        </p>
      </div>

      {/* Score ring */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm p-8 mb-4 flex justify-center">
        <ConfidenceRing score={feedback.confidenceScore} />
      </div>

      {/* Overall feedback */}
      {feedback.feedbackReport && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl
          border border-gray-100 dark:border-gray-800
          shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-gray-900
              dark:text-white text-sm">
              Overall Feedback
            </h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300
            leading-relaxed bg-indigo-50 dark:bg-indigo-900/20
            border border-indigo-100 dark:border-indigo-800
            rounded-xl p-4">
            {feedback.feedbackReport}
          </p>
        </div>
      )}

      {/* Strong points and weak areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2
        gap-4 mb-4">

        {/* Strong points */}
        {feedback.strongPoints?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl
            border border-gray-100 dark:border-gray-800
            shadow-sm p-5">
            <h4 className="font-semibold text-gray-900
              dark:text-white mb-3 flex items-center
              gap-2 text-sm">
              <span className="text-green-500">💪</span>
              Strong Points
            </h4>
            <ul className="space-y-2">
              {feedback.strongPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500
                    flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700
                    dark:text-gray-300 leading-relaxed">
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weak areas */}
        {feedback.weakAreas?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl
            border border-gray-100 dark:border-gray-800
            shadow-sm p-5">
            <h4 className="font-semibold text-gray-900
              dark:text-white mb-3 flex items-center
              gap-2 text-sm">
              <span className="text-orange-500">⚠️</span>
              Weak Areas
            </h4>
            <ul className="space-y-2">
              {feedback.weakAreas.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500
                    flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700
                    dark:text-gray-300 leading-relaxed">
                    {a}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Improvement tips — collapsible */}
      {feedback.improvementTips?.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl
          border border-gray-100 dark:border-gray-800
          shadow-sm mb-6 overflow-hidden">
          <button
            onClick={() => setShowTips(!showTips)}
            className="w-full flex items-center justify-between
              p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50
              transition-colors">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <h4 className="font-semibold text-gray-900
                dark:text-white text-sm">
                Improvement Tips
              </h4>
              <span className="px-2 py-0.5 bg-primary-100
                dark:bg-primary-900/30 text-primary-600
                dark:text-primary-400 text-xs font-medium
                rounded-lg">
                {feedback.improvementTips.length}
              </span>
            </div>
            {showTips
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </button>

          {showTips && (
            <div className="px-5 pb-5 border-t
              border-gray-100 dark:border-gray-800">
              <ol className="space-y-3 pt-4">
                {feedback.improvementTips.map((tip, i) => (
                  <li key={i}
                    className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary-100
                      dark:bg-primary-900/30 text-primary-600
                      dark:text-primary-400 rounded-full
                      flex items-center justify-center
                      text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700
                      dark:text-gray-300 leading-relaxed">
                      {tip}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={onRestart}
          className="flex-1 flex items-center justify-center
            gap-2 py-3 bg-gradient-to-r from-indigo-500
            to-purple-600 hover:from-indigo-600
            hover:to-purple-700 text-white rounded-xl
            font-semibold text-sm shadow-sm
            shadow-indigo-500/25 transition-all duration-150">
          <RotateCcw className="w-4 h-4" />
          New Interview
        </button>
        <button
          onClick={() => window.location.href = '/quiz'}
          className="flex-1 flex items-center justify-center
            gap-2 py-3 bg-gray-100 dark:bg-gray-800
            hover:bg-gray-200 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-300
            rounded-xl font-semibold text-sm
            transition-all duration-150">
          <BookOpen className="w-4 h-4" />
          Practice Quiz
        </button>
      </div>
    </div>
  )
}

// ── Main Interview Page ────────────────────────────────
export default function InterviewPage() {

  // screen = 'setup' | 'interview' | 'feedback'
  const [screen, setScreen]       = useState('setup')
  const [interviewId, setId]      = useState(null)
  const [topic, setTopic]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  // interview = { currentQuestion, questionNumber, history }
  const [interview, setInterview] = useState({
    currentQuestion: '',
    questionNumber:  0,
    history:         []
  })

  const [feedback, setFeedback]   = useState(null)

  // ── Start interview ────────────────────────────────
  const handleStart = async (selectedTopic) => {
    try {
      const res = await startInterview({
        topic: selectedTopic
      })
      setId(res.data.interviewId)
      setTopic(selectedTopic)
      setInterview({
        currentQuestion: res.data.question,
        questionNumber:  res.data.questionNumber,
        history:         []
      })
      setScreen('interview')
    } catch (err) {
      toast.error('Failed to start interview')
    }
  }

  // ── Submit answer ──────────────────────────────────
  const handleAnswer = async (answerText) => {
    setSubmitting(true)
    try {
      const res = await submitAnswer(interviewId, {
        answer: answerText
      })

      if (res.data.isCompleted) {
        // Interview done — show feedback
        setFeedback(res.data.feedback)
        setScreen('feedback')
        toast.success('Interview complete! 🎉')
      } else {
        // Add current Q&A to history, show next question
        setInterview(prev => ({
          currentQuestion: res.data.question,
          questionNumber:  res.data.questionNumber,
          history: [...prev.history, {
            question: prev.currentQuestion,
            answer:   answerText
          }]
        }))
      }
    } catch (err) {
      toast.error('Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Reset to setup ─────────────────────────────────
  const handleRestart = () => {
    setScreen('setup')
    setInterview({
      currentQuestion: '',
      questionNumber:  0,
      history:         []
    })
    setFeedback(null)
    setId(null)
    setTopic('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {screen === 'setup' && (
        <SetupScreen onStart={handleStart} />
      )}
      {screen === 'interview' && (
        <InterviewScreen
          interview={interview}
          topic={topic}
          onAnswer={handleAnswer}
          submitting={submitting}
        />
      )}
      {screen === 'feedback' && feedback && (
        <FeedbackScreen
          feedback={feedback}
          topic={topic}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}