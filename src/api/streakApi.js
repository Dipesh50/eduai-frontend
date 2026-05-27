import api from './axios'

export const checkIn = () =>
  api.post('/api/streak/checkin')

export const getStreakStatus = () =>
  api.get('/api/streak/status')