import api from './axios'

// GET /api/user/profile — get logged-in user's profile
export const getProfile = () =>
  api.get('/api/user/profile')

// PUT /api/user/profile — update name, college, branch
export const updateProfile = (data) =>
  api.put('/api/user/profile', data)

// GET /api/user/dashboard — quiz count, streak, notes count
export const getDashboard = () =>
  api.get('/api/user/dashboard')