import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out forwards',
        'fadeOut': 'fadeOut 0.3s ease-in-out forwards'
      }
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: (utilities: Record<string, { [key: string]: string | number }>) => void }) {
      const newUtilities = {
        '.font-light-antialiased': {
          'font-weight': '300',
          'font-smoothing': 'antialiased',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'antialiased',
        },
        '.font-extralight-antialiased': {
          'font-weight': '200',
          'letter-spacing': '0.05em',
          'font-smoothing': 'antialiased',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'antialiased',
        },
        '.break-words-anywhere': {
          'overflow-wrap': 'anywhere',
          'word-break': 'break-word',
        },
      }
      addUtilities(newUtilities);
    }
  ],
} satisfies Config;
