/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.4' }],
      sm: ['0.9375rem', { lineHeight: '1.5' }],
      base: ['1rem', { lineHeight: '1.6' }],
      lg: ['1.125rem', { lineHeight: '1.55' }],
      xl: ['1.25rem', { lineHeight: '1.45' }],
      '2xl': ['1.5rem', { lineHeight: '1.35' }],
      '3xl': ['1.875rem', { lineHeight: '1.25' }],
      '4xl': ['2.25rem', { lineHeight: '1.2' }],
      '5xl': ['3rem', { lineHeight: '1.1' }],
      '6xl': ['3.75rem', { lineHeight: '1.05' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
		extend: {
  		fontFamily: {
  			sans: [
 				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			]
  		},
  		colors: {
  			graphite: {
  				'50': '#f8fafc',
  				'100': '#f1f5f9',
  				'200': '#e2e8f0',
  				'300': '#cbd5e1',
  				'400': '#94a3b8',
  				'500': '#64748b',
  				'600': '#475569',
  				'700': '#334155',
  				'800': '#1e293b',
  				'900': '#0f172a'
  			},
			blue: {
				'50': '#f6f8fb',
				'100': '#edf2f7',
				'200': '#dbe5f0',
				'300': '#c4d4e5',
				'400': '#98b2cc',
				'500': '#6f90b0',
				'600': '#4f7294',
				'700': '#385a79',
				'800': '#27455f',
				'900': '#173042'
			},
			accent: {
				'50': '#f7f9fc',
				'100': '#eef3f8',
				'200': '#dee8f2',
				'300': '#c8d8e8',
				'400': '#a7bfd6',
				'500': '#7f9fbe',
				'600': '#5f84a6',
				'700': '#496a8d',
				'800': '#38536f',
				'900': '#2a3d53',
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
  			surface: '#ffffff',
			mist: '#f4f6f8',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			'card-soft': '0 10px 24px -18px rgba(15, 23, 42, 0.22)',
  			'card-hover': '0 14px 28px -18px rgba(15, 23, 42, 0.28)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
}
