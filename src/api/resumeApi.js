import api from './axios'

// Note: multipart/form-data for PDF file upload
export const analyzeResume = (formData) =>
  api.post('/api/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getResumeHistory = () =>
  api.get('/api/resume/history')