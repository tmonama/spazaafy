/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { /* Copy all your custom colors from index.html here */
        'dark-bg': '#1f2020',
        'dark-surface': '#3c3c3c',
        'dark-input': '#545454',
        'dark-border': '#737373',
        primary: {
          DEFAULT: '#22c55e',
          light: '#bbf7d0',
          dark: '#16a34a',
        } 
      }     
    },
  },
  plugins: [],
}

