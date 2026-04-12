/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        day: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#1e293b',
        },
        night: {
          primary: '#818cf8',
          secondary: '#a78bfa',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
        }
      }
    },
  },
  plugins: [],
}
