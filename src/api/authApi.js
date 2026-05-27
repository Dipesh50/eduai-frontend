import api from './axios'

// POST /api/auth/login — returns JWT token
export const loginApi = (data) =>
  api.post('/api/auth/login', data)

// POST /api/auth/register — creates new account
export const registerApi = (data) =>
  api.post('/api/auth/register', data)