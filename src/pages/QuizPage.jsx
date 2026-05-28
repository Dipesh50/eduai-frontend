import { useState, useEffect } from 'react'
import { getTopics, getQuestions, getAiQuestions, submitQuiz } from '../api/quizApi'
import toast from 'react-hot-toast'
import {
  BookOpen, Brain, Clock, ChevronRight,
  CheckCircle2, XCircle, Loader2, Trophy,
  RotateCcw, Sparkles, Database, ChevronDown,
  ChevronUp, Award, Target
} from 'lucide-react'

// ── Topic icons map ────────────────────────────────────
const TOPIC_ICONS = {
  'Java':          { icon: '☕', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  'DSA':           { icon: '🌳', color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',   border: 'border-green-200 dark:border-green-800'  },
  'SQL':           { icon: '🗄️', color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-200 dark:border-blue-800'    },
  'Spring Boot':   { icon: '🍃', color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20',border: 'border-emerald-200 dark:border-emerald-800'},
  'System Design': { icon: '🏗️', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
}

// ── THE FIX: normalize both values before comparing ───
const getOptionStyle = (option, selectedOption,
  correctAnswer, showResult) => {

  if (!showResult) {
    return selectedOption === option
      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-800'
  }

  // Normalize to uppercase and trim whitespace
  const current  = option?.toString().toUpperCase().trim()
  const correct  = correctAnswer?.toString().toUpperCase().trim()
  const selected = selectedOption?.toString().toUpperCase().trim()

  // Always show correct answer green
  if (current === correct)
    return 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'

  // Show selected wrong answer red
  if (current === selected && current !== correct)
    return 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'

  // Other options fade
  return 'border-gray-200 dark:border-gray-700 opacity-40'
}

// ── Grade config ───────────────────────────────────────
const getGradeConfig = (score) => {
  if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', msg: 'Outstanding! 🏆' }
  if (score >= 80) return { grade: 'A',  color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', msg: 'Excellent! 🎉' }
  if (score >= 70) return { grade: 'B+', color: 'text-blue-600',  bg: 'bg-blue-100 dark:bg-blue-900/30',  msg: 'Great job! 👏' }
  if (score >= 60) return { grade: 'B',  color: 'text-blue-600',  bg: 'bg-blue-100 dark:bg-blue-900/30',  msg: 'Good effort! 💪' }
  if (score >= 50) return { grade: 'C',  color: 'text-yellow-600',bg: 'bg-yellow-100 dark:bg-yellow-900/30',msg: 'Keep practicing! 📚' }
  return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', msg: 'Need more practice 🔥' }
}

// ── SCREEN 1: Topic Selection ──────────────────────────
const TopicSelectionScreen = ({ topics, loading, onStart }) => {
  const [aiMode, setAiMode]       = useState(false)
  const [questionCount, setCount] = useState(5)
  const [starting, setStarting]   = useState(null)

  const handleStart = async (topic) => {
    setStarting(topic)
    await onStart(topic, questionCount, aiMode)
    setStarting(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900
          dark:text-white mb-1">
          Quiz Practice
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Test your knowledge and track your progress
        </p>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6
        p-4 bg-white dark:bg-gray-900 rounded-2xl
        border border-gray-100 dark:border-gray-800">

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600
            dark:text-gray-400">Questions:</span>
          <div className="flex gap-1">
            {[5, 10].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`px-3 py-1.5 rounded-lg text-sm
                  font-medium transition-colors
                  ${questionCount === n
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600
            dark:text-gray-400">Mode:</span>
          <div className="flex gap-1">
            <button onClick={() => setAiMode(false)}
              className={`flex items-center gap-1.5 px-3
                py-1.5 rounded-lg text-sm font-medium
                transition-colors
                ${!aiMode
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
              <Database className="w-3.5 h-3.5" />
              Fixed
            </button>
            <button onClick={() => setAiMode(true)}
              className={`flex items-center gap-1.5 px-3
                py-1.5 rounded-lg text-sm font-medium
                transition-colors
                ${aiMode
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
              <Sparkles className="w-3.5 h-3.5" />
              AI Generated
            </button>
          </div>
        </div>

        {aiMode && (
          <span className="text-xs text-indigo-600
            dark:text-indigo-400 bg-indigo-50
            dark:bg-indigo-900/20 px-2 py-1 rounded-lg">
            ✨ Fresh questions every time
          </span>
        )}
      </div>

      {/* Topic cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-3 gap-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-40 bg-gray-100
              dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-3 gap-4">
          {topics.map(topic => {
            const cfg = TOPIC_ICONS[topic] || {
              icon: '📚',
              color: 'text-gray-600',
              bg: 'bg-gray-50 dark:bg-gray-800',
              border: 'border-gray-200 dark:border-gray-700'
            }
            return (
              <div key={topic}
                className={`p-6 rounded-2xl border-2
                  ${cfg.bg} ${cfg.border}
                  transition-all duration-200
                  hover:shadow-md hover:scale-[1.02]`}>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{cfg.icon}</span>
                  <div>
                    <h3 className={`font-bold text-lg ${cfg.color}`}>
                      {topic}
                    </h3>
                    <p className="text-xs text-gray-500
                      dark:text-gray-400">
                      {questionCount} questions
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStart(topic)}
                  disabled={starting === topic}
                  className={`w-full flex items-center
                    justify-center gap-2 py-2.5 rounded-xl
                    text-sm font-semibold transition-all
                    ${aiMode
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                      : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/25'
                    } disabled:opacity-60`}>
                  {starting === topic ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : aiMode ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI Quiz
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      Start Quiz
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── SCREEN 2: Quiz Taking ──────────────────────────────
const QuizTakingScreen = ({
  questions, topic, onSubmit, submitting
}) => {
  const [answers, setAnswers]           = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showResult, setShowResult]     = useState(false)
  const [timeLeft, setTimeLeft]         = useState(60)

  const currentQ   = questions[currentIndex]
  const isLastQ    = currentIndex === questions.length - 1
  const isAnswered = answers[currentQ?.id] !== undefined

  useEffect(() => {
    setTimeLeft(60)
    setShowResult(false)

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentIndex])

  // ── THE FIX: normalize to uppercase ───────────────
  const handleSelect = (option) => {
    if (isAnswered) return
    const normalized = option.toUpperCase().trim()
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: normalized
    }))
    setShowResult(true)
  }

  const handleNext = () => {
    if (isLastQ) {
      onSubmit(answers)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (!currentQ) return null

  const options = [
    { key: 'A', text: currentQ.optionA },
    { key: 'B', text: currentQ.optionB },
    { key: 'C', text: currentQ.optionC },
    { key: 'D', text: currentQ.optionD },
  ]

  const timerColor = timeLeft > 30
    ? 'text-green-600 dark:text-green-400'
    : timeLeft > 10
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400 animate-pulse'

  // Normalize correctAnswer for icon comparison
  const normalizedCorrect = currentQ.correctAnswer
    ?.toString().toUpperCase().trim()
  const normalizedSelected = answers[currentQ.id]
    ?.toString().toUpperCase().trim()

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-primary-100
            dark:bg-primary-900/30 text-primary-700
            dark:text-primary-400 rounded-lg text-sm font-bold">
            Q{currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {topic}
          </span>
        </div>
        <div className={`flex items-center gap-1.5
          font-mono font-bold text-lg ${timerColor}`}>
          <Clock className="w-4 h-4" />
          {String(timeLeft).padStart(2, '0')}s
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700
        rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full
            transition-all duration-300"
          style={{
            width: `${((currentIndex + (isAnswered ? 1 : 0))
              / questions.length) * 100}%`
          }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm p-8 mb-6">

        {currentQ.difficulty && (
          <span className={`inline-block px-2 py-0.5
            rounded-lg text-xs font-medium mb-4
            ${currentQ.difficulty === 'Easy'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : currentQ.difficulty === 'Hard'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
            {currentQ.difficulty}
          </span>
        )}

        <p className="text-lg font-semibold text-gray-900
          dark:text-white leading-relaxed mb-6">
          {currentQ.questionText}
        </p>

        <div className="space-y-3">
          {options.map(({ key, text }) => {
            const normalizedKey = key.toUpperCase().trim()
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={isAnswered}
                className={`w-full flex items-center gap-4 p-4
                  rounded-xl border-2 text-left transition-all
                  duration-200 disabled:cursor-default
                  ${getOptionStyle(
                    normalizedKey,
                    normalizedSelected,
                    normalizedCorrect,
                    showResult
                  )}`}>

                <span className="w-8 h-8 rounded-lg border-2
                  border-current flex items-center justify-center
                  text-sm font-bold flex-shrink-0">
                  {key}
                </span>

                <span className="text-sm font-medium flex-1">
                  {text}
                </span>

                {/* ── THE FIX: use normalized values for icons ── */}
                {showResult && normalizedKey === normalizedCorrect && (
                  <CheckCircle2 className="w-5 h-5
                    text-green-500 flex-shrink-0" />
                )}
                {showResult
                  && normalizedKey === normalizedSelected
                  && normalizedKey !== normalizedCorrect && (
                  <XCircle className="w-5 h-5
                    text-red-500 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          disabled={submitting}
          className="w-full flex items-center justify-center
            gap-2 py-3 bg-primary-500 hover:bg-primary-600
            text-white rounded-xl font-semibold text-sm
            shadow-sm shadow-primary-500/25
            disabled:opacity-60 transition-all duration-150">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : isLastQ ? (
            <>
              <Trophy className="w-4 h-4" />
              Submit Quiz
            </>
          ) : (
            <>
              Next Question
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ── SCREEN 3: Result Screen ────────────────────────────
const ResultScreen = ({ result, topic, onRetry, onBack }) => {
  const [expanded, setExpanded] = useState({})

  const score       = Math.round(result.scorePercentage)
  const gradeConfig = getGradeConfig(score)

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="bg-white dark:bg-gray-900 rounded-2xl
        border border-gray-100 dark:border-gray-800
        shadow-sm p-8 mb-6 text-center">

        <div className="w-16 h-16 bg-yellow-100
          dark:bg-yellow-900/30 rounded-2xl flex items-center
          justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-yellow-600
            dark:text-yellow-400" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900
          dark:text-white mb-1">
          Quiz Complete!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {topic} — {result.totalQuestions} questions
        </p>

        {/* Score ring */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90"
            viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42"
              fill="none" stroke="currentColor"
              className="text-gray-100 dark:text-gray-800"
              strokeWidth="8" />
            <circle cx="50" cy="50" r="42"
              fill="none"
              stroke={score >= 70 ? '#22c55e'
                : score >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.64} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col
            items-center justify-center">
            <span className="text-3xl font-black
              text-gray-900 dark:text-white">
              {score}%
            </span>
            <span className={`text-lg font-bold
              ${gradeConfig.color}`}>
              {gradeConfig.grade}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-8">
          <div>
            <p className="text-2xl font-bold text-green-600
              dark:text-green-400">
              {result.correctAnswers}
            </p>
            <p className="text-xs text-gray-500
              dark:text-gray-400">Correct</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-red-500
              dark:text-red-400">
              {result.totalQuestions - result.correctAnswers}
            </p>
            <p className="text-xs text-gray-500
              dark:text-gray-400">Wrong</p>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-2xl font-bold text-gray-900
              dark:text-white">
              {result.totalQuestions}
            </p>
            <p className="text-xs text-gray-500
              dark:text-gray-400">Total</p>
          </div>
        </div>

        <p className={`mt-4 text-sm font-semibold
          ${gradeConfig.color}`}>
          {gradeConfig.msg}
        </p>
      </div>

      {/* Per-question feedback */}
      {result.feedback && result.feedback.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl
          border border-gray-100 dark:border-gray-800
          shadow-sm p-6 mb-6">

          <h3 className="font-bold text-gray-900 dark:text-white
            mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            Question Review
          </h3>

          <div className="space-y-3">
            {result.feedback.map((item, index) => {
              // Normalize for comparison in result screen too
              const yourAns    = item.yourAnswer?.toString().toUpperCase().trim()
              const correctAns = item.correctAnswer?.toString().toUpperCase().trim()
              const isCorrect  = yourAns === correctAns

              return (
                <div key={index}
                  className="border border-gray-100
                    dark:border-gray-800 rounded-xl overflow-hidden">

                  <div className="flex items-start gap-3 p-4">
                    {isCorrect
                      ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    }

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium
                        text-gray-900 dark:text-white mb-1">
                        {item.questionText}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span className={`flex items-center gap-1
                          ${isCorrect
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'
                          }`}>
                          Your answer: <b>{item.yourAnswer}</b>
                        </span>
                        {!isCorrect && (
                          <span className="flex items-center gap-1
                            text-green-600 dark:text-green-400">
                            Correct: <b>{item.correctAnswer}</b>
                          </span>
                        )}
                      </div>
                    </div>

                    {item.aiExplanation && (
                      <button
                        onClick={() => toggleExpand(index)}
                        className="flex-shrink-0 text-xs
                          text-primary-600 dark:text-primary-400
                          flex items-center gap-1 hover:underline">
                        Explain
                        {expanded[index]
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />
                        }
                      </button>
                    )}
                  </div>

                  {expanded[index] && item.aiExplanation && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="p-3 bg-indigo-50
                        dark:bg-indigo-900/20 rounded-xl
                        border border-indigo-100
                        dark:border-indigo-800">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Brain className="w-3.5 h-3.5
                            text-indigo-600 dark:text-indigo-400" />
                          <span className="text-xs font-semibold
                            text-indigo-700 dark:text-indigo-400">
                            AI Explanation
                          </span>
                        </div>
                        <p className="text-xs text-indigo-800
                          dark:text-indigo-300 leading-relaxed">
                          {item.aiExplanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onRetry}
          className="flex-1 flex items-center justify-center
            gap-2 py-3 bg-primary-500 hover:bg-primary-600
            text-white rounded-xl font-semibold text-sm
            shadow-sm shadow-primary-500/25
            transition-all duration-150">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <button onClick={onBack}
          className="flex-1 flex items-center justify-center
            gap-2 py-3 bg-gray-100 dark:bg-gray-800
            hover:bg-gray-200 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-300
            rounded-xl font-semibold text-sm
            transition-all duration-150">
          <Award className="w-4 h-4" />
          All Topics
        </button>
      </div>
    </div>
  )
}

// ── Main Quiz Page ─────────────────────────────────────
export default function QuizPage() {
  const [screen, setScreen]         = useState('topics')
  const [topics, setTopics]         = useState([])
  const [questions, setQuestions]   = useState([])
  const [result, setResult]         = useState(null)
  const [activeTopic, setTopic]     = useState('')
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    setLoading(true)
    try {
      const res = await getTopics()
      setTopics(res.data || [])
    } catch (err) {
      toast.error('Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (topic, count, aiMode) => {
    try {
      const res = aiMode
        ? await getAiQuestions(topic, count)
        : await getQuestions(topic, count)

      if (!res.data || res.data.length === 0) {
        toast.error('No questions available for this topic')
        return
      }
      setQuestions(res.data)
      setTopic(topic)
      setScreen('quiz')
    } catch (err) {
      toast.error('Failed to load questions')
    }
  }

  const handleSubmit = async (answers) => {
    setSubmitting(true)
    try {
      const res = await submitQuiz({
        topic: activeTopic,
        answers: answers
      })
      setResult(res.data)
      setScreen('result')
      toast.success(
        `Quiz complete! Score: ${Math.round(res.data.scorePercentage)}%`
      )
    } catch (err) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {screen === 'topics' && (
        <TopicSelectionScreen
          topics={topics}
          loading={loading}
          onStart={handleStart}
        />
      )}
      {screen === 'quiz' && (
        <QuizTakingScreen
          questions={questions}
          topic={activeTopic}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
      {screen === 'result' && (
        <ResultScreen
          result={result}
          topic={activeTopic}
          onRetry={() => handleStart(
            activeTopic, questions.length, false
          )}
          onBack={() => setScreen('topics')}
        />
      )}
    </div>
  )
}