/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        bangla: {
          green: '#006a4e',
          red: '#f42a41',
          gold: '#f5a623',
          dark: '#0d0d1a',
          surface: '#1a1a2e',
          card: '#16213e',
          border: '#2d2d4e',
        },
      },
      fontFamily: {
        bangla: ['Hind Siliguri', 'SolaimanLipi', 'Kalpurush', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-bangla': 'linear-gradient(135deg, #006a4e 0%, #1a1a2e 50%, #4a044e 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f5a623 0%, #f42a41 100%)',
        'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 30px rgba(139, 92, 246, 0.4)',
        'glow-green': '0 0 30px rgba(0, 106, 78, 0.4)',
        'glow-gold': '0 0 30px rgba(245, 166, 35, 0.4)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'wave': 'wave 1.2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
