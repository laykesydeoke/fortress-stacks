import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Bitcoin Orange Palette
        bitcoin: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary Bitcoin Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Stacks Purple Palette
        stacks: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9deff',
          300: '#d6c1ff',
          400: '#bc95ff',
          500: '#9d65ff', // Primary Stacks Purple
          600: '#8b3eff',
          700: '#7b2bff',
          800: '#6823d4',
          900: '#571dac',
          950: '#361175',
        },
        // Glass morphism colors
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          black: 'rgba(0, 0, 0, 0.1)',
          bitcoin: 'rgba(249, 115, 22, 0.1)',
          stacks: 'rgba(157, 101, 255, 0.1)',
        },
        // Updated UI colors using our palette
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: '#f97316', // Bitcoin Orange
          foreground: '#ffffff',
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
          900: '#7c2d12',
        },
        secondary: {
          DEFAULT: '#9d65ff', // Stacks Purple  
          foreground: '#ffffff',
          50: '#faf7ff',
          500: '#9d65ff',
          600: '#8b3eff',
          900: '#571dac',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        // Bitcoin-themed gradients
        'bitcoin-gradient': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'bitcoin-radial': 'radial-gradient(circle at center, #f97316 0%, #ea580c 100%)',
        
        // Stacks-themed gradients
        'stacks-gradient': 'linear-gradient(135deg, #9d65ff 0%, #7b2bff 100%)',
        'stacks-radial': 'radial-gradient(circle at center, #9d65ff 0%, #7b2bff 100%)',
        
        // Combined gradients
        'hero-gradient': 'linear-gradient(135deg, #f97316 0%, #9d65ff 50%, #7b2bff 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(157, 101, 255, 0.1) 100%)',
        
        // Animated gradients
        'animated-gradient': 'linear-gradient(-45deg, #f97316, #ea580c, #9d65ff, #7b2bff)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'gradient': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': '0% 50%'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': '100% 50%'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(157, 101, 255, 0.8)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        'display': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'bitcoin': '0 10px 40px rgba(249, 115, 22, 0.3)',
        'stacks': '0 10px 40px rgba(157, 101, 255, 0.3)',
        'neon': '0 0 20px rgba(249, 115, 22, 0.5), 0 0 40px rgba(157, 101, 255, 0.3)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config