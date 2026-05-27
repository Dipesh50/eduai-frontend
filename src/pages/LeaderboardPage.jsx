import { useState, useEffect } from 'react'
import { getLeaderboard, getTopicLeaderboard } from '../api/leaderboardApi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Trophy, Medal, Crown, Flame,
  BookOpen, ChevronRight, RefreshCw,
  TrendingUp, Star, Award
} from 'lucide-react'

// ── Medal config ───────────────────────────────────────
const MEDAL_CONFIG = {
  1: {
    icon: Crown,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-300 dark:border-yellow-700',
    ring: 'ring-4 ring-yellow-400/30',
    size: 'w-20 h-20',
    label: 'Gold'
  },
  2: {
    icon: Medal,
    color: 'text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    ring: 'ring-4 ring-gray-300/30',
    size: 'w-16 h-16',
    label: 'Silver'
  },
  3: {
    icon: Award,
    color: 'text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-300 dark:border-orange-700',
    ring: 'ring-4 ring-orange-300/30',
    size: 'w-14 h-14',
    label: 'Bronze'
  }
}

// ── Topics list ────────────────────────────────────────
const TOPICS = [
  'All Topics', 'Java', 'DSA', 'SQL',
  'Spring Boot', 'System Design'
]

// ── Podium Component ───────────────────────────────────
// Shows top 3 students in a podium layout
const Podium = ({ entries, currentUser }) => {

  // Reorder for podium: 2nd, 1st, 3rd
  // This creates the classic podium shape
  const podiumOrder = [
    entries[1], // 2nd place — left
    entries[0], // 1st place — center (tallest)
    entries[2], // 3rd place — right
  ].filter(Boolean) // remove undefined if less than 3

  const ranks = [2, 1, 3]

  return (
    <div className="flex items-end justify-center gap-4
      mb-8 px-4">
      {podiumOrder.map((entry, i) => {
        const rank = ranks[i]
        const cfg  = MEDAL_CONFIG[rank]
        const Icon = cfg.icon
        const isMe = entry.studentName === currentUser?.name

        // Height differs per position
        const heights = { 2: 'h-28', 1: 'h-36', 3: 'h-24' }
        const height  = heights[rank]

        return (
          <div key={entry.studentName}
            className="flex flex-col items-center gap-2
              flex-1 max-w-[140px]">

            {/* Medal icon above avatar */}
            <Icon className={`w-6 h-6 ${cfg.color}`} />

            {/* Avatar circle */}
            <div className={`${cfg.size} rounded-full
              ${cfg.bg} border-2 ${cfg.border} ${cfg.ring}
              flex items-center justify-center
              text-2xl font-black
              ${isMe ? 'ring-primary-400/50' : ''}
              transition-transform duration-200
              hover:scale-105`}>
              {entry.studentName?.[0]?.toUpperCase()}
            </div>

            {/* Name */}
            <div className="text-center">
              <p className={`text-xs font-bold truncate
                max-w-[120px]
                ${isMe
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-900 dark:text-white'
                }`}>
                {entry.studentName}
                {isMe && ' (You)'}
              </p>
              <p className="text-xs text-gray-500
                dark:text-gray-400">
                {entry.averageScore}%
              </p>
            </div>

            {/* Podium base — different heights */}
            <div className={`w-full ${height} rounded-t-xl
              flex items-start justify-center pt-3
              ${rank === 1
                ? 'bg-gradient-to-b from-yellow-400 to-yellow-500'
                : rank === 2
                ? 'bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700'
                : 'bg-gradient-to-b from-orange-300 to-orange-400'
              }`}>
              <span className="text-white font-black text-xl">
                #{rank}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Rank Row Component ─────────────────────────────────
// One row in the leaderboard table
const RankRow = ({ entry, currentUser }) => {
  const isMe  = entry.studentName === currentUser?.name
  const isTop = entry.rank <= 3
  const cfg   = isTop ? MEDAL_CONFIG[entry.rank] : null

  return (
    <div className={`flex items-center gap-4 p-4
      rounded-xl transition-all duration-200
      ${isMe
        // Highlight current user's row
        ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800'
        : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-sm'
      }`}>

      {/* Rank badge */}
      <div className={`w-10 h-10 rounded-xl flex items-center
        justify-center flex-shrink-0 font-black text-sm
        ${isTop
          ? `${cfg.bg} ${cfg.color}`
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
        {isTop && cfg
          ? <cfg.icon className="w-5 h-5" />
          : `#${entry.rank}`
        }
      </div>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center
        justify-center text-sm font-bold flex-shrink-0
        ${isMe
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
        {entry.studentName?.[0]?.toUpperCase()}
      </div>

      {/* Name + quizzes */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate
          ${isMe
            ? 'text-primary-700 dark:text-primary-300'
            : 'text-gray-900 dark:text-white'
          }`}>
          {entry.studentName}
          {isMe && (
            <span className="ml-2 text-xs font-normal
              text-primary-500">
              (You)
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {entry.quizzesTaken} quizzes taken
        </p>
      </div>

      {/* Streak */}
      {entry.currentStreak > 0 && (
        <div className="flex items-center gap-1
          text-orange-500 flex-shrink-0">
          <Flame className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">
            {entry.currentStreak}
          </span>
        </div>
      )}

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p className={`font-black text-lg
          ${entry.averageScore >= 80
            ? 'text-green-600 dark:text-green-400'
            : entry.averageScore >= 60
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-gray-700 dark:text-gray-300'
          }`}>
          {entry.averageScore}%
        </p>
        <p className="text-xs text-gray-400
          dark:text-gray-500">avg score</p>
      </div>
    </div>
  )
}

// ── My Rank Card ───────────────────────────────────────
const MyRankCard = ({ rank, total }) => (
  <div className="bg-gradient-to-r from-primary-500
    to-indigo-600 rounded-2xl p-5 text-white mb-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-primary-100 text-sm font-medium
          mb-1">
          Your Rank
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black">
            #{rank || '--'}
          </span>
          {total > 0 && (
            <span className="text-primary-200 text-sm">
              of {total}
            </span>
          )}
        </div>
      </div>
      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm
        rounded-2xl flex items-center justify-center">
        <Trophy className="w-8 h-8 text-white" />
      </div>
    </div>

    {/* Rank message */}
    <p className="text-primary-100 text-xs mt-3">
      {!rank
        ? 'Take quizzes to appear on the leaderboard!'
        : rank === 1
        ? '🏆 You are #1! Amazing work!'
        : rank <= 3
        ? `🥉 Top 3! Keep it up!`
        : rank <= 10
        ? `⭐ Top 10! Great performance!`
        : '💪 Keep taking quizzes to climb higher!'
      }
    </p>
  </div>
)

// ── Main Leaderboard Page ──────────────────────────────
export default function LeaderboardPage() {
  const { user }  = useAuth()

  const [data, setData]           = useState(null)
  const [activeTopic, setTopic]   = useState('All Topics')
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load on mount and when topic changes
  useEffect(() => {
    loadLeaderboard()
  }, [activeTopic])

  const loadLeaderboard = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const res = activeTopic === 'All Topics'
        ? await getLeaderboard()
        : await getTopicLeaderboard(activeTopic)
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const entries    = data?.entries || []
  const myRank     = data?.myRank || 0
  const top3       = entries.slice(0, 3)
  const restOfList = entries.slice(3)

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900
            dark:text-white mb-1">
            Leaderboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Top students ranked by quiz performance
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => loadLeaderboard(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2
            text-sm text-gray-500 dark:text-gray-400
            hover:text-primary-600 dark:hover:text-primary-400
            hover:bg-gray-100 dark:hover:bg-gray-800
            rounded-xl transition-colors">
          <RefreshCw className={`w-4 h-4
            ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* My rank card */}
      <MyRankCard
        rank={myRank}
        total={entries.length}
      />

      {/* Topic tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto
        scrollbar-thin pb-1">
        {TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => setTopic(topic)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl
              text-sm font-medium transition-all duration-150
              ${activeTopic === topic
                ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              }`}>
            {topic}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {/* Podium skeleton */}
          <div className="flex items-end justify-center
            gap-4 mb-8 h-48">
            {[1,2,3].map(i => (
              <div key={i}
                className="flex-1 max-w-[140px] space-y-2
                  flex flex-col items-center">
                <div className="w-14 h-14 bg-gray-200
                  dark:bg-gray-700 rounded-full
                  animate-pulse" />
                <div className="w-full h-24 bg-gray-200
                  dark:bg-gray-700 rounded-t-xl
                  animate-pulse" />
              </div>
            ))}
          </div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-gray-100
              dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>

      ) : entries.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center
          justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100
            dark:bg-gray-800 rounded-3xl flex items-center
            justify-center mb-4">
            <Trophy className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white
            mb-1">
            No rankings yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400
            mb-6 max-w-xs">
            {activeTopic === 'All Topics'
              ? 'Be the first! Take some quizzes to appear on the leaderboard.'
              : `No one has taken a ${activeTopic} quiz yet. Be the first!`
            }
          </p>
          <button
            onClick={() => window.location.href = '/quiz'}
            className="flex items-center gap-2 px-5 py-2.5
              bg-primary-500 hover:bg-primary-600 text-white
              rounded-xl text-sm font-semibold
              shadow-sm shadow-primary-500/25
              transition-all duration-150">
            <BookOpen className="w-4 h-4" />
            Take a Quiz
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      ) : (
        <>
          {/* Podium for top 3 */}
          {top3.length >= 2 && (
            <div className="bg-white dark:bg-gray-900
              rounded-2xl border border-gray-100
              dark:border-gray-800 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500
                  fill-yellow-500" />
                <h2 className="font-bold text-gray-900
                  dark:text-white">
                  Top 3
                </h2>
              </div>
              <Podium entries={top3} currentUser={user} />
            </div>
          )}

          {/* Full rankings table */}
          <div className="bg-white dark:bg-gray-900
            rounded-2xl border border-gray-100
            dark:border-gray-800 shadow-sm p-6">

            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5
                text-primary-500" />
              <h2 className="font-bold text-gray-900
                dark:text-white">
                Full Rankings
              </h2>
              <span className="ml-auto text-xs text-gray-500
                dark:text-gray-400">
                {entries.length} students
              </span>
            </div>

            <div className="space-y-2">
              {/* Top 3 in the list */}
              {entries.slice(0, 3).map(entry => (
                <RankRow
                  key={entry.studentName}
                  entry={entry}
                  currentUser={user}
                />
              ))}

              {/* Divider if there are more */}
              {restOfList.length > 0 && (
                <div className="flex items-center gap-3
                  py-2">
                  <div className="flex-1 h-px bg-gray-100
                    dark:bg-gray-800" />
                  <span className="text-xs text-gray-400
                    dark:text-gray-500">
                    Other rankings
                  </span>
                  <div className="flex-1 h-px bg-gray-100
                    dark:bg-gray-800" />
                </div>
              )}

              {/* Rest of rankings */}
              {restOfList.map(entry => (
                <RankRow
                  key={entry.studentName}
                  entry={entry}
                  currentUser={user}
                />
              ))}
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              {
                label: 'Total Students',
                value: entries.length,
                icon: '👥'
              },
              {
                label: 'Top Score',
                value: entries[0]
                  ? `${entries[0].averageScore}%`
                  : '--',
                icon: '🏆'
              },
              {
                label: 'Avg Score',
                value: entries.length > 0
                  ? `${Math.round(
                      entries.reduce((s, e) =>
                        s + e.averageScore, 0
                      ) / entries.length
                    )}%`
                  : '--',
                icon: '📊'
              },
            ].map(({ label, value, icon }) => (
              <div key={label}
                className="bg-white dark:bg-gray-900
                  rounded-xl border border-gray-100
                  dark:border-gray-800 p-4 text-center">
                <span className="text-2xl mb-1 block">
                  {icon}
                </span>
                <p className="text-lg font-black
                  text-gray-900 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-gray-500
                  dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}