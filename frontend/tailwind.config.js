/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#bcdeff',
          300: '#8ec8ff',
          400: '#59a7ff',
          500: '#3082fc',
          600: '#1a64f0',
          700: '#144edc',
          800: '#1740b2',
          900: '#19398c',
          950: '#122355', // Deep trustworthy banking blue
        },
        slate: {
          850: '#151e2e',
        }
      },
    },
  },
  plugins: [],
}
