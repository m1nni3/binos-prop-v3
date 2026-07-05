/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.{html,js}', './routes/*.js', './lib/*.js', './public/*.html'],
  theme: {
    extend: {
      colors: {
        binos: {
          navy: '#0f172a',
          dark: '#1e293b',
          slate: '#334155',
          gray: '#64748b',
          light: '#f1f5f9',
          border: '#e2e8f0',
          blue: '#3b82f6',
          orange: '#f97316',
          pink: '#ec4899',
          purple: '#8b5cf6',
          green: '#22c55e',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          yellow: '#eab308',
          red: '#ef4444',
          sidebar: '#0f172a',
          'sidebar-hover': '#1e293b',
          card: '#ffffff',
          'brand-start': '#3b82f6',
          'brand-end': '#8b5cf6',
          'sidebar-gradient-from': '#0f172a',
          'sidebar-gradient-to': '#1e293b',
        },
        pomp: {
          navy: '#0f172a',
          dark: '#1e293b',
          slate: '#334155',
          gray: '#64748b',
          light: '#f1f5f9',
          border: '#e2e8f0',
          blue: '#3b82f6',
          orange: '#f97316',
          pink: '#ec4899',
          purple: '#8b5cf6',
          green: '#22c55e',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          yellow: '#eab308',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        slideInRight: 'slideInRight 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
