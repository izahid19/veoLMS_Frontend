/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
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
        // Values from user's provided config:
        "surface-bright": "#3a3939",
        "primary": "#ffb693",
        "on-secondary": "#2f3131",
        "secondary": "#c7c6c6",
        "inverse-on-surface": "#313030",
        "surface-container": "#201f1f",
        "surface-container-highest": "#353534",
        "on-primary": "#561f00",
        "surface-container-high": "#2a2a2a",
        "surface-border": "#262626",
        "on-primary-fixed-variant": "#7a3000",
        "tertiary-fixed": "#d0e4ff",
        "surface": "#050505",
        "primary-fixed-dim": "#ffb693",
        "on-error": "#690005",
        "tertiary-container": "#059eff",
        "primary-fixed": "#ffdbcc",
        "on-secondary-fixed-variant": "#464747",
        "secondary-container": "#484949",
        "background": "#050505",
        "on-background": "#e5e2e1",
        "secondary-fixed": "#e3e2e2",
        "on-primary-fixed": "#351000",
        "on-tertiary": "#003257",
        "on-tertiary-container": "#003357",
        "inverse-surface": "#e5e2e1",
        "tertiary": "#9ccaff",
        "grid-line": "rgba(255, 255, 255, 0.05)",
        "outline-variant": "#5a4136",
        "surface-tint": "#ffb693",
        "on-tertiary-fixed": "#001d35",
        "on-secondary-fixed": "#1a1c1c",
        "inverse-primary": "#a04100",
        "surface-container-low": "#1c1b1b",
        "on-primary-container": "#572000",
        "on-surface-variant": "#e2bfb0",
        "on-error-container": "#ffdad6",
        "success-glow": "rgba(255, 107, 0, 0.5)",
        "secondary-fixed-dim": "#c7c6c6",
        "outline": "#a98a7d",
        "error-container": "#93000a",
        "surface-card": "rgba(26, 26, 26, 0.4)",
        "on-secondary-container": "#b8b8b8",
        "error": "#ffb4ab",
        "surface-dim": "#131313",
        "on-tertiary-fixed-variant": "#00497b",
        "surface-container-lowest": "#0e0e0e",
        "on-surface": "#e5e2e1",
        "surface-variant": "#353534",
        "tertiary-fixed-dim": "#9ccaff",
        "primary-container": "#ff6b00"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
        "md": "calc(var(--radius) - 2px)",
        "sm": "calc(var(--radius) - 4px)"
      },
      spacing: {
        "container-max": "1440px",
        "unit": "4px",
        "margin-mobile": "20px",
        "gutter": "24px",
        "section-padding": "96px",
        "margin-desktop": "64px"
      },
      fontFamily: {
        "title-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "title-md": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "display-lg": ["72px", { "lineHeight": "80px", "letterSpacing": "-0.04em", "fontWeight": "700" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "label-sm": ["10px", { "lineHeight": "16px", "letterSpacing": "0.1em", "fontWeight": "600" }]
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        'mesh-gradient': 'radial-gradient(at 0% 0%, #050505 0, transparent 50%), radial-gradient(at 50% 0%, rgba(147, 51, 234, 0.1) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(255, 107, 0, 0.1) 0, transparent 50%)'
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
