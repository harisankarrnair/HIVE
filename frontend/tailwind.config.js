/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This line activates dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}