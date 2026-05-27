import api from './axios'

export const getTopics = () =>
  api.get('/api/quiz/topics')

export const getQuestions = (topic, limit = 5) =>
  api.get(`/api/quiz/questions?topic=${topic}&limit=${limit}`)

export const getAiQuestions = (topic, limit = 5) =>
  api.get(`/api/quiz/questions/ai?topic=${topic}&limit=${limit}`)

export const submitQuiz = (data) =>
  api.post('/api/quiz/submit', data)

export const getQuizHistory = () =>
  api.get('/api/quiz/history')