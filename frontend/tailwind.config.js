/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1e29',
          card: '#132d46',
          border: 'rgba(255,255,255,0.06)',
          hover: '#0f2438',
          secondary: '#0f2438',
        },
        accent: {
          primary: '#01c38e',
          secondary: '#01c38e',
          success: '#01c38e',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["'Montserrat'", "'Inter'", "ui-sans-serif", "sans-serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(1, 195, 142, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
