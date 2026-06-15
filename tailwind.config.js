/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        edelweys: {
          bg: '#EEEEE9',
          deep: '#1E3319',
          forest: '#2D4A29',
          sage: '#6B9162',
          light: '#A8C5A0',
          border: '#D5E0D2',
          'border-light': '#C5D5C2',
          text: '#1E3319',
          'text-secondary': '#5A6B57',
          'text-tertiary': '#7A8B76',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'glass': '16px',
        'pill': '99px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(30, 51, 25, 0.08)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'green': '0 8px 24px rgba(107, 145, 98, 0.25)',
        'green-sm': '0 4px 12px rgba(107, 145, 98, 0.3)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'bounce-dot': 'bounce-dot 1.2s infinite',
      },
      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
