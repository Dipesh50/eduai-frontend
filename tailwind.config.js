/** @type {import('tailwindcss').Config} */
export default {
  // 'class' means dark mode is toggled by adding 'dark' class to <html>
  darkMode: 'class',

  // Tell Tailwind which files to scan for class names
  content: [
    './index.html',
    './src/**/*.{js,jsx}'  // scan all .js and .jsx files in src/
  ],

  theme: {
    extend: {
      // Custom brand colors for EduAI (indigo/purple theme)
      colors: {
        primary: {
          50:  '#eef2ff',   // very light indigo (backgrounds)
          100: '#e0e7ff',   // light indigo
          400: '#818cf8',   // medium indigo
          500: '#6366f1',   // main brand color
          600: '#4f46e5',   // darker (hover states)
          700: '#4338ca',   // darkest (active states)
          900: '#312e81',   // very dark (dark mode backgrounds)
        }
      }
    },
  },
  plugins: [],
}