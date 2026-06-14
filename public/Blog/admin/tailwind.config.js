/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0edff',
          100: '#e4ddff',
          200: '#cbbeff',
          300: '#a891ff',
          400: '#8a6aff',
          500: '#6941ff',
          600: '#5a2fe8',
          700: '#4b20cd',
          800: '#3d18a7',
          900: '#2e1180',
        },
        accent: {
          400: '#ff52bc',
          500: '#ff1fa3',
          600: '#e6008c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
