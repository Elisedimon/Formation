import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './app/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.{js,vue,ts}',
    './pages/**/*.{js,vue,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#faf8f5',
          100: '#f1eee9',
          200: '#e2ddd5',
          300: '#cdc6bb',
          400: '#a49a8d',
          500: '#756b61',
          600: '#574f49',
          700: '#393c48',
          800: '#293247',
          900: '#1c263b',
          950: '#10192c'
        },
        emerald: {
          50: '#fff1eb',
          100: '#ffe2d5',
          200: '#ffc4a9',
          300: '#ffa27d',
          400: '#fb825d',
          500: '#f36b45',
          600: '#e45530',
          700: '#c44224',
          800: '#a33320',
          900: '#81291c',
          950: '#581a13'
        },
        primary: {
          DEFAULT: '#e45530',
          dark: '#a33320',
          light: '#fb825d',
          50: '#fff1eb',
          100: '#ffe2d5'
        },
        navy: {
          DEFAULT: '#1c263b',
          light: '#293247'
        },
        brand: {
          50: '#fff1eb',
          100: '#ffe2d5',
          200: '#ffc4a9',
          300: '#ffa27d',
          400: '#fb825d',
          500: '#f36b45',
          600: '#e45530',
          700: '#c44224',
          800: '#a33320',
          900: '#81291c',
          950: '#581a13'
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309'
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf7f2',
          200: '#f5efe6',
          300: '#ede4d3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        lift: '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
        float: '0 12px 32px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.06)',
        brand: '0 12px 32px rgba(228, 85, 48, 0.18)',
        gold: '0 8px 24px rgba(245, 158, 11, 0.25)',
        card: '0 8px 30px -8px rgba(28, 38, 59, 0.12)'
      },
      backgroundImage: {
        'grid-ink': 'radial-gradient(rgba(15,23,42,.06) 1px, transparent 1px)',
        'mesh-brand': 'radial-gradient(circle at 20% 30%, rgba(228,85,48,.18), transparent 40%), radial-gradient(circle at 80% 70%, rgba(245,158,11,.12), transparent 45%)'
      },
      animation: {
        'fade-up': 'fadeUp .6s cubic-bezier(.22,.68,0,1) both',
        'fade-in': 'fadeIn .4s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(.4,0,.6,1) infinite'
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } }
      }
    }
  },
  plugins: []
}
