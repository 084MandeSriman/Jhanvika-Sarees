/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: '#6B1E3C',
          light: '#8A2C4E',
          dark: '#4A1329',
        },
        gold: {
          DEFAULT: '#C9A44C',
          light: '#E4C97A',
          dark: '#9C7C33',
        },
        ivory: '#FBF6EE',
        blush: '#E8B4B8',
        forest: '#3A5A40',
        ink: '#2B1B17',
        sand: '#F0E6D6',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        wordmark: ['"Marcellus"', 'serif'],
        body: ['"Jost"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(43, 27, 23, 0.25)',
        card: '0 4px 24px -6px rgba(107, 30, 60, 0.18)',
      },
      backgroundImage: {
        'zari-gradient': 'linear-gradient(135deg, #6B1E3C 0%, #4A1329 100%)',
        'gold-shimmer': 'linear-gradient(120deg, #9C7C33 0%, #E4C97A 45%, #9C7C33 100%)',
      },
      keyframes: {
        drape: {
          '0%': { strokeDashoffset: '1000', opacity: '0' },
          '15%': { opacity: '1' },
          '100%': { strokeDashoffset: '0', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        drape: 'drape 2.2s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        fadeUp: 'fadeUp 0.8s ease-out forwards',
        marquee: 'marquee 24s linear infinite',
      },
    },
  },
  plugins: [],
}
