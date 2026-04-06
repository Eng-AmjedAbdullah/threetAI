/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2fb',
          100: '#d5dff5',
          200: '#adc0ec',
          300: '#7a98df',
          400: '#4e72cf',
          500: '#2e53b8',
          600: '#1e3f9a',
          700: '#17317d',
          800: '#122660',
          900: '#0D1B3E',
          950: '#070e22',
        },
        brand: {
          blue:   '#1E6FD9',
          light:  '#38B2FF',
          purple: '#6B4EFF',
          teal:   '#00C2CB',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #0D1B3E 0%, #1E3F9A 50%, #1E6FD9 100%)',
        'card-gradient':    'linear-gradient(135deg, rgba(30,111,217,0.08) 0%, rgba(107,78,255,0.08) 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #0D1B3E 0%, #122660 100%)',
        'mesh-gradient':    'radial-gradient(at 40% 20%, hsla(213,100%,48%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(240,100%,70%,0.10) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(200,100%,60%,0.08) 0px, transparent 50%)',
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(13,27,62,0.08), 0 4px 16px rgba(13,27,62,0.06)',
        'card-lg': '0 4px 6px rgba(13,27,62,0.07), 0 10px 40px rgba(13,27,62,0.10)',
        'glow':    '0 0 20px rgba(30,111,217,0.25)',
        'glow-sm': '0 0 10px rgba(30,111,217,0.18)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-in':   'slideIn 0.4s ease forwards',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:   { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseRing: { '0%,100%': { transform: 'scale(1)', opacity: 0.8 }, '50%': { transform: 'scale(1.05)', opacity: 1 } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
