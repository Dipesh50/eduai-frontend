import { useState, useEffect } from 'react'
import {
  getNotes, createNote, updateNote,
  deleteNote, searchNotes
} from '../api/notesApi'
import toast from 'react-hot-toast'
import {
  StickyNote, Plus, Search, Edit2, Trash2,
  X, Save, Tag, BookOpen, Loader2,
  FileText, Clock, Filter
} from 'lucide-react'

// ── Topic colors ───────────────────────────────────────
const TOPIC_COLORS = {
  'Java':          'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'DSA':           'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'SQL':           'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Spring Boot':   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'System Design': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  'Other':         'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
}

const TOPICS = ['All', 'Java', 'DSA', 'SQL',
  'Spring Boot', 'System Design', 'Other']

// ── Note Card Component ────────────────────────────────
// Defined outside to prevent focus loss
const NoteCard = ({ note, onEdit, onDelete }) => {

  // Format date to readable string
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  // Truncate content preview to 100 chars
  const preview = note.content
    ? note.content.length > 100
      ? note.content.substring(0, 100) + '...'
      : note.content
    : 'No content'

  const topicColor = TOPIC_COLORS[note.topic]
    || TOPIC_COLORS['Other']

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl
      border border-gray-100 dark:border-gray-800
      shadow-sm hover:shadow-md transition-all duration-200
      group flex flex-col">

      {/* Card header */}
      <div className="p-5 flex-1">

        {/* Topic badge + tag */}
        <div className="flex items-center gap-2 mb-3">
          {note.topic && (
            <span className={`px-2.5 py-1 rounded-lg
              text-xs font-semibold ${topicColor}`}>
              {note.topic}
            </span>
          )}
          {note.tag && (
            <span className="flex items-center gap-1
              px-2 py-1 bg-gray-100 dark:bg-gray-800
              text-gray-500 dark:text-gray-400
              rounded-lg text-xs">
              <Tag className="w-2.5 h-2.5" />
              {note.tag}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white
          mb-2 text-sm leading-snug line-clamp-2">
          {note.title}
        </h3>

        {/* Content preview */}
        <p className="text-xs text-gray-500 dark:text-gray-400
          leading-relaxed line-clamp-3">
          {preview}
        </p>
      </div>

      {/* Card footer */}
      <div className="px-5 pb-4 flex items-center
        justify-between border-t border-gray-50
        dark:border-gray-800 pt-3">

        {/* Date */}
        <div className="flex items-center gap-1.5
          text-gray-400 dark:text-gray-500">
          <Clock className="w-3 h-3" />
          <span className="text-xs">
            {formatDate(note.updatedAt || note.createdAt)}
          </span>
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex gap-1 opacity-0
          group-hover:opacity-100 transition-opacity
          duration-150">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg text-gray-400
              hover:text-primary-600 dark:hover:text-primary-400
              hover:bg-primary-50 dark:hover:bg-primary-900/20
              transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note)}
            className="p-1.5 rounded-lg text-gray-400
              hover:text-red-500 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-900/20
              transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Note Modal (Create / Edit) ─────────────────────────
// Defined outside to prevent re-creation
const NoteModal = ({
  isOpen, onClose, onSave,
  editingNote, saving
}) => {
  const [form, setForm] = useState({
    title: '', content: '', topic: '', tag: ''
  })

  // When editingNote changes populate the form
  useEffect(() => {
    if (editingNote) {
      setForm({
        title:   editingNote.title   || '',
        content: editingNote.content || '',
        topic:   editingNote.topic   || '',
        tag:     editingNote.tag     || '',
      })
    } else {
      // Reset form for new note
      setForm({ title: '', content: '', topic: '', tag: '' })
    }
  }, [editingNote, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    onSave(form)
  }

  return (
    // Backdrop overlay
    <div
      className="fixed inset-0 bg-black/50
        backdrop-blur-sm z-50 flex items-center
        justify-center p-4"
      // Close on backdrop click
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}>

      {/* Modal card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl
        shadow-2xl w-full max-w-lg border border-gray-200
        dark:border-gray-700 overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between
          px-6 py-4 border-b border-gray-100
          dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-gray-900
              dark:text-white">
              {editingNote ? 'Edit Note' : 'New Note'}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg text-gray-400
              hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold
              text-gray-500 dark:text-gray-400 uppercase
              tracking-wide mb-1.5">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Java HashMap Notes"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl
                border border-gray-200 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:border-primary-500 focus:ring-2
                focus:ring-primary-500/20 text-sm
                transition-all duration-150"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold
              text-gray-500 dark:text-gray-400 uppercase
              tracking-wide mb-1.5">
              Content
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your notes here..."
              rows={6}
              className="w-full px-4 py-2.5 rounded-xl
                border border-gray-200 dark:border-gray-700
                bg-gray-50 dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:border-primary-500 focus:ring-2
                focus:ring-primary-500/20 text-sm
                leading-relaxed resize-none
                transition-all duration-150"
            />
          </div>

          {/* Topic + Tag row */}
          <div className="grid grid-cols-2 gap-3">

            {/* Topic dropdown */}
            <div>
              <label className="block text-xs font-semibold
                text-gray-500 dark:text-gray-400 uppercase
                tracking-wide mb-1.5">
                Topic
              </label>
              <select
                name="topic"
                value={form.topic}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl
                  border border-gray-200 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  focus:border-primary-500 focus:ring-2
                  focus:ring-primary-500/20 text-sm
                  transition-all duration-150 cursor-pointer">
                <option value="">Select topic</option>
                {TOPICS.filter(t => t !== 'All').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Tag input */}
            <div>
              <label className="block text-xs font-semibold
                text-gray-500 dark:text-gray-400 uppercase
                tracking-wide mb-1.5">
                Tag
              </label>
              <input
                type="text"
                name="tag"
                value={form.tag}
                onChange={handleChange}
                placeholder="e.g. important"
                className="w-full px-3 py-2.5 rounded-xl
                  border border-gray-200 dark:border-gray-700
                  bg-gray-50 dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:border-primary-500 focus:ring-2
                  focus:ring-primary-500/20 text-sm
                  transition-all duration-150"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm
                font-semibold bg-gray-100 dark:bg-gray-800
                hover:bg-gray-200 dark:hover:bg-gray-700
                text-gray-700 dark:text-gray-300
                transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center
                gap-2 py-2.5 rounded-xl text-sm font-semibold
                bg-primary-500 hover:bg-primary-600 text-white
                shadow-sm shadow-primary-500/25
                disabled:opacity-60 transition-all duration-150">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingNote ? 'Update' : 'Save Note'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete Confirmation Dialog ─────────────────────────
const DeleteDialog = ({ note, onConfirm, onCancel, deleting }) => {
  if (!note) return null

  return (
    <div className="fixed inset-0 bg-black/50
      backdrop-blur-sm z-50 flex items-center
      justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl
        shadow-2xl w-full max-w-sm border border-gray-200
        dark:border-gray-700 p-6">

        {/* Warning icon */}
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30
          rounded-2xl flex items-center justify-center
          mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600
            dark:text-red-400" />
        </div>

        <h3 className="text-lg font-bold text-gray-900
          dark:text-white text-center mb-1">
          Delete Note?
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400
          text-center mb-6">
          "<span className="font-medium text-gray-700
            dark:text-gray-300">
            {note.title}
          </span>" will be permanently deleted.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm
              font-semibold bg-gray-100 dark:bg-gray-800
              hover:bg-gray-200 dark:hover:bg-gray-700
              text-gray-700 dark:text-gray-300
              transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center
              gap-2 py-2.5 rounded-xl text-sm font-semibold
              bg-red-500 hover:bg-red-600 text-white
              shadow-sm shadow-red-500/25
              disabled:opacity-60 transition-all duration-150">
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Notes Page ────────────────────────────────────
export default function NotesPage() {

  const [notes, setNotes]             = useState([])
  const [filtered, setFiltered]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)

  // Modal states
  const [modalOpen, setModalOpen]     = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [deleteNote, setDeleteNote]   = useState(null)

  // Filter states
  const [searchQuery, setSearch]      = useState('')
  const [activeTopic, setTopic]       = useState('All')

  // Load notes on page open
  useEffect(() => {
    loadNotes()
  }, [])

  // Filter whenever notes, search, or topic changes
  useEffect(() => {
    applyFilters()
  }, [notes, searchQuery, activeTopic])

  const loadNotes = async () => {
    setLoading(true)
    try {
      const res = await getNotes()
      setNotes(res.data || [])
    } catch (err) {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  // ── Filter logic ───────────────────────────────────
  const applyFilters = () => {
    let result = [...notes]

    // Filter by topic
    if (activeTopic !== 'All') {
      result = result.filter(n => n.topic === activeTopic)
    }

    // Filter by search query (title and content)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.tag?.toLowerCase().includes(q)
      )
    }

    setFiltered(result)
  }

  // ── Open create modal ──────────────────────────────
  const handleCreate = () => {
    setEditingNote(null)
    setModalOpen(true)
  }

  // ── Open edit modal ────────────────────────────────
  const handleEdit = (note) => {
    setEditingNote(note)
    setModalOpen(true)
  }

  // ── Save note (create or update) ──────────────────
  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (editingNote) {
        // Update existing note
        const res = await updateNote(editingNote.id, formData)
        setNotes(prev => prev.map(n =>
          n.id === editingNote.id ? res.data : n
        ))
        toast.success('Note updated!')
      } else {
        // Create new note
        const res = await createNote(formData)
        setNotes(prev => [res.data, ...prev])
        toast.success('Note saved!')
      }
      setModalOpen(false)
      setEditingNote(null)
    } catch (err) {
      toast.error('Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  // ── Confirm delete ─────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteNote) return
    setDeleting(true)
    try {
      await deleteNote(deleteNote.id)
      setNotes(prev => prev.filter(n =>
        n.id !== deleteNote.id
      ))
      toast.success('Note deleted')
      setDeleteNote(null)
    } catch (err) {
      toast.error('Failed to delete note')
    } finally {
      setDeleting(false)
    }
  }

  // ── Count notes per topic for filter badges ────────
  const topicCounts = TOPICS.reduce((acc, topic) => {
    acc[topic] = topic === 'All'
      ? notes.length
      : notes.filter(n => n.topic === topic).length
    return acc
  }, {})

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900
            dark:text-white mb-1">
            My Notes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
            saved
          </p>
        </div>

        {/* New note button */}
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5
            bg-primary-500 hover:bg-primary-600 text-white
            rounded-xl text-sm font-semibold
            shadow-sm shadow-primary-500/25
            transition-all duration-150">
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Search + filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2
            -translate-y-1/2 w-4 h-4 text-gray-400
            pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes by title or content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl
              border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:border-primary-500 focus:ring-2
              focus:ring-primary-500/20 text-sm
              transition-all duration-150"
          />
          {/* Clear search button */}
          {searchQuery && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2
                -translate-y-1/2 text-gray-400
                hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Topic filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto
        scrollbar-thin pb-1">
        {TOPICS.map(topic => {
          const count = topicCounts[topic]
          if (count === 0 && topic !== 'All') return null

          return (
            <button
              key={topic}
              onClick={() => setTopic(topic)}
              className={`flex-shrink-0 flex items-center
                gap-1.5 px-3 py-1.5 rounded-xl text-sm
                font-medium transition-all duration-150
                ${activeTopic === topic
                  ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}>
              {topic}
              {/* Count badge */}
              <span className={`px-1.5 py-0.5 rounded-md
                text-xs font-bold
                ${activeTopic === topic
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Notes grid */}
      {loading ? (
        // Loading skeleton grid
        <div className="grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i}
              className="h-48 bg-gray-100 dark:bg-gray-800
                rounded-2xl animate-pulse" />
          ))}
        </div>

      ) : filtered.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center
          justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100
            dark:bg-gray-800 rounded-3xl flex items-center
            justify-center mb-4">
            {searchQuery
              ? <Search className="w-10 h-10 text-gray-400" />
              : <StickyNote className="w-10 h-10 text-gray-400" />
            }
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white
            mb-1">
            {searchQuery
              ? 'No notes found'
              : activeTopic !== 'All'
              ? `No ${activeTopic} notes yet`
              : 'No notes yet'
            }
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400
            mb-6 max-w-xs">
            {searchQuery
              ? `No notes matching "${searchQuery}"`
              : 'Create your first note to start organizing your learning!'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5
                bg-primary-500 hover:bg-primary-600 text-white
                rounded-xl text-sm font-semibold
                shadow-sm shadow-primary-500/25
                transition-all duration-150">
              <Plus className="w-4 h-4" />
              Create First Note
            </button>
          )}
        </div>

      ) : (
        // Notes grid
        <div className="grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={setDeleteNote}
            />
          ))}
        </div>
      )}

      {/* Results count when filtering */}
      {(searchQuery || activeTopic !== 'All') &&
        !loading && filtered.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400
          mt-4 text-center">
          Showing {filtered.length} of {notes.length} notes
        </p>
      )}

      {/* Create/Edit Modal */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingNote(null)
        }}
        onSave={handleSave}
        editingNote={editingNote}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        note={deleteNote}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteNote(null)}
        deleting={deleting}
      />

    </div>
  )
}