import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
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
    },
  },
  plugins: [animate],
};

export default config;
