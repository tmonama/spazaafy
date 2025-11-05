/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...colors,                       
        'dark-bg': '#1f2020',
        'dark-surface': '#3c3c3c',
        'dark-input': '#545454',
        'dark-border': '#737373',
        primary: { 
          DEFAULT: '#22c55e', 
          light: '#bbf7d0', 
          dark: '#16a34a' 
        },

        secondary: { 
          DEFAULT: '#ef4444', 
          light: '#fca5a5', 
          dark: '#dc2626' 
        }, 
        danger:    { 
          DEFAULT: '#ef4444', 
          light: '#fca5a5', 
          dark: '#dc2626' 
        }, 
      },
    },
  },
  plugins: [],
}



