import { useState, useEffect, useRef } from 'react'
import { sendMessage, getChatHistory } from '../api/chatApi'
import toast from 'react-hot-toast'
import {
  Send, Bot, User, Loader2,
  MessageSquare, Sparkles, Code,
  BookOpen, Cpu, RotateCcw,
  ImagePlus
} from 'lucide-react'

// ── Message Bubble Component ───────────────────────────
// Defined outside to avoid re-creation on every render
const MessageBubble = ({ message, isUser }) => {

  // Format timestamp to readable time
  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format AI response text
  // Converts **bold** and `code` markdown to styled spans
  const formatText = (text) => {
    if (!text) return ''
    return text
      .split('\n')
      .map((line, i) => (
        <span key={i}>
          {line}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      ))
  }

  return (
    // justify-end = push to right for user messages
    // justify-start = push to left for AI messages
    <div className={`flex gap-3 ${isUser
      ? 'flex-row-reverse'  // user: avatar on right
      : 'flex-row'          // AI: avatar on left
    }`}>

      {/* Avatar circle */}
      <div className={`w-8 h-8 rounded-full flex items-center
        justify-center flex-shrink-0 mt-1
        ${isUser
          ? 'bg-primary-500'                          // blue for user
          : 'bg-gradient-to-br from-indigo-500 to-purple-600' // gradient for AI
        }`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>

      {/* Message content */}
      <div className={`max-w-[75%] ${isUser
        ? 'items-end'
        : 'items-start'
      } flex flex-col gap-1`}>

        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            // User: blue bubble, white text
            ? 'bg-primary-500 text-white rounded-tr-sm'
            // AI: light gray bubble, dark text
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-gray-700 shadow-sm'
          }`}>
          {formatText(message.content || message.aiResponse || message.userMessage)}
        </div>

        {/* Timestamp below bubble */}
        <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
          {formatTime(message.createdAt || message.timestamp)}
        </span>
      </div>
    </div>
  )
}

// ── Typing Indicator Component ─────────────────────────
// 3 animated dots shown while AI is generating response
const TypingIndicator = () => (
  <div className="flex gap-3">
    {/* AI avatar */}
    <div className="w-8 h-8 rounded-full bg-gradient-to-br
      from-indigo-500 to-purple-600 flex items-center
      justify-center flex-shrink-0">
      <Bot className="w-4 h-4 text-white" />
    </div>

    {/* Animated dots bubble */}
    <div className="bg-white dark:bg-gray-800 border
      border-gray-100 dark:border-gray-700 rounded-2xl
      rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center h-4">
        {/* Each dot has a different animation delay */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{ animationDelay: `${i * 0.15}s` }}
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500
              rounded-full animate-bounce"
          />
        ))}
      </div>
    </div>
  </div>
)

// ── Suggested Question Chip ────────────────────────────
const SuggestionChip = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="flex items-center gap-2 px-4 py-2.5
      bg-white dark:bg-gray-800 border border-gray-200
      dark:border-gray-700 rounded-xl text-sm
      text-gray-700 dark:text-gray-300
      hover:border-primary-400 dark:hover:border-primary-600
      hover:text-primary-600 dark:hover:text-primary-400
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      transition-all duration-150 text-left group">
    <Sparkles className="w-3.5 h-3.5 text-primary-500
      flex-shrink-0 group-hover:scale-110
      transition-transform duration-150" />
    {text}
  </button>
)

// ── Suggested questions list ───────────────────────────
const SUGGESTIONS = [
  'Explain ArrayList vs LinkedList in Java',
  'What is the difference between Stack and Queue?',
  'How does Spring Security work?',
  'Explain HashMap internal working',
  'What is Dynamic Programming?',
  'How to prepare for Java backend interviews?',
]

// ── Main Chat Component ────────────────────────────────
export default function ChatPage() {

  // messages = array of { id, role: 'user'|'ai', content, createdAt }
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)  // AI is typing
  const [fetching, setFetching]   = useState(true)   // loading history

  // useRef — holds reference to bottom of messages list
  // Used to auto-scroll when new message arrives
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  

  // ── Load chat history on page open ────────────────
  useEffect(() => {
    loadHistory()
  }, [])

  // ── Auto-scroll to bottom when messages change ────
  useEffect(() => {
    // Small delay so DOM updates before scrolling
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [messages, loading])

  const loadHistory = async () => {
    setFetching(true)
    try {
      const res = await getChatHistory()
      const history = res.data || []

      // Convert backend format to our message format
      // Backend returns { userMessage, aiResponse, createdAt }
      // We split each into two separate message objects
      const formatted = []
      history.forEach(item => {
        // User message
        formatted.push({
          id: `u-${item.id}`,
          role: 'user',
          content: item.userMessage,
          createdAt: item.createdAt
        })
        // AI response
        formatted.push({
          id: `a-${item.id}`,
          role: 'ai',
          content: item.aiResponse,
          createdAt: item.createdAt
        })
      })
      setMessages(formatted)
    } catch (err) {
      console.error('History load error:', err)
    } finally {
      setFetching(false)
    }
  }

  // ── Send message ───────────────────────────────────
  const handleSend = async (text) => {
    // Use provided text (from suggestion) or input field value
    const messageText = text || input.trim()
    if (!messageText || loading) return

    // Clear input immediately for better UX
    setInput('')

    // Add user message to UI right away (don't wait for API)
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true) // show typing indicator

    try {
      const res = await sendMessage({ message: messageText })

      // Add AI response to messages
      const aiMsg = {
        id: `a-${Date.now()}`,
        role: 'ai',
        content: res.data.aiResponse,
        createdAt: res.data.createdAt
      }
      setMessages(prev => [...prev, aiMsg])

    } catch (err) {
      toast.error('Failed to get AI response')
      // Remove the user message if AI failed
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      setLoading(false)
      // Refocus input after response
      inputRef.current?.focus()
    }
  }

  // ── Handle Enter key in input ──────────────────────
  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Clear chat ─────────────────────────────────────
  const handleClear = () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  const isEmpty = messages.length === 0 && !fetching

  // ── UI ─────────────────────────────────────────────
  return (
    // flex flex-col h-screen = full height, vertical layout
    // This is key for chat UI — header + scrollable messages + input
    <div className="flex flex-col h-screen
      bg-gray-50 dark:bg-gray-950">

      {/* ── Chat Header ── */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900
        border-b border-gray-200 dark:border-gray-800
        px-6 py-4">

        <div className="flex items-center justify-between
          max-w-4xl mx-auto">

          <div className="flex items-center gap-3">
            {/* AI avatar */}
            <div className="w-10 h-10 bg-gradient-to-br
              from-indigo-500 to-purple-600 rounded-xl
              flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">
                EduAI Assistant
              </h1>
              <div className="flex items-center gap-1.5">
                {/* Green online dot */}
                <div className="w-2 h-2 bg-green-500 rounded-full
                  animate-pulse" />
                <span className="text-xs text-gray-500
                  dark:text-gray-400">
                  Powered by Groq LLaMA
                </span>
              </div>
            </div>
          </div>

          {/* Right side: message count + clear button */}
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <span className="text-xs text-gray-400
                dark:text-gray-500">
                {Math.floor(messages.length / 2)} messages
              </span>
            )}
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5
                  text-xs text-gray-500 dark:text-gray-400
                  hover:text-red-500 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  rounded-lg transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages Area ── */}
      {/* flex-1 = takes remaining height */}
      {/* overflow-y-auto = scroll inside this area only */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* Loading history skeleton */}
          {fetching ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex gap-3
                  ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-gray-200
                    dark:bg-gray-700 rounded-full
                    animate-pulse flex-shrink-0" />
                  <div className={`h-12 bg-gray-200
                    dark:bg-gray-700 rounded-2xl animate-pulse
                    ${i % 2 === 0 ? 'w-48' : 'w-72'}`} />
                </div>
              ))}
            </div>

          ) : isEmpty ? (
            // ── Empty state with suggestions ──
            <div className="flex flex-col items-center
              justify-center min-h-[60vh] text-center px-4">

              {/* Big AI icon */}
              <div className="w-20 h-20 bg-gradient-to-br
                from-indigo-500 to-purple-600 rounded-3xl
                flex items-center justify-center mb-6
                shadow-lg shadow-indigo-500/25">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900
                dark:text-white mb-2">
                Ask me anything!
              </h2>
              <p className="text-gray-500 dark:text-gray-400
                mb-8 max-w-md">
                I can help you with Java, DSA, Spring Boot,
                SQL, interview prep, and more.
              </p>

              {/* Feature chips */}
              <div className="flex flex-wrap justify-center
                gap-2 mb-8">
                {[
                  { icon: Code,     label: 'Code help' },
                  { icon: BookOpen, label: 'Concepts' },
                  { icon: Cpu,      label: 'DSA' },
                  { icon: Sparkles, label: 'Interview prep' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label}
                    className="flex items-center gap-1.5 px-3
                    py-1.5 bg-primary-50 dark:bg-primary-900/20
                    text-primary-700 dark:text-primary-400
                    rounded-lg text-xs font-medium">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Suggested questions */}
              <p className="text-sm font-medium text-gray-500
                dark:text-gray-400 mb-3">
                Try asking:
              </p>
              <div className="flex flex-wrap justify-center gap-2
                max-w-2xl">
                {SUGGESTIONS.map(s => (
                  <SuggestionChip
                    key={s}
                    text={s}
                    onClick={handleSend}
                  />
                ))}
              </div>
            </div>

          ) : (
            // ── Message list ──
            <div className="space-y-6">

              {/* Render each message */}
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isUser={msg.role === 'user'}
                />
              ))}

              {/* Typing indicator — shown while waiting for AI */}
              {loading && <TypingIndicator />}

              {/* Invisible div at bottom — used for auto-scroll */}
              <div ref={bottomRef} />
            </div>
          )}

        </div>
      </div>

      {/* ── Input Area ── */}
      {/* flex-shrink-0 = never shrink, always stays at bottom */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-800 px-4 py-4">

        <div className="max-w-4xl mx-auto">

          {/* Suggestion chips above input when messages exist */}
          {!isEmpty && !fetching && (
            <div className="flex gap-2 mb-3 overflow-x-auto
              scrollbar-thin pb-1">
              {SUGGESTIONS.slice(0, 3).map(s => (
                <SuggestionChip
                  key={s}
                  text={s}
                  onClick={handleSend}
                />
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="flex gap-3 items-end">

            {/* Textarea grows with content */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about Java, DSA, interviews..."
                rows={1}
                // style allows textarea to grow up to 5 rows
                style={{ resize: 'none' }}
                className="w-full px-4 py-3 rounded-xl
                  border border-gray-200 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:border-primary-500 focus:ring-2
                  focus:ring-primary-500/20
                  text-sm leading-relaxed
                 transition-all duration-150
                 max-h-32 overflow-hidden"
                onInput={e => {
                  // Auto-resize textarea height
                  e.target.style.height = 'auto'
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 128) + 'px'
                }}
              />
              {/* Hint text */}
              {/* <p className="absolute bottom-2.5 right-3
                text-xs text-gray-300 dark:text-gray-600
                pointer-events-none">
                Enter ↵
              </p> */}
            </div>

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 flex items-center justify-center
                bg-primary-500 hover:bg-primary-600
                active:bg-primary-700 text-white rounded-xl
                shadow-sm shadow-primary-500/25
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150 flex-shrink-0">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>

          </div>

          {/* Bottom hint */}
          <p className="text-xs text-center text-gray-400
            dark:text-gray-500 mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>

        </div>
      </div>

    </div>
  )
}