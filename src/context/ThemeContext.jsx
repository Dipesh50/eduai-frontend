import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {

  // Check localStorage for saved theme preference
  // If no preference saved, default to light mode
  const [dark, setDark] = useState(
    localStorage.getItem('theme') === 'dark'
  )

  // When dark changes, update the HTML class and save preference
  useEffect(() => {
    if (dark) {
      // Adding 'dark' class to <html> activates Tailwind dark: styles
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <ThemeContext.Provider value={{
      dark,
      toggle: () => setDark(!dark)  // flip between dark and light
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Usage: const { dark, toggle } = useTheme()
export const useTheme = () => useContext(ThemeContext)