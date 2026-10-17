// Theme copied from web/tailwind.config.js so the port renders identically.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,ts}'],
  corePlugins: {
    // The Nuxt site runs without preflight (PrimeVue); headings and paragraphs
    // keep the browser's default margins, and the layout depends on it.
    preflight: false,
  },
  theme: {
    extend: {
      screens: {
        tablet: '960px',
      },
      fontFamily: {
        sans: ['Blinker', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Blinker', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Beiruti', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        negro: { DEFAULT: '#111111', card: '#1B1B1B', soft: '#3A3A3A' },
        crema: { DEFAULT: '#FBF3D8', card: '#F3F0E8', border: '#DFD9C7' },
        amarillo: { DEFAULT: '#F4CF4B', dark: '#E6BB10', light: '#FFF6D6' },
      },
    },
  },
}
