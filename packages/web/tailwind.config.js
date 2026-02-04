/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark background palette
        dark: {
          50: '#1a1a1f',
          100: '#14141a',
          200: '#111116',
          300: '#0d0d12',
          400: '#0a0a0f',
          500: '#08080c',
          600: '#050508',
          700: '#030305',
          800: '#020203',
          900: '#010101',
        },
        // Gold accent
        gold: {
          50: '#fffdf0',
          100: '#fff9d6',
          200: '#fff3ad',
          300: '#ffec85',
          400: '#ffe45c',
          500: '#FFD700', // Main gold
          600: '#d4b200',
          700: '#aa8e00',
          800: '#806b00',
          900: '#554700',
        },
        // Status colors
        success: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        info: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 215, 0, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 215, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
