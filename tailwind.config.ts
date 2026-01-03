import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sora)', ...fontFamily.sans],
        display: ['var(--font-sora)', ...fontFamily.sans]
      },
      colors: {
        midnight: '#0B0F1A',
        aurora: '#6EE7FF',
        plasma: '#9E7BFF',
        carbon: '#111827',
        glass: 'rgba(255,255,255,0.04)'
      },
      boxShadow: {
        glow: '0 10px 50px rgba(110, 231, 255, 0.25)',
        neon: '0 0 40px rgba(158, 123, 255, 0.3)'
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        noise:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0), radial-gradient(circle at 3px 4px, rgba(255,255,255,0.06) 0.8px, transparent 0), radial-gradient(circle at 6px 2px, rgba(255,255,255,0.05) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};

export default config;
