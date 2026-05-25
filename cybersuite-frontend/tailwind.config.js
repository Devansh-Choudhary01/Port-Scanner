/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:       '#0A0E1A',
          surface:  '#0F1629',
          card:     '#141B2D',
          border:   '#1E2D4A',
          cyan:     '#00D4FF',
          blue:     '#0066FF',
          purple:   '#8B5CF6',
          pink:     '#FF2D78',
          green:    '#00FF88',
          yellow:   '#FFD600',
          orange:   '#FF6B35',
          red:      '#FF2D55',
          text:     '#E2E8F0',
          muted:    '#64748B',
          dim:      '#334155',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-cyan':   '0 0 20px rgba(0, 212, 255, 0.4)',
        'neon-blue':   '0 0 20px rgba(0, 102, 255, 0.4)',
        'neon-green':  '0 0 20px rgba(0, 255, 136, 0.4)',
        'neon-red':    '0 0 20px rgba(255, 45, 85, 0.4)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'cyber-grid':    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E2D4A' fill-opacity='0.4'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'cyber-dots':    "radial-gradient(rgba(0,212,255,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        'dots-sm': '24px 24px',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':        'float 6s ease-in-out infinite',
        'scan-line':    'scanLine 2s linear infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'typing':       'typing 2s steps(20) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        scanLine: {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,212,255,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(0,212,255,0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
