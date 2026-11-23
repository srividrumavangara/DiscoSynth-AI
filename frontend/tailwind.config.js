/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          950: '#070d18',
          900: '#0b1329',
          800: '#142144',
          700: '#1e3266',
          600: '#2c488f',
          500: '#3b62be',
          accent: '#0ea5e9'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
