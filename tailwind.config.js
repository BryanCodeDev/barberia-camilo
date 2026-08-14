/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        // --- Barber Trébol brand tokens ---
        // Formalized from the hex values already used across Navbar, Footer,
        // and the admin components. Semantic names so new/edited components
        // can reference `bg-ink`, `text-gold`, `border-line`, etc. instead of
        // repeating raw hex. Existing hardcoded hex values still work fine
        // (they're the same colors) — this is additive, not a repaint.
        ink: {
          DEFAULT: '#121113',   // primary dark surface (sidebar, navbar, footer)
          soft: '#1C1A16',      // secondary dark surface / primary text on cream
          panel: '#1B1A1B',     // hover surface on dark backgrounds
          line: '#2A2723',      // borders on dark backgrounds
        },
        cream: {
          DEFAULT: '#F6F2EA',   // page background
          line: '#E4DCC9',      // borders on light backgrounds
        },
        gold: {
          DEFAULT: '#A9812E',   // primary accent / CTA
          light: '#C9A860',     // hover state, highlights on dark bg
          deep: '#8B6A22',      // text-on-cream accent (amber status, links)
        },
        stone: {
          DEFAULT: '#6B6459',   // secondary text on cream
          light: '#9A9488',     // secondary text on dark
          faint: '#B7B1A3',     // tertiary / placeholder text
          dim: '#6E6A61',       // tertiary text on dark
        },
        status: {
          green: { bg: '#EEF5EE', text: '#3E6B3E', deep: '#274627' },
          red: { bg: '#FBEAEA', text: '#8B2E2E' },
          blue: { bg: '#EEF3FB', text: '#3B5B8C', deep: '#1E3352' },
          amber: { bg: '#FBF3E4', text: '#8B6A22', deep: '#4A3812' },
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        // Display serif for headings — a warm, hand-cut face with real
        // craft character (barbershop-appropriate), distinct from the
        // generic Playfair-Display-everywhere default.
        'serif': ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 1px 2px 0 rgba(169, 129, 46, 0.08)',
        'card': '0 1px 3px 0 rgba(28, 26, 22, 0.06), 0 1px 2px -1px rgba(28, 26, 22, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(28, 26, 22, 0.10), 0 8px 10px -6px rgba(28, 26, 22, 0.08)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(169, 129, 46, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in forwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}