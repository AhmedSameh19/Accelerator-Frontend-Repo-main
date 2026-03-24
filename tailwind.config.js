/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          card: 'var(--color-bg-card)',
          sidebar: 'var(--color-bg-sidebar)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: 'var(--color-border)',
        brand: {
          blue: 'var(--color-brand-blue)',
          green: 'var(--color-brand-green)',
          orange: 'var(--color-brand-orange)',
          yellow: 'var(--color-brand-yellow)',
        },
      },
      boxShadow: {
        theme: 'var(--color-shadow)',
      },
    },
  },
  plugins: [],
}

