/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0a',
          dark: '#000000',
        },
        accent: {
          blue: '#6366f1',
          purple: '#8b5cf6',
        },
        border: {
          DEFAULT: '#1f1f1f',
          light: '#2a2a2a',
        },
        text: {
          DEFAULT: '#ffffff',
          muted: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


