import { useState, useRef } from 'react'
import { analyzeResume, getResumeHistory } from '../api/resumeApi'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Upload, FileText, CheckCircle2, XCircle,
  Loader2, Sparkles, AlertCircle, Clock,
  ChevronDown, ChevronUp, RefreshCw, Target
} from 'lucide-react'

// ── Score Ring Component ───────────────────────────────
// Draws SVG circular progress ring showing ATS score
const ScoreRing = ({ score, size = 160 }) => {
  const radius      = 54
  const circumference = 2 * Math.PI * radius  // ≈ 339
  const progress    = (score / 100) * circumference
  const remaining   = circumference - progress

  // Color based on score
  const color = score >= 70
    ? '#22c55e'   // green
    : score >= 50
    ? '#f59e0b'   // yellow
    : '#ef4444'   // red

  const textColor = score >= 70
    ? 'text-green-600 dark:text-green-400'
    : score >= 50
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400'

  const label = score >= 70
    ? 'Good'
    : score >= 50
    ? 'Average'
    : 'Needs Work'

  return (
    <div className="flex flex-col items-center">
      {/* SVG ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          // Rotate so progress starts from top
          className="-rotate-90">

          {/* Background ring — full circle gray */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-800"
            strokeWidth="10"
          />

          {/* Progress ring — colored arc */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            // dasharray = filled + gap
            strokeDasharray={`${progress} ${remaining}`}
            // Smooth animation when score appears
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>

        {/* Score text in center of ring */}
        <div className="absolute inset-0 flex flex-col
          items-center justify-center">
          <span className={`text-3xl font-black
            text-gray-900 dark:text-white`}>
            {score}
          </span>
          <span className="text-xs text-gray-500
            dark:text-gray-400 font-medium">
            / 100
          </span>
        </div>
      </div>

      {/* Label below ring */}
      <div className={`mt-2 px-3 py-1 rounded-full text-sm
        font-semibold ${textColor}
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

// ── Skill Chip Component ───────────────────────────────
const SkillChip = ({ skill, type }) => (
  <span className={`inline-flex items-center gap-1.5
    px-3 py-1.5 rounded-xl text-xs font-medium
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

// ── History Card Component ─────────────────────────────
const HistoryCard = ({ item, onClick, isExpanded }) => {
  const score = item.atsScore
  const color = score >= 70
    ? 'text-green-600 dark:text-green-400'
    : score >= 50
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400'

  const bg = score >= 70
    ? 'bg-green-50 dark:bg-green-900/20'
    : score >= 50
    ? 'bg-yellow-50 dark:bg-yellow-900/20'
    : 'bg-red-50 dark:bg-red-900/20'

  return (
    <div className="border border-gray-100 dark:border-gray-800
      rounded-xl overflow-hidden">

      {/* Card header — always visible */}
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4
          hover:bg-gray-50 dark:hover:bg-gray-800/50
          transition-colors text-left">

        {/* Score badge */}
        <div className={`w-14 h-14 rounded-xl ${bg} flex
          flex-col items-center justify-center flex-shrink-0`}>
          <span className={`text-lg font-black ${color}`}>
            {score}
          </span>
          <span className="text-xs text-gray-500">ATS</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900
            dark:text-white truncate">
            {item.fileName || 'Resume'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {item.analyzedAt
                ? new Date(item.analyzedAt)
                    .toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short',
                      year: 'numeric'
                    })
                : 'Unknown date'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-lg text-xs
            font-bold ${color} ${bg}`}>
            {item.overallGrade}
          </span>
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100
          dark:border-gray-800">
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2
            gap-4">

            {/* Present skills */}
            {item.presentSkills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500
                  dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Skills Found
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.presentSkills.map(s => (
                    <SkillChip key={s} skill={s} type="present" />
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills */}
            {item.missingSkills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500
                  dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Missing Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.missingSkills.map(s => (
                    <SkillChip key={s} skill={s} type="missing" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Resume Page ───────────────────────────────────
export default function ResumePage() {

  const [file, setFile]           = useState(null)
  const [dragging, setDragging]   = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult]       = useState(null)
  const [history, setHistory]     = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  // Ref for hidden file input
  const fileInputRef = useRef(null)

  // Load history on page open
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await getResumeHistory()
      setHistory(res.data || [])
    } catch (err) {
      console.error('History error:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  // ── File selection ─────────────────────────────────
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    // Only allow PDF files
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are supported')
      return
    }

    // Max 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB allowed')
      return
    }

    setFile(selectedFile)
    setResult(null) // clear previous result
  }

  // ── Drag and drop handlers ─────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault()  // required to allow drop
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    // Get dropped file
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  // ── Analyze resume ─────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) return

    setAnalyzing(true)
    try {
      // FormData is required for file upload
      const formData = new FormData()
      formData.append('file', file)

      const res = await analyzeResume(formData)
      setResult(res.data)

      // Add to history at top
      setHistory(prev => [res.data, ...prev])
      toast.success('Resume analyzed successfully!')

    } catch (err) {
      const msg = err.response?.data?.message
        || 'Analysis failed. Please try again.'
      toast.error(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Format bytes to human readable ────────────────
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900
          dark:text-white mb-1">
          Resume Analyzer
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload your PDF resume to get ATS score,
          skill gaps, and AI-powered suggestions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Upload section ── */}
        <div className="space-y-4">

          {/* Drag and drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed
              rounded-2xl p-8 text-center cursor-pointer
              transition-all duration-200
              ${dragging
                // Blue glow when dragging file over
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
                : file
                // Green when file selected
                ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                // Default dashed gray
                : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => handleFileSelect(e.target.files[0])}
            />

            {file ? (
              // File selected state
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100
                  dark:bg-green-900/30 rounded-2xl flex
                  items-center justify-center mb-3">
                  <FileText className="w-7 h-7 text-green-600
                    dark:text-green-400" />
                </div>
                <p className="font-semibold text-gray-900
                  dark:text-white mb-1 text-sm">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500
                  dark:text-gray-400">
                  {formatSize(file.size)} · Click to change
                </p>
              </div>
            ) : (
              // Empty state
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex
                  items-center justify-center mb-3
                  ${dragging
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                  <Upload className={`w-7 h-7
                    ${dragging
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-400'
                    }`} />
                </div>
                <p className="font-semibold text-gray-700
                  dark:text-gray-300 mb-1">
                  {dragging
                    ? 'Drop your PDF here!'
                    : 'Drag & drop your resume'}
                </p>
                <p className="text-xs text-gray-500
                  dark:text-gray-400">
                  or click to browse · PDF only · Max 10MB
                </p>
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className="w-full flex items-center justify-center
              gap-2 py-3.5 rounded-xl font-semibold text-sm
              bg-primary-500 hover:bg-primary-600 text-white
              shadow-sm shadow-primary-500/25
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150">
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing your resume...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Resume
              </>
            )}
          </button>

          {/* Analyzing progress hint */}
          {analyzing && (
            <div className="flex items-start gap-3 p-4
              bg-blue-50 dark:bg-blue-900/20 rounded-xl
              border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-4 h-4 text-blue-600
                dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700
                dark:text-blue-300">
                Extracting text from PDF, calculating ATS
                score, and generating AI suggestions.
                This takes 10-20 seconds...
              </p>
            </div>
          )}

          {/* How it works info */}
          {!result && !analyzing && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50
              rounded-xl border border-gray-100
              dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500
                dark:text-gray-400 mb-2 uppercase tracking-wide">
                How it works
              </p>
              <div className="space-y-2">
                {[
                  'PDF text is extracted automatically',
                  'Keywords matched against role skill lists',
                  'ATS score calculated based on matches',
                  'AI generates improvement suggestions',
                ].map((step, i) => (
                  <div key={i}
                    className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary-100
                      dark:bg-primary-900/30 text-primary-600
                      dark:text-primary-400 rounded-full
                      flex items-center justify-center
                      text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-600
                      dark:text-gray-400">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Result section ── */}
        <div>
          {result ? (
            <div className="space-y-4">

              {/* Score card */}
              <div className="bg-white dark:bg-gray-900
                rounded-2xl border border-gray-100
                dark:border-gray-800 shadow-sm p-6">

                <div className="flex items-start
                  justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900
                      dark:text-white mb-1">
                      ATS Analysis Result
                    </h3>
                    <p className="text-xs text-gray-500
                      dark:text-gray-400">
                      {result.fileName}
                    </p>
                  </div>
                  {/* Analyze another button */}
                  <button
                    onClick={() => {
                      setFile(null)
                      setResult(null)
                    }}
                    className="flex items-center gap-1.5
                      text-xs text-gray-500 hover:text-primary-600
                      dark:hover:text-primary-400
                      transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    New analysis
                  </button>
                </div>

                {/* Score ring centered */}
                <div className="flex justify-center mb-6">
                  <ScoreRing score={result.atsScore} />
                </div>

                {/* Skills two columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2
                  gap-4">

                  {/* Present skills */}
                  <div>
                    <p className="text-xs font-semibold
                      text-gray-500 dark:text-gray-400
                      uppercase tracking-wide mb-2 flex
                      items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5
                        text-green-500" />
                      Skills Found
                      <span className="ml-auto text-green-600
                        dark:text-green-400 font-bold">
                        {result.presentSkills?.length || 0}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.presentSkills?.map(s => (
                        <SkillChip key={s} skill={s}
                          type="present" />
                      ))}
                    </div>
                  </div>

                  {/* Missing skills */}
                  <div>
                    <p className="text-xs font-semibold
                      text-gray-500 dark:text-gray-400
                      uppercase tracking-wide mb-2 flex
                      items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5
                        text-red-500" />
                      Missing Skills
                      <span className="ml-auto text-red-600
                        dark:text-red-400 font-bold">
                        {result.missingSkills?.length || 0}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills?.map(s => (
                        <SkillChip key={s} skill={s}
                          type="missing" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <div className="bg-white dark:bg-gray-900
                  rounded-2xl border border-gray-100
                  dark:border-gray-800 shadow-sm p-5">
                  <h4 className="font-semibold text-gray-900
                    dark:text-white mb-3 flex items-center
                    gap-2 text-sm">
                    <span className="text-green-500">💪</span>
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i}
                        className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4
                          text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700
                          dark:text-gray-300">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="bg-white dark:bg-gray-900
                  rounded-2xl border border-gray-100
                  dark:border-gray-800 shadow-sm p-5">
                  <h4 className="font-semibold text-gray-900
                    dark:text-white mb-3 flex items-center
                    gap-2 text-sm">
                    <Target className="w-4 h-4
                      text-primary-500" />
                    Improvement Suggestions
                  </h4>
                  <ol className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <li key={i}
                        className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-primary-100
                          dark:bg-primary-900/30 text-primary-600
                          dark:text-primary-400 rounded-full
                          flex items-center justify-center
                          text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700
                          dark:text-gray-300">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

          ) : (
            // Empty result state
            <div className="h-full flex flex-col items-center
              justify-center py-16 text-center
              bg-white dark:bg-gray-900 rounded-2xl
              border border-gray-100 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-100
                dark:bg-gray-800 rounded-2xl flex items-center
                justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-500
                dark:text-gray-400 mb-1">
                No analysis yet
              </p>
              <p className="text-sm text-gray-400
                dark:text-gray-500">
                Upload your PDF to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── History section ── */}
      {(history.length > 0 || loadingHistory) && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900
              dark:text-white">
              Past Analyses
            </h2>
            <span className="text-sm text-gray-500
              dark:text-gray-400">
              {history.length} total
            </span>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-gray-100
                  dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900
              rounded-2xl border border-gray-100
              dark:border-gray-800 shadow-sm divide-y
              divide-gray-100 dark:divide-gray-800 overflow-hidden">
              {history.map((item, index) => (
                <HistoryCard
                  key={item.id || index}
                  item={item}
                  isExpanded={expandedId === (item.id || index)}
                  onClick={() => setExpandedId(
                    expandedId === (item.id || index)
                      ? null
                      : (item.id || index)
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}