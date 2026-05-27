import api from './axios'

export const getNotes = () => api.get('/api/notes')

export const createNote = (data) =>
  api.post('/api/notes', data)

export const updateNote = (id, data) =>
  api.put(`/api/notes/${id}`, data)

export const deleteNote = (id) =>
  api.delete(`/api/notes/${id}`)

export const searchNotes = (keyword) =>
  api.get(`/api/notes/search?keyword=${keyword}`)