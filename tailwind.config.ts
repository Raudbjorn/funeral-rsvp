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
      fontFamily: {
        'serif': ['var(--font-crimson)', 'Crimson Text', 'serif'],
      },
      colors: {
        // Muted, natural color palette
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        lavender: {
          50: '#f8f7ff',
          100: '#f1f0fe',
          200: '#e5e3fd',
          300: '#d1cbfa',
          400: '#b6a8f5',
          500: '#9b82ee',
          600: '#7c5ce4',
          700: '#6744d0',
          800: '#5838ad',
          900: '#4a308b',
        },
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        gold: {
          50: '#fefdf8',
          100: '#fefaec',
          200: '#fbf2c9',
          300: '#f7e896',
          400: '#f2d865',
          500: '#edc545',
          600: '#d9a441',
          700: '#b77d36',
          800: '#946232',
          900: '#794f2b',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-sunset': 'linear-gradient(135deg, #f8f7ff 0%, #f1f0fe 25%, #fefdf8 50%, #f8f7ff 100%)',
      },
    },
  },
  plugins: [],
}
export default config