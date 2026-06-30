/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f3',
          100: '#fbe4e6',
          200: '#f5c1c8',
          300: '#ed99a5',
          400: '#dd5c70',
          500: '#c32f47',
          600: '#9e1b32',
          700: '#7d1529',
          800: '#5c1020',
          900: '#3f0a16',
          950: '#26060d',
        },
        gold: {
          50: '#fdf9ec',
          100: '#faf0cb',
          200: '#f3dd92',
          300: '#ecc759',
          400: '#e5b431',
          500: '#d59a1f',
          600: '#b67818',
          700: '#915818',
          800: '#774719',
          900: '#653b19',
        },
        emerald2: {
          50: '#ecfdf6',
          100: '#d1faea',
          200: '#a7f3d6',
          300: '#6ee7bb',
          400: '#34d39c',
          500: '#10b981',
          600: '#059468',
          700: '#047656',
          800: '#065e46',
          900: '#064d3b',
        },
      },
      fontFamily: {
        bangla: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(0,0,0,0.08)',
        glow: '0 0 30px -5px rgba(195,47,71,0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
