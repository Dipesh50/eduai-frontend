// createContext — creates a global "container" for auth state
// useContext — lets any component read from the container
// useState — stores data that can change
// useEffect — runs code when component first loads
import { createContext, useContext, useState, useEffect } from 'react'

// Create the context (like creating an empty box)
const AuthContext = createContext(null)

// AuthProvider wraps your whole app so every page can access auth
export function AuthProvider({ children }) {

  // user = null means not logged in
  // user = { name, email, role } means logged in
  const [user, setUser] = useState(null)

  // loading = true while we check localStorage on first open
  const [loading, setLoading] = useState(true)

  // On app start, check if user was previously logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    // If both exist, restore the login session
    if (token && userData) {
      setUser(JSON.parse(userData))
    }

    // Done checking, hide loading spinner
    setLoading(false)
  }, []) // empty [] = run only once when app starts

  // Called after successful login/register
  const login = (data) => {
    // Save token and user info to browser storage
    // localStorage persists even after closing browser
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      name: data.name,
      email: data.email,
      role: data.role
    }))
    // Update state so UI re-renders immediately
    setUser({ name: data.name, email: data.email, role: data.role })
  }

  // Called when user clicks logout
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)  // triggers redirect to login
  }

  return (
    // Provide user, login, logout, loading to all child components
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — makes it easy to use auth in any component
// Usage: const { user, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext)