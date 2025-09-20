/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        md: '2rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    fontSize: {
      xs: ['0.6875rem', { lineHeight: '0.875rem' }],
      sm: ['0.75rem', { lineHeight: '1rem' }],
      base: ['0.8125rem', { lineHeight: '1.25rem' }],
      lg: ['0.9375rem', { lineHeight: '1.375rem' }],
      xl: ['1.0625rem', { lineHeight: '1.5rem' }],
      '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '3xl': ['1.5rem', { lineHeight: '2rem' }],
      '4xl': ['1.875rem', { lineHeight: '2.25rem' }],
    },
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#b8dbff',
          300: '#86c2ff',
          400: '#4aa2ff',
          500: '#1d86ff',
          600: '#096ef0',
          700: '#0757c2',
          800: '#084aa0',
          900: '#0a3e82',
        },
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(2, 6, 23, 0.15)',
      },
    },
  },
  plugins: [],
};
