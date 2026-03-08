import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // iOS System Colors
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-red': '#FF3B30',
        'ios-orange': '#FF9500',
        'ios-yellow': '#FFCC00',
        'ios-purple': '#AF52DE',
        'ios-pink': '#FF2D55',
        'ios-gray': {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        'ios-bg': 'var(--ios-bg)',
        'ios-card': 'var(--ios-card)',
        'ios-text': 'var(--ios-text)',
        'ios-text-secondary': 'var(--ios-text-secondary)',
        'ios-separator': 'var(--ios-separator)',
        'ios-grouped-bg': 'var(--ios-grouped-bg)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'ios': '12px',
        'ios-lg': '16px',
        'ios-xl': '20px',
      },
      boxShadow: {
        'ios': '0 2px 12px var(--ios-shadow)',
        'ios-lg': '0 4px 24px var(--ios-shadow-lg)',
      },
    },
  },
  plugins: [],
}

export default config
