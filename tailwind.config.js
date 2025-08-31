/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chef-dark': '#0f0f23',
        'chef-darker': '#1a1a2e',
        'chef-border': '#2d2d5a',
      },
    },
  },
  plugins: [],
}
