/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Sampled directly from the school crest
        brand: {
          50:  '#eef7f1', 100: '#d3ebdc', 200: '#a7d7ba', 300: '#71bd92',
          400: '#3f9e6c', 500: '#1c7d4b', 600: '#0B5D34',   // primary green
          700: '#094d2b', 800: '#083d23', 900: '#06301c',
        },
        navy: {
          50:  '#eef2f9', 100: '#d6e0f1', 200: '#adc0e2', 300: '#7e9bcf',
          400: '#4f76bb', 500: '#2a55a0', 600: '#16306B',   // crest navy
          700: '#122757', 800: '#0e1f45', 900: '#0a1733',
        },
        gold: {
          50: '#fffaeb', 100: '#fff0c6', 200: '#ffe088', 300: '#ffcb4a',
          400: '#FFB800', 500: '#F5B301',                    // crest gold
          600: '#c78500', 700: '#9c6300', 800: '#7a4d09',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.12)',
        lift: '0 12px 36px -12px rgba(11,93,52,.35)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        fadeUp: 'fadeUp .6s cubic-bezier(.2,.7,.3,1) both',
      },
    },
  },
  plugins: [],
};
