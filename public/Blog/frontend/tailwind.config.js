/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c5c3ff',
          300: '#a29aff',
          400: '#8066ff',
          500: '#6941ff',
          600: '#5b27f5',
          700: '#4d18e0',
          800: '#4016b8',
          900: '#361494',
        },
        accent: {
          50: '#fff0f9',
          100: '#ffe0f3',
          200: '#ffc2e8',
          300: '#ff93d5',
          400: '#ff53ba',
          500: '#ff1fa3',
          600: '#f0008a',
          700: '#d10072',
          800: '#ac005e',
          900: '#8e0050',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Noto Sans Bengali', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
