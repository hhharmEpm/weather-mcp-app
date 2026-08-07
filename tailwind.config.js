/** @type {import('tailwindcss').Config} */

// Our color custom properties (e.g. --primary) hold whatever full color value
// the host sends (oklch(), hex, rgb, ...), not bare HSL channels — so opacity
// modifiers (bg-primary/50) can't just slot an alpha channel in. Wrapping in
// color-mix() lets Tailwind's <alpha-value> substitution keep those working
// regardless of what color format the host uses.
const withAlpha = (variable) =>
  `color-mix(in oklab, var(${variable}) calc(<alpha-value> * 100%), transparent)`;

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./mcp-app.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: withAlpha("--border"),
        input: withAlpha("--input"),
        ring: withAlpha("--ring"),
        background: withAlpha("--background"),
        foreground: withAlpha("--foreground"),
        primary: {
          DEFAULT: withAlpha("--primary"),
          foreground: withAlpha("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withAlpha("--secondary"),
          foreground: withAlpha("--secondary-foreground"),
        },
        destructive: {
          DEFAULT: withAlpha("--destructive"),
          foreground: withAlpha("--destructive-foreground"),
        },
        muted: {
          DEFAULT: withAlpha("--muted"),
          foreground: withAlpha("--muted-foreground"),
        },
        accent: {
          DEFAULT: withAlpha("--accent"),
          foreground: withAlpha("--accent-foreground"),
        },
        card: {
          DEFAULT: withAlpha("--card"),
          foreground: withAlpha("--card-foreground"),
        },
        maroon: {
          700: "#800000",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      // Text utilities (text-sm, font-bold, ...) resolve to the host's
      // MCP UI type-scale variables, with the literal values as fallbacks
      // for standalone/dev use when no host is present.
      fontSize: {
        xs: ["var(--font-text-xs-size, 0.75rem)", "var(--font-text-xs-line-height, 1rem)"],
        sm: ["var(--font-text-sm-size, 0.875rem)", "var(--font-text-sm-line-height, 1.25rem)"],
        base: ["var(--font-text-md-size, 1rem)", "var(--font-text-md-line-height, 1.5rem)"],
        lg: ["var(--font-text-lg-size, 1.125rem)", "var(--font-text-lg-line-height, 1.75rem)"],
        xl: ["var(--font-heading-xs-size, 1.25rem)", "var(--font-heading-xs-line-height, 1.75rem)"],
        "2xl": ["var(--font-heading-sm-size, 1.5rem)", "var(--font-heading-sm-line-height, 2rem)"],
        "3xl": ["var(--font-heading-md-size, 1.875rem)", "var(--font-heading-md-line-height, 2.25rem)"],
        "4xl": ["var(--font-heading-lg-size, 2.25rem)", "var(--font-heading-lg-line-height, 2.5rem)"],
        "5xl": ["var(--font-heading-xl-size, 3rem)", "var(--font-heading-xl-line-height, 1)"],
        "6xl": ["var(--font-heading-2xl-size, 3.75rem)", "var(--font-heading-2xl-line-height, 1)"],
        "7xl": ["var(--font-heading-3xl-size, 4.5rem)", "var(--font-heading-3xl-line-height, 1)"],
      },
      fontWeight: {
        normal: "var(--font-weight-normal, 400)",
        medium: "var(--font-weight-medium, 500)",
        semibold: "var(--font-weight-semibold, 600)",
        bold: "var(--font-weight-bold, 700)",
      },
    },
  },
  plugins: [],
}
