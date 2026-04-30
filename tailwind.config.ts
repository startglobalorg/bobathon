import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0077C8',
          hover: '#005FA3',
          soft: '#E5F1FA',
        },
        warm: {
          DEFAULT: '#FF8A6B',
          soft: '#FFE3D8',
          ink: '#A8442C',
        },
        ink: {
          900: '#0F1419',
          600: '#4A5560',
          400: '#8A95A1',
        },
        border: '#E6E8EB',
        surface: { soft: '#F7F8FA' },
        success: { DEFAULT: '#1F9D55', soft: '#E5F5EC', ink: '#1F7A45' },
        error: '#D64545',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(15,20,25,0.06)',
        warm: '0 4px 16px rgba(255,138,107,0.35)',
        sheet: '0 10px 30px rgba(15,20,25,0.18)',
      },
      transitionTimingFunction: {
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [animate],
};

export default config;
