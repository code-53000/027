/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f14',
        panel: '#1a1a24',
        border: '#2a2a3a',
        accent: '#00e5c8',
        'accent-dim': '#00a08c',
        'note-orange': '#ff8c42',
        'note-pink': '#ff5ca0',
        'note-purple': '#a855f7',
        'note-blue': '#3b82f6',
        surface: '#14141e',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
