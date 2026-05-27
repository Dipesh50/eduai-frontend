import api from './axios'

export const startInterview = (data) =>
  api.post('/api/interview/start', data)

// {id} is the interviewId from startInterview response
export const submitAnswer = (id, data) =>
  api.post(`/api/interview/${id}/answer`, data)

export const getInterviewHistory = () =>
  api.get('/api/interview/history')