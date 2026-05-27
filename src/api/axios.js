import axios from 'axios'

// Create axios instance with backend base URL
const api = axios.create({
  baseURL: 'http://localhost:8080',  // your Spring Boot server
  headers: {
    'Content-Type': 'application/json'
  }
})

// REQUEST interceptor — runs before every API call
// Automatically adds JWT token so you don't have to do it manually
api.interceptors.request.use((config) => {
  // Get token from browser storage
  const token = localStorage.getItem('token')

  // If token exists, add it to Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config  // continue with the request
})

// RESPONSE interceptor — runs after every API response
api.interceptors.response.use(
  // Success: just return the response as-is
  (response) => response,

  // Error: check if 403 (token expired/invalid)
  (error) => {
    if (error.response?.status === 403) {
      // Clear stored data and force re-login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api