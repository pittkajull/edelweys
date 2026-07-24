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
          bg: '#FAF5EE',
          cream: '#FDF8F3',
          deep: '#2D2A26',
          forest: '#4A5D4A',
          sage: '#7D9B76',
          light: '#A8C4A0',
          warm: '#C4956A',
          gold: '#D4A574',
          clay: '#B88B6A',
          border: '#E8DED4',
          'border-light': '#F0E8DE',
          text: '#2D2A26',
          'text-secondary': '#5C554D',
          'text-tertiary': '#8A8279',
          surface: '#FFFCF8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        'glass': '20px',
        'soft': '24px',
        'pill': '99px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(45, 42, 38, 0.06)',
        'soft-md': '0 8px 30px rgba(45, 42, 38, 0.08)',
        'soft-lg': '0 20px 50px rgba(45, 42, 38, 0.12)',
        'warm': '0 8px 24px rgba(196, 149, 106, 0.2)',
        'warm-sm': '0 4px 12px rgba(196, 149, 106, 0.25)',
        'warm-lg': '0 16px 48px rgba(196, 149, 106, 0.3)',
        'sage': '0 8px 24px rgba(125, 155, 118, 0.2)',
        'sage-sm': '0 4px 12px rgba(125, 155, 118, 0.25)',
        'sage-lg': '0 16px 48px rgba(125, 155, 118, 0.3)',
      },
      backdropBlur: {
        'soft': '20px',
        'soft-lg': '40px',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'breathe': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
