/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#0D5C45', light: '#1a7a5c', dark: '#08402f', 50: '#e8f5f0', 100: '#c5e8db' },
        accent:    { DEFAULT: '#E85C1A', light: '#FF7A3D' },
        surface:   '#F4F6F5',
        card:      '#FFFFFF',
      },
      fontFamily: { sans: ['DM Sans', 'sans-serif'] },
      borderRadius: { xl: '1rem', '2xl': '1.25rem', '3xl': '1.5rem' },
      boxShadow: {
        card:   '0 2px 12px rgba(0,0,0,0.08)',
        modal:  '0 8px 40px rgba(0,0,0,0.18)',
        bottom: '0 -2px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
