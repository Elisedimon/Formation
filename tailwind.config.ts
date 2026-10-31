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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(28, 38, 59, 0.08)',
        card: '0 8px 30px -8px rgba(28, 38, 59, 0.12)'
      }
    }
  },
  plugins: []
}
