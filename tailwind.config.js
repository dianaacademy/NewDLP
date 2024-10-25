/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",  // Fixed the <components> path
  ],
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'], 
        'outfit-bold': ['Outfit-Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
