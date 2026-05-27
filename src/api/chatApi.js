import api from './axios'

// POST /api/chat/send — send message, get AI reply
export const sendMessage = (data) =>
  api.post('/api/chat/send', data)

// GET /api/chat/history — load previous messages
export const getChatHistory = () =>
  api.get('/api/chat/history')