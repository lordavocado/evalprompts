import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
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
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			// Unified Grayscale System
  			mono: {
  				50: '#fafafa',   // lightest background
  				100: '#f5f5f5',  // subtle background
  				200: '#e5e5e5',  // borders, dividers
  				300: '#d4d4d4',  // disabled elements
  				400: '#a3a3a3',  // placeholder text
  				500: '#737373',  // secondary text
  				600: '#525252',  // primary text
  				700: '#404040',  // headings
  				800: '#262626',  // strong emphasis
  				900: '#171717',  // maximum contrast
  				950: '#0a0a0a'   // pure black alternative
  			},
  			// Status colors in grayscale
  			status: {
  				high: {
  					DEFAULT: 'hsl(0 0% 9%)',      // dark gray for high priority/success
  					foreground: 'hsl(0 0% 98%)',  // white text
  					subtle: 'hsl(0 0% 97%)'       // very light background
  				},
  				medium: {
  					DEFAULT: 'hsl(0 0% 40%)',     // medium gray for medium priority/warning
  					foreground: 'hsl(0 0% 98%)',  // white text
  					subtle: 'hsl(0 0% 95%)'       // light background
  				},
  				low: {
  					DEFAULT: 'hsl(0 0% 60%)',     // lighter gray for low priority/neutral
  					foreground: 'hsl(0 0% 98%)',  // white text
  					subtle: 'hsl(0 0% 98%)'       // very light background
  				}
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
