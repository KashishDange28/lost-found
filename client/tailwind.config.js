/** @type {import('tailwindcss').Config} */
module.exports = { // <-- THIS IS THE FIX
  
  // This is the most important line:
  darkMode: 'class', 
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}