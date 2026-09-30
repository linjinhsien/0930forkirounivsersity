/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // AZ-900 Domain colors
        'domain-concepts': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        'domain-services': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        'domain-governance': {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          900: '#581c87',
        },
        // Azure brand palette
        azure: {
          50: '#e6f3fb',
          100: '#cce6f7',
          200: '#99cdef',
          500: '#0078d4',
          600: '#0062ad',
          700: '#004d87',
          900: '#003366',
        },
        // Score level colors
        score: {
          low: '#ef4444',
          mid: '#f59e0b',
          high: '#22c55e',
        },
      },
      spacing: {
        'card-w': '180px',
        'card-h': '240px',
        'slot-w': '200px',
        'slot-h': '260px',
        'board-gap': '1.25rem',
      },
      borderRadius: {
        card: '12px',
        slot: '8px',
      },
      fontSize: {
        'card-name': ['14px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-cost': ['18px', { lineHeight: '1', fontWeight: '700' }],
        'card-desc': ['11px', { lineHeight: '1.4' }],
      },
      animation: {
        'card-place': 'cardPlace 0.2s ease-out',
        'card-shake': 'cardShake 0.3s ease-in-out',
        'score-pop': 'scorePop 0.4s ease-out',
        'timer-pulse': 'timerPulse 1s ease-in-out infinite',
      },
      keyframes: {
        cardPlace: {
          '0%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        cardShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        scorePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        timerPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
