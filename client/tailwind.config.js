/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'sans': ['system-ui', 'sans-serif']
      },
      colors: {
        'wisdom-blue': '#1e3a5f',
        'wisdom-gold': '#d4af37',
        'wisdom-cream': '#faf8f3',
        'wisdom-gray': '#6b7280'
      },
      animation: {
        'fade-in': 'fadeIn 1.5s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}