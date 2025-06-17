/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scada-blue': '#1e40af',
        'scada-green': '#059669',
        'scada-red': '#dc2626',
        'scada-yellow': '#d97706'
      }
    },
  },
  plugins: [],
}