import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Agrobeus groen - rustig, agrarisch, professioneel
        brand: {
          50:  '#f0f7ee',
          100: '#d8edcf',
          200: '#b5d9a8',
          300: '#8abf7c',
          400: '#65a255',
          500: '#4a8a3a',   // hoofdkleur
          600: '#3a6e2d',
          700: '#2d5422',
          800: '#213d19',
          900: '#162810',
        },
        // Warm beige accent
        earth: {
          50:  '#faf8f4',
          100: '#f0ebe0',
          200: '#ddd3c0',
          300: '#c7b89a',
          400: '#ad9873',
          500: '#957c56',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      // Safe area support voor iPhone notch/onderbalk
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}
export default config
