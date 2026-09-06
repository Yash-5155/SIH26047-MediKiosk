/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kiosk: {
          ivory: '#FAF9F5',
          'ivory-dark': '#F2EFE9',
          coral: '#E05D52',
          'coral-hover': '#C94B40',
          'coral-light': '#FCEBEA',
          peach: '#FDF0ED',
          'peach-dark': '#FADCD5',
          blue: '#2B6CB0',
          'blue-hover': '#22548D',
          'blue-light': '#EBF8FF',
          pink: '#FAD2E1',
          'pink-light': '#FDF2F8',
          charcoal: '#1E293B',
          'charcoal-muted': '#64748B',
          surface: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'kiosk-sm': '0 2px 8px rgba(30, 41, 59, 0.04)',
        'kiosk-md': '0 4px 20px rgba(30, 41, 59, 0.08)',
        'kiosk-lg': '0 8px 32px rgba(30, 41, 59, 0.12)',
        'kiosk-coral': '0 4px 16px rgba(224, 93, 82, 0.25)',
      },
      minHeight: {
        'touch': '52px',
      },
      minWidth: {
        'touch': '52px',
      }
    },
  },
  plugins: [],
}
