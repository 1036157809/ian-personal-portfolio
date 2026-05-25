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
          primary: '#4A6FA5',
          secondary: '#E8A87C',
          background: '#EEF2F7',
          surface: '#FFFFFF',
          'surface-elevated': '#F7F9FC',
          text: '#2D3748',
          'text-secondary': '#718096',
          border: '#CBD5E0',
          accent: '#68D391',
        },
        night: {
          primary: '#7C9CC9',
          secondary: '#C4B5FD',
          background: '#070B14',
          surface: '#0F1629',
          'surface-elevated': '#162040',
          text: '#D4C8E8',
          'text-secondary': '#8B9BB4',
          border: '#1E2D4A',
          accent: '#6EE7B7',
        }
      }
    },
  },
  plugins: [],
}
