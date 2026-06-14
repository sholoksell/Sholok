/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          dark: '#0F1111',
          nav: '#131921',
          secondary: '#232F3E',
          orange: '#FF9900',
          yellow: '#FFD814',
          'yellow-hover': '#F7CA00',
          blue: '#007185',
          'blue-dark': '#005F6B',
          bg: '#EAEDED',
          'bg-alt': '#F0F2F2',
          border: '#D5D9D9',
          'text-gray': '#565959',
          'text-light': '#888C8C',
          red: '#CC0C39',
          green: '#007600',
        },
      },
      fontFamily: {
        sans: ['Arial', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        amazon: '0 2px 5px rgba(15,17,17,.15)',
        'amazon-md': '0 4px 12px rgba(15,17,17,.15)',
        'amazon-lg': '0 8px 20px rgba(15,17,17,.2)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        fadeInDown: 'fadeInDown 0.2s ease-out',
        slideInLeft: 'slideInLeft 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
